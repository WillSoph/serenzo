// app/api/check-email/route.ts
import { NextRequest, NextResponse } from "next/server";
import { authAdmin } from "@/services/firebaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (typeof email !== "string" || !email.trim()) {
      return NextResponse.json({ error: "E-mail não informado." }, { status: 400 });
    }

    const normalized = email.trim().toLowerCase();

    // Validação simples de formato: evita chamar o Firebase à toa
    const isFormatOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);
    if (!isFormatOk) {
      // 200 com reason clara para o cliente renderizar mensagem abaixo do input
      return NextResponse.json({ exists: false, reason: "invalid-email" });
    }

    // Se existir no Auth, retorna exists=true
    await authAdmin.getUserByEmail(normalized);
    return NextResponse.json({ exists: true, reason: "found" });
  } catch (error: any) {
    // Usuário não existe
    if (error?.code === "auth/user-not-found") {
      return NextResponse.json({ exists: false, reason: "not-found" });
    }
    // Formato inválido reportado pelo SDK (fallback)
    if (error?.code === "auth/invalid-email") {
      return NextResponse.json({ exists: false, reason: "invalid-email" });
    }

    console.error("[check-email] erro inesperado:", error);
    // Só erros realmente inesperados viram 500
    return NextResponse.json({ error: "Erro interno ao verificar e-mail." }, { status: 500 });
  }
}
