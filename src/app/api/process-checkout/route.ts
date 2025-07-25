// src/app/api/process-checkout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { dbAdmin, authAdmin } from "@/services/firebaseAdmin";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
});

export async function POST(req: NextRequest) {
  const { session_id } = await req.json();

  if (!session_id) {
    return NextResponse.json({ error: "Session ID é obrigatório" }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ["customer"],
    });

    const customer = session.customer as Stripe.Customer;
    const metadata = customer.metadata;

    if (!metadata || !metadata.email || !metadata.senha) {
      return NextResponse.json({ error: "Metadados incompletos." }, { status: 400 });
    }

    // Cria usuário admin primeiro
    const userRecord = await authAdmin.createUser({
      email: metadata.email,
      password: metadata.senha,
      displayName: metadata.nome,
    });

    const empresaId = session.id;

    // Cria documento da empresa
    await dbAdmin.collection("empresas").doc(empresaId).set({
      nomeEmpresa: metadata.nomeEmpresa,
      telefone: metadata.telefone,
      ramo: metadata.ramo,
      emailAdmin: metadata.email,
      uidAdmin: userRecord.uid,
      criadaEm: new Date().toISOString(),
      plano: "mensal-ilimitado",
    });

    // Cria documento do usuário
    await dbAdmin.collection("usuarios").doc(userRecord.uid).set({
      nome: metadata.nome,
      email: metadata.email,
      empresaId,
      tipo: "admin",
      criadoEm: new Date().toISOString(),
    });

    return NextResponse.json({ status: "ok" });
  } catch (error: any) {
    console.error("❌ Erro ao processar checkout:", error);
    return NextResponse.json({ error: error.message || "Erro interno" }, { status: 500 });
  }
}
