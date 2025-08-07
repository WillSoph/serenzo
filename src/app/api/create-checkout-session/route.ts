import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { empresa, ramo, telefone, responsavel, email, senha } = body;

  try {
    const Stripe = (await import("stripe")).default;
    const stripeKey = process.env.STRIPE_SECRET_KEY;

    if (!stripeKey) {
      console.error("STRIPE_SECRET_KEY não definida.");
      return NextResponse.json({ error: "Configuração inválida do Stripe." }, { status: 500 });
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2025-06-30.basil",
    });

    // Crie o customer com metadata ANTES da session
const customer = await stripe.customers.create({
  email,
  metadata: {
    email,
    senha,
    nome: responsavel,
    empresa,
    telefone,
    ramo,
  },
});

// Depois passe esse ID para a session
const session = await stripe.checkout.sessions.create({
  payment_method_types: ["card"],
  mode: "subscription",
  line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
  customer: customer.id,
  success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/sucesso?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cancelado`,
});


    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Erro ao criar checkout session:", error);
    return NextResponse.json({ error: "Erro ao criar checkout." }, { status: 500 });
  }
}
