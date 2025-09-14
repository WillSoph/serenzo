// app/api/adicionar-usuario/route.ts
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { authAdmin, dbAdmin } from "@/services/firebaseAdmin";

// normaliza qualquer valor recebido para "admin" | "comum"
function normalizePerfil(v: string | undefined | null): "admin" | "comum" {
  const t = String(v || "").toLowerCase().trim();
  if (t === "rh" || t === "admin") return "admin";
  return "comum"; // colaborador/comum/default
}

export async function POST(req: NextRequest) {
  try {
    const { nome, email, senha, empresaId, tipo, area } = await req.json();

    if (!nome || !email || !senha || !empresaId || !area) {
      return NextResponse.json(
        { error: "Campos obrigatórios: nome, email, senha, empresaId, area." },
        { status: 400 }
      );
    }

    const perfil = normalizePerfil(tipo);

    // já existe?
    let userRecord;
    try {
      userRecord = await authAdmin.getUserByEmail(email);
    } catch {}
    if (userRecord?.uid) {
      return NextResponse.json(
        { error: "E-mail já está cadastrado.", code: "email-already-exists" },
        { status: 409 }
      );
    }

    // cria no Auth
    const novoUser = await authAdmin.createUser({
      displayName: nome,
      email,
      password: senha,
    });

    const uid = novoUser.uid;
    const agoraISO = new Date().toISOString();

    const usuarioDoc = {
      uid,
      nome,
      email,
      tipo: perfil, // "admin" | "comum"
      empresaId,
      area,
      criadoEm: agoraISO,
    };

    await dbAdmin.collection("usuarios").doc(uid).set(usuarioDoc);

    await dbAdmin
      .collection("empresas")
      .doc(empresaId)
      .collection("usuarios")
      .doc(uid)
      .set({
        uid,
        nome,
        email,
        tipo: perfil, // "admin" | "comum"
        area,
        criadoEm: agoraISO,
      });

    return NextResponse.json({ ok: true, uid });
  } catch (err: any) {
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
