// app/api/finalizar-checkout/route.ts
import { dbAdmin, authAdmin } from "@/services/firebaseAdmin";
import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe"; // <- só tipos; em runtime usamos dynamic import

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json();
    if (!sessionId) {
      return NextResponse.json({ error: "sessionId ausente." }, { status: 400 });
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return NextResponse.json({ error: "Stripe não configurado." }, { status: 500 });
    }

    const StripeMod = (await import("stripe")).default;
    const stripe = new StripeMod(stripeKey, { apiVersion: "2025-06-30.basil" });

    // Expande customer e subscription na session
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["customer", "subscription", "subscription.items.data.price"],
    });

    const customer = session.customer as Stripe.Customer;

    const {
      email,
      senha,
      nome: responsavel,
      empresa,
      telefone,
      ramo,
    } = customer?.metadata || {};

    if (!empresa || !ramo || !telefone || !responsavel || !email || !senha) {
      return NextResponse.json(
        { error: "Dados incompletos na metadata do Stripe." },
        { status: 400 }
      );
    }

    // Evita duplicar usuário se a rota for chamada 2x
    let userRecord;
    try {
      userRecord = await authAdmin.getUserByEmail(email);
    } catch {
      userRecord = await authAdmin.createUser({
        email,
        password: senha,
        displayName: responsavel,
      });
    }

    // Mantém seu padrão: uid do RH = empresaId
    const empresaId = userRecord.uid;

    // ====== Dados da assinatura (com fallback de campos) ======
    const sub = session.subscription as Stripe.Subscription | null;

    let stripeSubscriptionId: string | null = null;
    let subscriptionStatus: string | null = null;
    let cancelAt: Date | null = null;
    let currentPeriodEnd: Date | null = null;
    let priceId: string | null = null;

    if (sub) {
      // id e status existem em qualquer versão
      stripeSubscriptionId = sub.id;
      subscriptionStatus = (sub as any).status || null;

      // timestamps: aceitar snake_case e camelCase
      const cancelAtTs =
        (sub as any)?.cancel_at ??
        (sub as any)?.cancelAt ??
        null;

      const currentPeriodEndTs =
        (sub as any)?.current_period_end ??
        (sub as any)?.currentPeriodEnd ??
        null;

      cancelAt = cancelAtTs ? new Date(Number(cancelAtTs) * 1000) : null;
      currentPeriodEnd = currentPeriodEndTs
        ? new Date(Number(currentPeriodEndTs) * 1000)
        : null;

      // price id (expandido)
      priceId =
        (sub as any)?.items?.data?.[0]?.price?.id ??
        null;

      // (opcional) fixe empresaId também na subscription metadata
      if (!(sub as any)?.metadata?.empresaId) {
        await stripe.subscriptions.update(sub.id, {
          metadata: { ...(sub as any).metadata, empresaId },
        });
      }
    } else {
      // fallback: buscar assinatura por customer
      const subs = await stripe.subscriptions.list({
        customer: (customer as any).id,
        status: "all",
        limit: 1,
        expand: ["data.items.data.price"],
      });
      const s = subs.data[0];
      if (s) {
        stripeSubscriptionId = s.id;
        subscriptionStatus = (s as any).status || null;

        const cancelAtTs =
          (s as any)?.cancel_at ??
          (s as any)?.cancelAt ??
          null;
        const currentPeriodEndTs =
          (s as any)?.current_period_end ??
          (s as any)?.currentPeriodEnd ??
          null;

        cancelAt = cancelAtTs ? new Date(Number(cancelAtTs) * 1000) : null;
        currentPeriodEnd = currentPeriodEndTs
          ? new Date(Number(currentPeriodEndTs) * 1000)
          : null;

        priceId = (s as any)?.items?.data?.[0]?.price?.id ?? null;

        if (!(s as any)?.metadata?.empresaId) {
          await stripe.subscriptions.update(s.id, {
            metadata: { ...(s as any).metadata, empresaId },
          });
        }
      }
    }

    // Garanta empresaId nos metadados do Customer (importante para webhooks futuros)
    if (!(customer as any)?.metadata?.empresaId) {
      await stripe.customers.update((customer as any).id, {
        metadata: { ...(customer as any).metadata, empresaId },
      });
    }

    // ------ EMPRESA (merge = não apaga nada) ------
    await dbAdmin.collection("empresas").doc(empresaId).set(
      {
        // seus campos existentes:
        nome: empresa,
        ramo,
        telefone,
        responsavel,
        email,
        tipo: "admin",
        uid: userRecord.uid,
        empresaId,
        criadoEm: new Date().toISOString(),

        // Stripe fields:
        stripeCustomerId: (customer as any).id,
        stripeSubscriptionId,
        subscriptionStatus,
        cancelAt,
        currentPeriodEnd,
        priceId,

        updatedAt: new Date(),
      },
      { merge: true }
    );

    // ------ USUÁRIO RH ------
    await dbAdmin.collection("usuarios").doc(userRecord.uid).set(
      {
        email,
        nome: responsavel,
        tipo: "admin",
        uid: userRecord.uid,
        empresaId,
        criadoEm: new Date().toISOString(),
      },
      { merge: true }
    );

    return NextResponse.json({ message: "Cadastro finalizado com sucesso.", empresaId });
  } catch (err: any) {
    console.error("Erro ao finalizar checkout:", err);
    return NextResponse.json({ error: err.message || "Erro interno" }, { status: 500 });
  }
}
