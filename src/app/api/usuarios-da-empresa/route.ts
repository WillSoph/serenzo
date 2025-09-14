// app/api/usuarios-da-empresa/route.ts
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { dbAdmin } from "@/services/firebaseAdmin";

type UsuarioLite = {
  uid: string;
  nome: string;
  email: string;
  tipo: string;
  empresaId: string;
  criadoEm?: string;
  area?: string;
};

export async function POST(req: NextRequest) {
  try {
    const { empresaId } = await req.json();

    if (!empresaId) {
      return NextResponse.json(
        { error: "empresaId é obrigatório." },
        { status: 400 }
      );
    }

    // 1) Tenta ler da subcoleção empresas/{empresaId}/usuarios (onde já salvamos `area`)
    const subSnap = await dbAdmin
      .collection("empresas")
      .doc(empresaId)
      .collection("usuarios")
      .get();

    let usuarios: UsuarioLite[] = [];

    if (!subSnap.empty) {
      usuarios = subSnap.docs.map((d) => {
        const data = d.data() as any;
        return {
          uid: data.uid ?? d.id,
          nome: data.nome ?? "",
          email: data.email ?? "",
          tipo: data.tipo ?? "",     // pode ser "admin"/"comum" ou legado "rh"/"colaborador"
          empresaId,
          criadoEm: data.criadoEm,
          area: data.area ?? "",     // ✅ garante `area`
        };
      });
    } else {
      // 2) Fallback: traz da coleção global usuarios filtrando por empresaId
      const globalSnap = await dbAdmin
        .collection("usuarios")
        .where("empresaId", "==", empresaId)
        .get();

      usuarios = globalSnap.docs.map((d) => {
        const data = d.data() as any;
        return {
          uid: d.id,
          nome: data.nome ?? "",
          email: data.email ?? "",
          tipo: data.tipo ?? "",
          empresaId: data.empresaId ?? empresaId,
          criadoEm: data.criadoEm,
          area: data.area ?? "",     // ✅ tenta capturar `area` aqui também
        };
      });
    }

    // Ordena por nome (opcional)
    usuarios.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));

    return NextResponse.json({ usuarios });
  } catch (err: any) {
    console.error("❌ /api/usuarios-da-empresa error:", err);
    return NextResponse.json(
      { error: err?.message || "Erro interno." },
      { status: 500 }
    );
  }
}
