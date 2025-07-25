import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { empresa, ramo, telefone, responsavel, email, senha } = await req.json();

  // ⚠️ Mova o import e inicialização do Stripe AQUI dentro
  const Stripe = (await import("stripe")).default;
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-06-30.basil",
  });

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer_creation: "always",
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID!,
          quantity: 1,
        },
      ],
      metadata: {
        empresa,
        ramo,
        telefone,
        nome: responsavel,
        email,
        senha,
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cancelado`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Erro ao criar checkout session:", error);
    return NextResponse.json({ error: "Erro ao criar checkout." }, { status: 500 });
  }
}
