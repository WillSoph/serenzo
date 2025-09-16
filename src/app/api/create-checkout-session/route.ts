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

    if (!stripeKey) {
      console.error("[checkout] Faltando STRIPE_SECRET_KEY");
      return NextResponse.json({ error: "Configuração do Stripe ausente." }, { status: 500 });
    }
    if (!priceId) {
      console.error("[checkout] Faltando STRIPE_PRICE_ID");
      return NextResponse.json({ error: "Plano/Preço não configurado." }, { status: 500 });
    }

    // ⚠️ Não force apiVersion inexistente. Deixe o padrão da lib ou configure no Dashboard.
    const stripe = new Stripe(stripeKey /* , { apiVersion: '2024-06-20' } */);

    // Base URL (fallback para o origin do request)
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      req.headers.get("origin") ||
      "http://localhost:3000";

    // 1) Cria o Customer com metadata (strings!)
    const customer = await stripe.customers.create({
      email: String(email || ""),
      metadata: {
        empresaId: String(empresaId || ""),
        email: String(email || ""),
        // ⚠️ Evite salvar senha aqui em produção. Mantido apenas porque você já usava para onboarding.
        senha: String(senha || ""),
        nome: String(responsavel || ""),
        empresa: String(empresa || ""),
        telefone: String(telefone || ""),
        ramo: String(ramo || ""),
        promoCode: String(promoCode || ""),
      },
    });

    // 2) Tenta pré-aplicar promotion code (se informado)
    let discounts: Array<{ promotion_code: string }> | undefined = undefined;
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
        } else {
          console.warn("[checkout] Promotion code não encontrado ou inativo:", code);
        }
      } catch (e) {
        console.warn("[checkout] Erro ao buscar promotion code:", e);
      }
    }

    // 3) Cria a Checkout Session de assinatura
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      customer: customer.id,

      // Permite digitar código no Checkout; e aplicamos se encontrado acima
      allow_promotion_codes: true,
      ...(discounts ? { discounts } : {}),

      subscription_data: {
        metadata: {
          empresaId: String(empresaId || ""),
          email: String(email || ""),
          promoCode: String(code || ""),
        },
      },

      success_url: `${baseUrl}/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cancelado`,
    });

    if (!session?.url) {
      console.error("[checkout] Session criada sem URL retornada:", session?.id);
      return NextResponse.json(
        { error: "Não foi possível iniciar o checkout." },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    // Log detalhado no servidor (não vaza segredo para o cliente)
    console.error("[checkout] Stripe error:", {
      name: error?.name,
      type: error?.type,
      code: error?.code,
      message: error?.message,
      raw: error?.raw,
    });

    // Mensagem amigável ao cliente
    const friendly =
      error?.code === "resource_missing"
        ? "Recurso do Stripe não encontrado (verifique se PRICE/CUPOM existem no mesmo modo: test ou live)."
        : error?.message || "Erro ao criar checkout.";
    return NextResponse.json({ error: friendly }, { status: 500 });
  }
}
