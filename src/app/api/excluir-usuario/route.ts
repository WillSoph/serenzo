// app/api/excluir-usuario/route.ts
import { NextRequest, NextResponse } from "next/server";
import { authAdmin, dbAdmin } from "@/services/firebaseAdmin";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { uid, empresaId: empresaIdFromBody } = await req.json();
    if (!uid) {
      return NextResponse.json({ error: "uid é obrigatório." }, { status: 400 });
    }

    // 1) tenta ler o doc principal para descobrir o empresaId
    const userRef = dbAdmin.collection("usuarios").doc(uid);
    const snap = await userRef.get().catch(() => null);
    const empresaId =
      empresaIdFromBody ||
      (snap?.exists ? (snap.get("empresaId") as string | undefined) : undefined);

    // 2) apaga Firestore em batch (principal + denormalizado)
    const batch = dbAdmin.batch();
    if (snap?.exists) batch.delete(userRef);
    if (empresaId) {
      const denormRef = dbAdmin
        .collection("empresas")
        .doc(empresaId)
        .collection("usuarios")
        .doc(uid);
      batch.delete(denormRef);
    }
    await batch.commit().catch(() => {});

    // 3) apaga do Auth (não falha a operação se der erro aqui)
    await authAdmin.deleteUser(uid).catch(() => null);

    // (Opcional) limpar mensagens do colaborador:
    // await dbAdmin.recursiveDelete(
    //   dbAdmin.collection("mensagens").doc(empresaId).collection("colaboradores").doc(uid)
    // ).catch(()=>{});

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Erro /excluir-usuario:", err);
    return NextResponse.json({ error: err.message || "Erro interno." }, { status: 500 });
  }
}
