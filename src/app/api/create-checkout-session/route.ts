// app/api/create-checkout-session/route.ts
import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil", // ou mais recente que funcione
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { empresa, ramo, telefone, responsavel, email, senha } = body;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID!,
          quantity: 1,
        },
      ],
      success_url: `${req.nextUrl.origin}/sucesso`,
      cancel_url: `${req.nextUrl.origin}/erro`,
      metadata: {
        empresa,
        ramo,
        telefone,
        responsavel,
        email,
        senha,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Erro ao criar sessão do Stripe:", err);
    return NextResponse.json(
      { error: err.message || "Erro ao criar sessão" },
      { status: 500 }
    );
  }
}
