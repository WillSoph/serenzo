export const dynamic = "force-dynamic";
// app/api/finalizar-checkout/route.ts
import { dbAdmin, authAdmin } from "@/services/firebaseAdmin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      empresa,
      ramo,
      telefone,
      responsavel,
      email,
      senha,
      sessionId, // opcional, pode ser usado futuramente
    } = body;

    if (!empresa || !ramo || !telefone || !responsavel || !email || !senha) {
      return NextResponse.json({ error: "Campos obrigatórios ausentes." }, { status: 400 });
    }

    // Cria o usuário no Firebase Auth (via Admin SDK)
    const userRecord = await authAdmin.createUser({
      email,
      password: senha,
      displayName: responsavel,
    });

    // Salva os dados da empresa no Firestore (Admin SDK)
    await dbAdmin.collection("empresas").doc(userRecord.uid).set({
      nome: empresa,
      ramo,
      telefone,
      responsavel,
      email,
      tipo: "rh", // tipo de usuário padrão: RH
      uid: userRecord.uid,
      criadoEm: new Date().toISOString(),
    });

    return NextResponse.json({ message: "Cadastro finalizado com sucesso." });
  } catch (err: any) {
    console.error("Erro ao finalizar checkout:", err);
    return NextResponse.json({ error: err.message || "Erro interno" }, { status: 500 });
  }
}
