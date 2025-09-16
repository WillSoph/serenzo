// app/api/create-checkout-session/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEBUG = process.env.DEBUG_STRIPE === "1";

function debugLog(label: string, payload: any) {
  if (!DEBUG) return;
  try {
    const safe = JSON.parse(
      JSON.stringify(payload, (_k, v) =>
        typeof v === "string" && v.length > 500 ? v.slice(0, 500) + "…[trunc]" : v
      )
    );
    console.log(`[checkout][${label}]`, safe);
  } catch {
    console.log(`[checkout][${label}]`, payload);
  }
}

function maskPhone(t?: string) {
  if (!t) return "";
  return t.replace(/\d(?=\d{2})/g, "•");
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    empresa,
    ramo,
    telefone,
    responsavel,
    email,
    senha,        // ⚠️ não logar/salvar senha aqui em produção
    empresaId,
    promoCode,
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
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    const priceId = process.env.STRIPE_PRICE_ID;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    if (!stripeKey) {
      return NextResponse.json({ error: "Configuração do Stripe ausente (STRIPE_SECRET_KEY)." }, { status: 500 });
    }
    if (!priceId) {
      return NextResponse.json({ error: "Preço do plano não configurado (STRIPE_PRICE_ID)." }, { status: 500 });
    }
    if (!baseUrl || !/^https?:\/\//i.test(baseUrl)) {
      return NextResponse.json({ error: "NEXT_PUBLIC_BASE_URL inválida (precisa começar com http/https)." }, { status: 500 });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-06-30.basil" });

    debugLog("input", {
      empresa,
      ramo,
      telefone: maskPhone(telefone),
      responsavel,
      email,
      empresaId: empresaId || null,
      promoCode: (promoCode || "").trim() || null,
    });

    // 1) Customer com metadados úteis (evite armazenar senha aqui em produção)
    const customer = await stripe.customers.create({
      email,
      metadata: {
        empresaId: empresaId || "",
        email,
        nome: responsavel,
        empresa,
        telefone,
        ramo,
        promoCode: promoCode || "",
      },
    });
    debugLog("customer.created", { id: customer.id });

    // 2) (Opcional) procurar e aplicar promotion code
    let discounts: Stripe.Checkout.SessionCreateParams.Discount[] | undefined;
    const code = (promoCode || "").trim();
    if (code) {
      try {
        const found = await stripe.promotionCodes.list({ code, active: true, limit: 1 });
        const pc = found.data?.[0];
        if (pc?.id) {
          discounts = [{ promotion_code: pc.id }];
          debugLog("promotion_code.found", { code, id: pc.id, coupon: pc.coupon?.id });
        } else {
          debugLog("promotion_code.not_found", { code });
        }
      } catch (e: any) {
        debugLog("promotion_code.error", {
          message: e?.message,
          type: e?.type,
          code: e?.code,
          statusCode: e?.statusCode,
          requestId: e?.requestId,
        });
      }
    }

    // 3) Parâmetros tipados da Checkout Session
    const params: Stripe.Checkout.SessionCreateParams = {
      mode: "subscription",
      // payment_method_types é opcional; Stripe escolhe automaticamente. Descomente se quiser forçar cartão:
      // payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      customer: customer.id,

      // Use EITHER discounts OR allow_promotion_codes
      ...(discounts ? { discounts } : { allow_promotion_codes: true }),

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

    debugLog("session.create.params", params);

    const session = await stripe.checkout.sessions.create(params);

    debugLog("session.created", { id: session.id, url: session.url });
    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    const clean = {
      message: error?.message,
      type: error?.type,
      code: error?.code,
      statusCode: error?.statusCode,
      requestId: error?.requestId,
      rawType: error?.rawType,
      rawMessage: error?.raw?.message,
      rawCode: error?.raw?.code,
      param: error?.param ?? error?.raw?.param,
    };
    console.error("[checkout][error]", clean);
    return NextResponse.json(
      { error: "Erro ao criar checkout.", ...(DEBUG ? { debug: clean } : {}) },
      { status: 500 }
    );
  }
}
