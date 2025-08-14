// app/api/billing/resume-subscription/route.ts
import { NextResponse } from "next/server";
import { dbAdmin } from "@/services/firebaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return NextResponse.json({ error: "STRIPE_SECRET_KEY ausente" }, { status: 500 });
    }

    const { empresaId } = await req.json();
    if (!empresaId) {
      return NextResponse.json({ error: "empresaId é obrigatório" }, { status: 400 });
    }

    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(stripeKey, {
      apiVersion: "2025-06-30.basil", // mesma versão que você já usa
    });

    const empresaRef = dbAdmin.doc(`empresas/${empresaId}`);
    const snap = await empresaRef.get();
    if (!snap.exists) {
      return NextResponse.json({ error: "Empresa não encontrada" }, { status: 404 });
    }

    const data = snap.data() as any;
    const subscriptionId: string | undefined = data?.stripeSubscriptionId;
    if (!subscriptionId) {
      return NextResponse.json(
        { error: "Assinatura não encontrada para esta empresa" },
        { status: 400 }
      );
    }

    // remove o cancelamento agendado
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });

    // zera o cancelAt e atualiza o status
    await empresaRef.update({
      subscriptionStatus: subscription.status,
      cancelAt: null,
      updatedAt: new Date(),
    });

    return NextResponse.json({
      ok: true,
      status: subscription.status,
    });
  } catch (e: any) {
    console.error("[resume-subscription] error:", e);
    return NextResponse.json(
      { error: "Erro ao retomar assinatura", details: e?.message },
      { status: 500 }
    );
  }
}
