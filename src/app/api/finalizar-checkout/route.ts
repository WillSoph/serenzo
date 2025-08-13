// app/api/finalizar-checkout/route.ts
import { dbAdmin, authAdmin } from "@/services/firebaseAdmin";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

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

    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(stripeKey, {
      apiVersion: "2025-06-30.basil",
    });

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["customer"],
    });

    const customer = session.customer as Stripe.Customer;

    const {
      email,
      senha,
      nome: responsavel,
      empresa,
      telefone,
      ramo,
    } = customer.metadata || {};

    if (!empresa || !ramo || !telefone || !responsavel || !email || !senha) {
      return NextResponse.json(
        { error: "Dados incompletos na metadata do Stripe." },
        { status: 400 }
      );
    }

    const userRecord = await authAdmin.createUser({
      email,
      password: senha,
      displayName: responsavel,
    });

    // ⭐ usamos o próprio uid como empresaId (mantém seu fluxo atual)
    const empresaId = userRecord.uid;

    await dbAdmin.collection("empresas").doc(empresaId).set({
      nome: empresa,
      ramo,
      telefone,
      responsavel,
      email,
      tipo: "rh",
      uid: userRecord.uid,
      // ⭐ opcional, mas útil para consultas
      empresaId,
      criadoEm: new Date().toISOString(),
    });

    await dbAdmin.collection("usuarios").doc(userRecord.uid).set({
      email,
      nome: responsavel,
      tipo: "rh",
      uid: userRecord.uid,
      // ⭐ agora o usuário RH já nasce com empresaId
      empresaId,
      criadoEm: new Date().toISOString(),
    });

    // ⭐ devolve empresaId para quem chamar, se quiser usar
    return NextResponse.json({ message: "Cadastro finalizado com sucesso.", empresaId });
  } catch (err: any) {
    console.error("Erro ao finalizar checkout:", err);
    return NextResponse.json({ error: err.message || "Erro interno" }, { status: 500 });
  }
}
