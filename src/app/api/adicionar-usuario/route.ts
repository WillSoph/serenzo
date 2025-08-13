// app/api/adicionar-usuario/route.ts
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { authAdmin, dbAdmin } from "@/services/firebaseAdmin";

/**
 * Espera receber no body (JSON):
 * { nome: string, email: string, senha: string, empresaId: string, tipo?: "colaborador" | "rh" }
 *
 * Fluxo:
 * - valida campos
 * - verifica se já existe usuário com esse email
 * - cria usuário no Firebase Auth
 * - grava documento em "usuarios/{uid}"
 * - grava documento em "empresas/{empresaId}/usuarios/{uid}"
 */
export async function POST(req: NextRequest) {
  try {
    const { nome, email, senha, empresaId, tipo } = await req.json();

    // Validação simples
    if (!nome || !email || !senha || !empresaId) {
      return NextResponse.json(
        { error: "Campos obrigatórios: nome, email, senha, empresaId." },
        { status: 400 }
      );
    }

    const perfil: "colaborador" | "rh" = (tipo === "rh" ? "rh" : "colaborador");

    // Verifica se já existe usuário com esse email
    let userRecord;
    try {
      userRecord = await authAdmin.getUserByEmail(email);
    } catch {
      // se cair aqui, é porque não encontrou (ok)
    }

    if (userRecord?.uid) {
      return NextResponse.json(
        { error: "E-mail já está cadastrado.", code: "email-already-exists" },
        { status: 409 }
      );
    }

    // Cria usuário no Auth
    const novoUser = await authAdmin.createUser({
      displayName: nome,
      email,
      password: senha,
    });

    const uid = novoUser.uid;
    const agoraISO = new Date().toISOString();

    // Documento principal do usuário
    const usuarioDoc = {
      nome,
      email,
      tipo: perfil,        // "colaborador" (default) ou "rh"
      empresaId,
      criadoEm: agoraISO,
      uid,
    };

    // Grava em "usuarios/{uid}"
    await dbAdmin.collection("usuarios").doc(uid).set(usuarioDoc);

    // Grava também em "empresas/{empresaId}/usuarios/{uid}"
    await dbAdmin
      .collection("empresas")
      .doc(empresaId)
      .collection("usuarios")
      .doc(uid)
      .set({
        uid,
        nome,
        email,
        tipo: perfil,
        criadoEm: agoraISO,
      });

    return NextResponse.json({ ok: true, uid });
  } catch (err: any) {
    // Tratamento de erros comuns do Admin SDK
    const msg = err?.message || "Erro interno.";
    const code = err?.errorInfo?.code || err?.code;

    if (code === "auth/email-already-exists") {
      return NextResponse.json(
        { error: "E-mail já está cadastrado.", code },
        { status: 409 }
      );
    }

    console.error("❌ Erro em /api/adicionar-usuario:", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
