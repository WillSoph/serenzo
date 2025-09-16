// app/api/create-checkout-session/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    empresa,
    ramo,
    telefone,
    responsavel,
    email,
    senha,
    empresaId,
    promoCode, // opcional
  } = body as {
    empresa: string;
    ramo: string;
    telefone: string;
    responsavel: string;
    email: string;
    senha: string;
    empresaId?: string;
    promoCode?: string;
  };

  try {
    const Stripe = (await import("stripe")).default;
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    const priceId = process.env.STRIPE_PRICE_ID;
    const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || "").replace(/\/$/, "");

    if (!stripeKey) {
      console.error("STRIPE_SECRET_KEY não definida.");
      return NextResponse.json({ error: "Configuração inválida do Stripe." }, { status: 500 });
    }
    if (!priceId) {
      console.error("STRIPE_PRICE_ID não definida.");
      return NextResponse.json({ error: "Preço do plano não configurado." }, { status: 500 });
    }
    if (!baseUrl) {
      console.error("NEXT_PUBLIC_BASE_URL não definida.");
      return NextResponse.json({ error: "URL pública não configurada." }, { status: 500 });
    }

    const stripe = new Stripe(stripeKey /*, { apiVersion: '2024-06-20' } */);

    // 1) Cria o Customer (metadados úteis pro webhook/admin)
    const customer = await stripe.customers.create({
      email,
      metadata: {
        empresaId: empresaId || "",
        email,
        // ⚠️ Evite guardar senha em metadata em produção; mantenho aqui porque já existia no seu fluxo.
        senha,
        nome: responsavel,
        empresa,
        telefone,
        ramo,
        promoCode: promoCode || "",
      },
    });

    // 2) Se veio um promoCode, tentamos localizá-lo.
    //    Se acharmos, usaremos `discounts`; caso contrário, deixamos `allow_promotion_codes: true`
    //    para o usuário digitar manualmente no Checkout.
    const code = (promoCode || "").trim();
    let discounts: Array<{ promotion_code: string }> | undefined = undefined;
    let allowPromotionCodes = true; // padrão: permitir inserir código no Checkout

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
          allowPromotionCodes = false; // ⚠️ NÃO envie ambos: ou discounts ou allow_promotion_codes
        }
      } catch (e) {
        console.warn("[create-checkout-session] Falha ao localizar promotion code:", e);
        // segue com allowPromotionCodes = true (usuário poderá digitar manualmente)
      }
    }

    // 3) Cria a Checkout Session (assinatura)
    const sessionPayload: any = {
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      customer: customer.id,

      // Use APENAS UM dos dois:
      ...(allowPromotionCodes ? { allow_promotion_codes: true } : {}),
      ...(discounts ? { discounts } : {}),

      subscription_data: {
        metadata: {
          empresaId: empresaId || "",
          email,
          promoCode: code || "",
        },
      },

      success_url: `${baseUrl}/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cancelado`,
    };

    const session = await stripe.checkout.sessions.create(sessionPayload);

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    // Tente expor mensagem do Stripe para facilitar debug
    const msg = error?.raw?.message || error?.message || "Erro ao criar checkout.";
    console.error("Erro ao criar checkout session:", msg, error);
    return NextResponse.json({ error: "Erro ao criar checkout." }, { status: 500 });
  }
}
