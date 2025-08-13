// app/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/useAuth";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/services/firebase";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [resetOpen, setResetOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMsg, setResetMsg] = useState<string | null>(null);
  const [resetErr, setResetErr] = useState<string | null>(null);

  const handleLogin = async () => {
    setCarregando(true);
    setErro(null);
    try {
      const role = await login(email, senha);
      const to = role === "admin" ? "/admin" : role === "rh" ? "/rh" : "/colaborador";
      router.push(to);
    } catch (e: any) {
      setErro(e?.message || "Erro ao fazer login");
    } finally {
      setCarregando(false);
    }
  };

  const handleResetPassword = async () => {
    setResetLoading(true);
    setResetMsg(null);
    setResetErr(null);
    try {
      if (!resetEmail) throw new Error("Informe seu e-mail para recuperar a senha.");
      await sendPasswordResetEmail(auth, resetEmail.trim(), {
        url: `${window.location.origin}/reset-password`,
        handleCodeInApp: true, // importante para abrir no seu app/rota
        // opcional: se você usa Firebase Dynamic Links (apps mobile), inclua:
        // dynamicLinkDomain: 'seuapp.page.link'
      });
      setResetMsg(
        "Se este e-mail estiver cadastrado, você receberá um link para redefinir sua senha nos próximos minutos."
      );
    } catch (e: any) {
      const code = e?.code || "";
      const msg =
        code === "auth/invalid-email"
          ? "E-mail inválido."
          : code === "auth/user-not-found"
          ? "Usuário não encontrado para este e-mail."
          : "Não foi possível enviar o e-mail de redefinição. Tente novamente.";
      setResetErr(msg);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 sm:p-8 shadow-xl ring-1 ring-black/5">
        <h1 className="text-2xl font-bold text-center text-emerald-900">Entrar</h1>

        <div className="mt-6 flex flex-col gap-3">
          <Input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
          />
          <Input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            fullWidth
          />

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                setResetEmail(email || "");
                setResetMsg(null);
                setResetErr(null);
                setResetOpen(true);
              }}
              className="text-sm text-emerald-700 hover:text-emerald-800 underline"
            >
              Esqueci minha senha
            </button>
          </div>

          {erro && <div className="text-red-600 text-sm">{erro}</div>}

          <Button onClick={handleLogin} loading={carregando} disabled={!email || !senha} fullWidth>
            Entrar
          </Button>
        </div>
      </div>

      {/* Mini-modal reset */}
      {resetOpen && (
        <>
          <div className="fixed inset-0 bg-slate-900/30" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-lg ring-1 ring-black/5">
              <h3 className="text-lg font-semibold text-slate-900">Redefinir senha</h3>
              <p className="text-sm text-slate-600 mt-1">
                Informe o e-mail da sua conta para enviarmos o link de redefinição.
              </p>

              <div className="mt-3">
                <Input
                  type="email"
                  placeholder="Seu e-mail"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  fullWidth
                />
                {resetErr && <div className="text-red-600 text-sm mt-2">{resetErr}</div>}
                {resetMsg && <div className="text-emerald-700 text-sm mt-2">{resetMsg}</div>}
              </div>

              <div className="mt-4 flex items-center justify-end gap-2">
                <Button variant="ghost" onClick={() => setResetOpen(false)} disabled={resetLoading}>
                  Cancelar
                </Button>
                <Button onClick={handleResetPassword} loading={resetLoading} disabled={!resetEmail}>
                  Enviar link
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
