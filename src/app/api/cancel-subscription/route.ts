// app/api/billing/cancel-subscription/route.ts
import { NextResponse } from "next/server";
import { dbAdmin } from "@/services/firebaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type EmpresaDoc = {
  stripeSubscriptionId?: string | null;
  stripeCustomerId?: string | null;
  subscriptionStatus?: string | null;
  cancelAt?: Date | null;
};

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
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-06-30.basil" });

    const empresaRef = dbAdmin.doc(`empresas/${empresaId}`);
    const snap = await empresaRef.get();
    if (!snap.exists) {
      return NextResponse.json({ error: "Empresa não encontrada" }, { status: 404 });
    }

    const empresa = (snap.data() || {}) as EmpresaDoc;

    // 1) Tenta com subscriptionId salvo
    let subscriptionId = empresa.stripeSubscriptionId ?? undefined;

    // 2) Fallback: buscar pela customer (se existir)
    if (!subscriptionId && empresa.stripeCustomerId) {
      // pega as últimas 10 assinaturas (todas)
      const subs = await stripe.subscriptions.list({
        customer: empresa.stripeCustomerId,
        status: "all",
        limit: 10,
        expand: ["data.latest_invoice.payment_intent"],
      });

      // prioriza uma "ativa/trialing", senão pega a mais recente
      const preferred = subs.data.find((s) =>
        ["active", "trialing", "past_due", "unpaid"].includes(s.status)
      ) ?? subs.data[0];

      if (preferred) {
        subscriptionId = preferred.id;
        // persiste no Firestore para próximas chamadas ficarem rápidas
        await empresaRef.update({
          stripeSubscriptionId: subscriptionId,
          subscriptionStatus: preferred.status,
          updatedAt: new Date(),
        });
      }
    }

    if (!subscriptionId) {
      return NextResponse.json(
        { error: "Assinatura não encontrada para esta empresa" },
        { status: 400 }
      );
    }

    // 3) Cancela ao final do ciclo vigente
    const updated = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    await empresaRef.update({
      stripeSubscriptionId: updated.id,
      subscriptionStatus: updated.status,
      cancelAt: updated.cancel_at ? new Date(updated.cancel_at * 1000) : null,
      updatedAt: new Date(),
    });

    return NextResponse.json({
      ok: true,
      status: updated.status,
      cancelAt: updated.cancel_at, // epoch seconds
    });
  } catch (e: any) {
    console.error("[cancel-subscription] error:", e);
    return NextResponse.json(
      { error: "Erro ao cancelar assinatura", details: e?.message },
      { status: 500 }
    );
  }
}
