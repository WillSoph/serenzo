import { NextRequest, NextResponse } from "next/server";
import { dbAdmin } from "@/services/firebaseAdmin";

export const dynamic = "force-dynamic";

// GET /api/contato-rh?empresaId=...
export async function GET(req: NextRequest) {
  try {
    const empresaId = req.nextUrl.searchParams.get("empresaId");
    if (!empresaId) {
      return NextResponse.json({ error: "empresaId é obrigatório." }, { status: 400 });
    }

    const snap = await dbAdmin.collection("empresas").doc(empresaId).get();
    const contatoRH = (snap.exists ? snap.data()?.contatoRH : null) || null;

    return NextResponse.json({ ok: true, contatoRH });
  } catch (e: any) {
    console.error("GET /contato-rh:", e);
    return NextResponse.json({ error: e?.message || "Erro interno." }, { status: 500 });
  }
}

// POST /api/contato-rh  { empresaId, email, telefone, atendimento }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { empresaId, email = "", telefone = "", atendimento = "" } = body || {};
    if (!empresaId) {
      return NextResponse.json({ error: "empresaId é obrigatório." }, { status: 400 });
    }

    await dbAdmin
      .collection("empresas")
      .doc(empresaId)
      .set(
        {
          contatoRH: {
            email: String(email || ""),
            telefone: String(telefone || ""),
            atendimento: String(atendimento || ""),
            updatedAt: Date.now(),
          },
        },
        { merge: true }
      );

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("POST /contato-rh:", e);
    return NextResponse.json({ error: e?.message || "Erro interno." }, { status: 500 });
  }
}
