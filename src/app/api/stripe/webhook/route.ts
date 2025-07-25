import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { authAdmin, dbAdmin } from "@/services/firebaseAdmin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
});

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("stripe-signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("❌ Erro ao verificar assinatura do webhook:", err);
    return NextResponse.json({ error: "Assinatura inválida" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const customerId = session.customer as string;

    try {
      const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
      const metadata = customer.metadata;

      console.log("📦 Metadados recebidos:", metadata);

      if (!metadata || !metadata.email || !metadata.senha) {
        throw new Error("Metadados incompletos na sessão do Stripe.");
      }

      // ✅ Cria o usuário primeiro
      const user = await authAdmin.createUser({
        email: metadata.email,
        password: metadata.senha,
        displayName: metadata.nome,
      });

      // ✅ Salva dados da empresa
      const empresaId = session.id;

      await dbAdmin.collection("empresas").doc(empresaId).set({
        nomeEmpresa: metadata.empresa,
        telefone: metadata.telefone,
        ramo: metadata.ramo,
        emailAdmin: metadata.email,
        uidAdmin: user.uid,
        criadaEm: new Date().toISOString(),
        plano: "mensal-ilimitado",
      });

      // ✅ Cria registro do usuário
      await dbAdmin.collection("usuarios").doc(user.uid).set({
        nome: metadata.nome,
        email: metadata.email,
        empresaId,
        tipo: "admin",
        criadoEm: new Date().toISOString(),
      });

      console.log("✔ Conta criada com sucesso via Webhook.");
    } catch (error) {
      console.error("❌ Erro ao processar Webhook:", error);
      return NextResponse.json({ error: "Erro interno ao processar webhook" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
