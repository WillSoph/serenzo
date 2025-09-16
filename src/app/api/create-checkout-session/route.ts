// app/api/create-checkout-session/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

type CreateCheckoutBody = {
  empresa: string;
  ramo: string;
  telefone: string;
  responsavel: string;
  email: string;
  senha: string;
  empresaId?: string;
  promoCode?: string;
};

export async function POST(req: NextRequest) {
  const {
    empresa,
    ramo,
    telefone,
    responsavel,
    email,
    senha,
    empresaId,
    promoCode, // opcional
  } = (await req.json()) as CreateCheckoutBody;

  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    const priceId = process.env.STRIPE_PRICE_ID;

    if (!stripeKey) {
      console.error("STRIPE_SECRET_KEY não definida.");
      return NextResponse.json(
        { error: "Configuração inválida do Stripe." },
        { status: 500 }
      );
    }
    if (!priceId) {
      console.error("STRIPE_PRICE_ID não definida.");
      return NextResponse.json(
        { error: "Preço do plano não configurado." },
        { status: 500 }
      );
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2025-06-30.basil",
    });

    // 1) Cria o Customer com metadata rica
    const customer = await stripe.customers.create({
      email,
      metadata: {
        empresaId: empresaId || "",
        email,
        // ⚠️ Evite salvar senha em metadata de forma permanente.
        senha,
        nome: responsavel,
        empresa,
        telefone,
        ramo,
        promoCode: promoCode || "",
      },
    });

    // 2) Se veio um promoCode, tenta localizar para aplicar na sessão
    let discounts: Stripe.Checkout.SessionCreateParams.Discount[] | undefined;
    const code = (promoCode || "").trim();

    if (code) {
      try {
        const found = await stripe.promotionCodes.list({
          code,
          active: true,
          limit: 1,
        });
        const pc = found.data?.[0];
        if (pc?.id) {
          discounts = [{ promotion_code: pc.id }];
        }
      } catch (e) {
        // não bloqueia o checkout se o código for inválido
        console.warn("Falha ao localizar promotion code:", e);
      }
    }

    // 3) Cria a Checkout Session (assinatura)
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      customer: customer.id,

      // Permite inserir códigos no Checkout; aplica o encontrado acima (se houver)
      allow_promotion_codes: true,
      discounts,

      // Metadados úteis também na assinatura
      subscription_data: {
        metadata: {
          empresaId: empresaId || "",
          email,
          promoCode: code || "",
        },
      },

      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cancelado`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Erro ao criar checkout session:", error);
    return NextResponse.json(
      { error: "Erro ao criar checkout." },
      { status: 500 }
    );
  }
}
