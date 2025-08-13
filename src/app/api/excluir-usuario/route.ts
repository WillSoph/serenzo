// app/api/excluir-usuario/route.ts
import { NextRequest, NextResponse } from "next/server";
import { authAdmin, dbAdmin } from "@/services/firebaseAdmin";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { uid } = await req.json();
    if (!uid) {
      return NextResponse.json({ error: "uid é obrigatório." }, { status: 400 });
    }

    // apaga doc Firestore (usuarios/{uid})
    await dbAdmin.collection("usuarios").doc(uid).delete().catch(() => null);

    // apaga Auth user
    await authAdmin.deleteUser(uid).catch(() => null);

    // (opcional) se você salvar algo em empresas/{empresaId}/... referente ao user, limpe aqui.

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Erro /excluir-usuario:", err);
    return NextResponse.json({ error: err.message || "Erro interno." }, { status: 500 });
  }
}
