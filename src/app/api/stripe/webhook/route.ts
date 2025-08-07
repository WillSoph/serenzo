export const dynamic = "force-dynamic";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { authAdmin, dbAdmin } from "@/services/firebaseAdmin";
import Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("stripe-signature") as string;

  try {
    // ✅ Import Stripe dinamicamente e valide env
    const Stripe = (await import("stripe")).default;
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!stripeKey || !webhookSecret) {
      console.error("🔐 Stripe keys não configuradas corretamente.");
      return NextResponse.json({ error: "Stripe não configurado corretamente" }, { status: 500 });
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2025-06-30.basil",
    });

    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const customerId = session.customer as string;

      const customer = (await stripe.customers.retrieve(customerId)) as Stripe.Customer;
      const metadata = customer.metadata;

      console.log("📦 Metadados recebidos:", metadata);

      if (!metadata || !metadata.email || !metadata.senha) {
        throw new Error("Metadados incompletos na sessão do Stripe.");
      }

      const user = await authAdmin.createUser({
        email: metadata.email,
        password: metadata.senha,
        displayName: metadata.nome
      });

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

      await dbAdmin.collection("usuarios").doc(user.uid).set({
        nome: metadata.nome,
        email: metadata.email,
        empresaId,
        tipo: "rh",
        criadoEm: new Date().toISOString(),
      });

      console.log("✔ Conta criada com sucesso via Webhook.");
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("❌ Erro ao processar Webhook:", err);
    return NextResponse.json({ error: "Erro interno ao processar webhook" }, { status: 500 });
  }
}
