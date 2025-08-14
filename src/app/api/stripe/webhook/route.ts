export const dynamic = "force-dynamic";

import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { authAdmin, dbAdmin } from "@/services/firebaseAdmin";

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = (await headers()).get("stripe-signature") as string;

  try {
    const Stripe = (await import("stripe")).default;
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!stripeKey || !webhookSecret) {
      console.error("🔐 Stripe keys não configuradas corretamente.");
      return NextResponse.json({ error: "Stripe não configurado corretamente" }, { status: 500 });
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2025-06-30.basil",
    });

    // Verifica assinatura
    const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as any; // Stripe.Checkout.Session
      const customerId = session.customer as string | null;
      const subscriptionId = session.subscription as string | null;

      // Carrega customer e metadata
      let customer: any = null; // Stripe.Customer
      if (customerId) {
        const c = await stripe.customers.retrieve(customerId);
        if (!("deleted" in c)) customer = c;
      }

      const customerMeta = customer?.metadata ?? {};
      // Metadados da subscription (se já estiver criada)
      let sub: any = null; // Stripe.Subscription
      if (subscriptionId) {
        sub = await stripe.subscriptions.retrieve(subscriptionId);
      }

      // -------- 1) Dados vindos do checkout  --------
      const md = {
        email: customerMeta.email || session.customer_details?.email || "",
        senha: customerMeta.senha || "",
        nome: customerMeta.nome || "",
        empresa: customerMeta.empresa || "",
        telefone: customerMeta.telefone || "",
        ramo: customerMeta.ramo || "",
      };

      // -------- 2) Garantir usuário RH no Firebase Auth (sem duplicar) --------
      let user;
      try {
        user = await authAdmin.getUserByEmail(md.email);
      } catch {
        // não existe -> cria
        user = await authAdmin.createUser({
          email: md.email,
          password: md.senha || Math.random().toString(36).slice(2) + "A1", // fallback seguro
          displayName: md.nome || undefined,
        });
      }

      // -------- 3) Definir empresaId --------
      // prioridade: subscription.metadata.empresaId -> customer.metadata.empresaId -> user.uid
      const empresaIdFromSub = sub?.metadata?.empresaId as string | undefined;
      const empresaIdFromCustomer = customerMeta.empresaId as string | undefined;
      const empresaId = (empresaIdFromSub && empresaIdFromSub.trim()) ||
                        (empresaIdFromCustomer && empresaIdFromCustomer.trim()) ||
                        user.uid;

      // Se o customer ainda não tem empresaId, salva no Stripe para próximos eventos
      if (customerId && !empresaIdFromCustomer) {
        await stripe.customers.update(customerId, {
          metadata: { ...customerMeta, empresaId },
        });
      }

      // -------- 4) Persistir empresa --------
      const empresaRef = dbAdmin.collection("empresas").doc(empresaId);

      // Carrega subscription para status/cancelAt/período
      let status = "incomplete";
      let cancelAt: Date | null = null;
      let currentPeriodEnd: Date | null = null;
      let priceId: string | null = null;

      if (sub) {
        status = sub.status;
        cancelAt = sub.cancel_at ? new Date(sub.cancel_at * 1000) : null;
        currentPeriodEnd = sub.current_period_end ? new Date(sub.current_period_end * 1000) : null;
        priceId = sub.items?.data?.[0]?.price?.id ?? null;
      }

      // Mantém seus campos + adiciona Stripe fields
      await empresaRef.set(
        {
          // seus campos já usados:
          nomeEmpresa: md.empresa || undefined,
          telefone: md.telefone || undefined,
          ramo: md.ramo || undefined,
          emailAdmin: md.email || undefined,
          uidAdmin: user.uid,
          criadaEm: new Date().toISOString(),
          plano: "mensal-ilimitado",

          // Stripe fields:
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId,
          subscriptionStatus: status,
          cancelAt,
          currentPeriodEnd,
          priceId,

          updatedAt: new Date(),
        },
        { merge: true }
      );

      // -------- 5) Vincular usuário RH à empresa --------
      await dbAdmin.collection("usuarios").doc(user.uid).set(
        {
          nome: md.nome || user.displayName || "",
          email: md.email,
          empresaId,
          tipo: "rh",
          criadoEm: new Date().toISOString(),
        },
        { merge: true }
      );

      console.log("✔ Conta/empresa assinante atualizada via Webhook.", {
        empresaId,
        customerId,
        subscriptionId,
        status,
      });
    }

    // (opcional) trate outros eventos: customer.subscription.updated|deleted, invoice.*, etc.

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("❌ Erro ao processar Webhook:", err);
    return NextResponse.json({ error: "Erro interno ao processar webhook" }, { status: 500 });
  }
}
