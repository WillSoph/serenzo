// app/api/billing/backfill-subscription/route.ts
import { NextResponse } from "next/server";
import { dbAdmin } from "@/services/firebaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) return NextResponse.json({ error: "STRIPE_SECRET_KEY ausente" }, { status: 500 });

    const { empresaId } = await req.json();
    if (!empresaId) return NextResponse.json({ error: "empresaId é obrigatório" }, { status: 400 });

    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-06-30.basil" });

    const ref = dbAdmin.doc(`empresas/${empresaId}`);
    const snap = await ref.get();
    if (!snap.exists) return NextResponse.json({ error: "Empresa não encontrada" }, { status: 404 });

    const d = snap.data() as any;
    let { stripeCustomerId, stripeSubscriptionId } = d || {};
    const email = d?.email || d?.responsavelEmail || null;

    // 1) Se já tiver subscriptionId, só confirma status e sai
    if (stripeSubscriptionId) {
      const sub = await stripe.subscriptions.retrieve(stripeSubscriptionId);
      await ref.update({
        subscriptionStatus: sub.status,
        cancelAt: sub.cancel_at ? new Date(sub.cancel_at * 1000) : null,
        updatedAt: new Date(),
      });
      return NextResponse.json({ ok: true, stripeCustomerId: sub.customer, stripeSubscriptionId: sub.id, status: sub.status });
    }

    // 2) Se não tiver customerId, tenta localizar pelo e-mail
    if (!stripeCustomerId) {
      if (!email) return NextResponse.json({ error: "Não há stripeCustomerId nem email para buscar no Stripe" }, { status: 400 });
      const customers = await stripe.customers.list({ email, limit: 5 });
      const found = customers.data[0];
      if (!found) return NextResponse.json({ error: "Customer não encontrado no Stripe pelo e-mail" }, { status: 404 });
      stripeCustomerId = found.id;
      await ref.update({ stripeCustomerId, updatedAt: new Date() });
    }

    // 3) Com o customer, busca assinaturas e escolhe a melhor
    const subs = await stripe.subscriptions.list({
      customer: stripeCustomerId,
      status: "all",
      limit: 10,
      expand: ["data.latest_invoice.payment_intent"],
    });

    const preferred =
      subs.data.find((s) => ["active", "trialing", "past_due", "unpaid"].includes(s.status)) ??
      subs.data[0];

    if (!preferred) return NextResponse.json({ error: "Nenhuma assinatura encontrada para o customer" }, { status: 404 });

    stripeSubscriptionId = preferred.id;

    await ref.update({
      stripeSubscriptionId,
      subscriptionStatus: preferred.status,
      cancelAt: preferred.cancel_at ? new Date(preferred.cancel_at * 1000) : null,
      updatedAt: new Date(),
    });

    return NextResponse.json({
      ok: true,
      stripeCustomerId,
      stripeSubscriptionId,
      status: preferred.status,
      cancelAt: preferred.cancel_at,
    });
  } catch (e: any) {
    console.error("[backfill-subscription] error:", e);
    return NextResponse.json({ error: "Erro no backfill", details: e?.message }, { status: 500 });
  }
}
