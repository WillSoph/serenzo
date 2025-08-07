import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { authAdmin } from "@/services/firebaseAdmin";

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  try {
    await getAuth().getUserByEmail(email);
    return NextResponse.json({ exists: true });
  } catch (error: any) {
    if (error.code === "auth/user-not-found") {
      return NextResponse.json({ exists: false });
    }
    return NextResponse.json({ error: "Erro ao verificar e-mail" }, { status: 500 });
  }
}
