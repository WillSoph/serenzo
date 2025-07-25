import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db, authAdmin } from "@/services/firebaseAdmin";
import { doc, setDoc } from "firebase/firestore";

// Inicializa o Stripe com sua chave secreta
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
});

export async function POST(req: Request) {
  const body = await req.text();
  const sig = headers().get("stripe-signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Erro ao verificar assinatura do Stripe:", err);
    return NextResponse.json({ error: "Webhook inválido" }, { status: 400 });
  }

  // Escutando o evento de sucesso
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const metadata = session.metadata;
    if (!metadata) {
      return NextResponse.json({ error: "Metadata ausente" }, { status: 400 });
    }

    const { empresa, ramo, telefone, responsavel, email, senha } = metadata;

    try {
      // Cria o usuário
      const userRecord = await authAdmin.createUser({
        email,
        password: senha,
        displayName: responsavel,
      });

      // Salva os dados da empresa
      await setDoc(doc(db, "empresas", userRecord.uid), {
        nome: empresa,
        ramo,
        telefone,
        responsavel,
        email,
        tipo: "rh",
        uid: userRecord.uid,
        criadoEm: new Date().toISOString(),
      });

      console.log("Cadastro finalizado com sucesso via webhook.");
    } catch (err) {
      console.error("Erro ao cadastrar via webhook:", err);
    }
  }

  return NextResponse.json({ received: true });
}
