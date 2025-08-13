// app/api/usuarios-da-empresa/route.ts
import { NextRequest, NextResponse } from "next/server";
import { dbAdmin } from "@/services/firebaseAdmin";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { empresaId } = await req.json();
    if (!empresaId) {
      return NextResponse.json({ error: "empresaId é obrigatório." }, { status: 400 });
    }

    const snap = await dbAdmin
      .collection("usuarios")
      .where("empresaId", "==", empresaId)
      .orderBy("criadoEm", "desc")
      .get();

    const usuarios = snap.docs.map((d) => {
      const data = d.data() || {};
      return {
        uid: d.id,
        nome: data.nome || "",
        email: data.email || "",
        tipo: data.tipo || "colaborador",
        empresaId: data.empresaId || "",
        criadoEm: data.criadoEm || "",
      };
    });

    return NextResponse.json({ usuarios });
  } catch (err: any) {
    console.error("Erro /usuarios-da-empresa:", err);
    return NextResponse.json({ error: err.message || "Erro interno." }, { status: 500 });
  }
}
