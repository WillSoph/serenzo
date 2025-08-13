// app/reset-password/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { auth } from "@/services/firebase";
import {
  verifyPasswordResetCode,
  confirmPasswordReset,
} from "firebase/auth";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";

export default function ResetPasswordPage() {
  const router = useRouter();
  const search = useSearchParams();

  const oobCode = useMemo(() => search?.get("oobCode") || "", [search]);
  const mode = useMemo(() => search?.get("mode") || "", [search]);

  const [validating, setValidating] = useState(true);
  const [email, setEmail] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Verifica o código recebido no link do e-mail
  useEffect(() => {
    let mounted = true;

    (async () => {
      if (!oobCode || mode !== "resetPassword") {
        setErr("Link inválido ou incompleto.");
        setValidating(false);
        return;
      }
      try {
        const mail = await verifyPasswordResetCode(auth, oobCode);
        if (!mounted) return;
        setEmail(mail);
        setErr(null);
      } catch (e: any) {
        const code = e?.code || "";
        const msg =
          code === "auth/invalid-action-code"
            ? "Este link de redefinição é inválido ou já foi utilizado."
            : code === "auth/expired-action-code"
            ? "Este link de redefinição expirou. Solicite um novo e-mail."
            : "Não foi possível validar o link. Solicite um novo e-mail de redefinição.";
        setErr(msg);
      } finally {
        if (mounted) setValidating(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [oobCode, mode]);

  const passOk =
    password.length >= 8 &&
    /[A-Za-z]/.test(password) &&
    /\d/.test(password); // simples: 8+, letras e número

  const canSubmit = passOk && password === confirm && !submitting && !validating && !!email;

  const onSubmit = async () => {
    if (!oobCode) return;
    setSubmitting(true);
    setErr(null);
    try {
      await confirmPasswordReset(auth, oobCode, password);
      setDone(true);
    } catch (e: any) {
      const code = e?.code || "";
      const msg =
        code === "auth/weak-password"
          ? "Sua nova senha é muito fraca. Use ao menos 8 caracteres, com letras e números."
          : code === "auth/expired-action-code"
          ? "Este link de redefinição expirou. Solicite um novo e-mail."
          : code === "auth/invalid-action-code"
          ? "O link é inválido ou já foi utilizado. Solicite um novo."
          : "Não foi possível redefinir sua senha. Tente novamente.";
      setErr(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (validating) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 sm:p-8 shadow-xl ring-1 ring-black/5">
          <div className="h-6 w-40 bg-slate-200 rounded animate-pulse mb-4" />
          <div className="h-20 w-full bg-slate-200 rounded animate-pulse" />
        </div>
      </main>
    );
  }

  if (done) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 sm:p-8 shadow-xl ring-1 ring-black/5">
          <h1 className="text-2xl font-bold text-emerald-900">Senha redefinida!</h1>
          <p className="text-slate-700 mt-2">
            Sua senha foi atualizada {email ? <>para <span className="font-medium">{email}</span></> : null}. Agora você já pode acessar o sistema.
          </p>
          <div className="mt-6">
            <Button onClick={() => router.push("/login")} fullWidth>
              Ir para o login
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 sm:p-8 shadow-xl ring-1 ring-black/5">
        <h1 className="text-2xl font-bold text-emerald-900">Redefinir senha</h1>
        {email && (
          <p className="text-sm text-slate-600 mt-1">
            Conta: <span className="font-medium">{email}</span>
          </p>
        )}

        {err && (
          <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-rose-800 text-sm">
            {err}
          </div>
        )}

        <div className="mt-5 space-y-3">
          <div className="relative">
            <Input
              type={showPass ? "text" : "password"}
              placeholder="Nova senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
            />
            <button
              type="button"
              onClick={() => setShowPass((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-emerald-700 hover:text-emerald-800"
            >
              {showPass ? "Ocultar" : "Mostrar"}
            </button>
          </div>

          <div className="relative">
            <Input
              type={showConfirm ? "text" : "password"}
              placeholder="Confirmar nova senha"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              fullWidth
            />
            <button
              type="button"
              onClick={() => setShowConfirm((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-emerald-700 hover:text-emerald-800"
            >
              {showConfirm ? "Ocultar" : "Mostrar"}
            </button>
          </div>

          {/* Dicas/validação simples */}
          <ul className="text-xs text-slate-600 mt-1 space-y-1">
            <li className={password.length >= 8 ? "text-emerald-700" : ""}>
              • Mínimo de 8 caracteres
            </li>
            <li className={/[A-Za-z]/.test(password) ? "text-emerald-700" : ""}>
              • Deve conter letras
            </li>
            <li className={/\d/.test(password) ? "text-emerald-700" : ""}>
              • Deve conter números
            </li>
            {password && confirm && (
              <li className={password === confirm ? "text-emerald-700" : "text-rose-700"}>
                • As senhas devem coincidir
              </li>
            )}
          </ul>

          <div className="pt-2">
            <Button onClick={onSubmit} loading={submitting} disabled={!canSubmit} fullWidth>
              Redefinir senha
            </Button>
          </div>

          <div className="text-center">
            <button
              className="text-sm text-emerald-700 hover:text-emerald-800 underline mt-2"
              onClick={() => router.push("/login")}
              type="button"
            >
              Voltar ao login
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
