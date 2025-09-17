// components/Auth/AuthModal.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/useAuth";
import { useRouter } from "next/navigation";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/services/firebase";

const opcoesRamo = [
  "Recursos Humanos",
  "Consultoria Empresarial",
  "Tecnologia da Informação",
  "Educação e Treinamentos",
  "Serviços Financeiros",
  "Contabilidade",
  "Marketing e Publicidade",
  "Agências de Recrutamento",
  "Varejo",
  "Indústria",
  "Construtoras e Engenharia",
  "Saúde e Bem-Estar",
  "Jurídico e Advocacia",
  "Logística e Transporte",
  "Organizações Sem Fins Lucrativos",
  "Cooperativas",
  "Eventos e Produções",
  "Imobiliárias",
  "Call Centers e Atendimento",
  "Outros",
];

const ROLE_TO_ROUTE: Record<string, string> = {
  admin: "/admin",
  rh: "/rh",
  colaborador: "/colaborador",
  comum: "/colaborador",
  user: "/colaborador",
  funcionario: "/colaborador",
};

export function AuthModal({ onClose }: { onClose: () => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [empresa, setEmpresa] = useState("");
  const [ramo, setRamo] = useState("");
  const [telefone, setTelefone] = useState("");
  const [responsavel, setResponsavel] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  // erros separados
  const [emailError, setEmailError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [carregando, setCarregando] = useState(false);

  // promo (opcional)
  const [promoCode, setPromoCode] = useState("");

  // reset de senha
  const [resetOpen, setResetOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMsg, setResetMsg] = useState<string | null>(null);
  const [resetErr, setResetErr] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { login } = useAuth();

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  // fechar ao clicar fora
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [onClose]);

  // verifica e-mail no backend
  const verifyEmailAvailability = async (): Promise<boolean> => {
    if (isLogin) return true; // só no cadastro
    const val = email.trim();
    if (!val) {
      setEmailError("Informe um e-mail.");
      return false;
    }
    try {
      const res = await fetch("/api/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: val }),
      });
      const data = await res.json();

      if (!res.ok) {
        setEmailError(data?.error || "Erro ao verificar e-mail.");
        return false;
      }
      if (data.reason === "invalid-email") {
        setEmailError("E-mail inválido.");
        return false;
      }
      if (data.exists === true) {
        setEmailError("Este e-mail já está cadastrado. Faça login.");
        return false; // 🔒 BLOQUEIA o checkout
      }
      setEmailError("");
      return true;
    } catch {
      setEmailError("Erro ao verificar e-mail.");
      return false;
    }
  };

  // roda apenas no blur (para não spammar a API enquanto digita)
  const checkEmailOnBlur = async () => {
    if (isLogin) return;
    if (!email.trim()) { setEmailError(""); return; }
    await verifyEmailAvailability();
  };

  const iniciarCheckout = async () => {
    setCarregando(true);
    setSubmitError("");
    try {
      // 🔁 validação FINAL antes do Stripe: se e-mail existir, não continua
      if (!isLogin) {
        const ok = await verifyEmailAvailability();
        if (!ok) { setCarregando(false); return; } // 🔒 sem redirecionamento
      }

      const payload = {
        empresa,
        ramo,
        telefone,
        responsavel,
        email: email.trim(),
        senha,
        promoCode: promoCode.trim(),
      };

      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.ok && data?.url) {
        localStorage.setItem(
          "dadosCadastroEmpresa",
          JSON.stringify({ empresa, ramo, telefone, responsavel, email: payload.email, senha })
        );
        window.location.href = data.url;
      } else {
        throw new Error(data?.error || "Erro ao iniciar o checkout.");
      }
    } catch (err: any) {
      setSubmitError(err.message || "Erro inesperado");
    } finally {
      setCarregando(false);
    }
  };

  const handleLogin = async () => {
    setCarregando(true);
    setSubmitError("");
    try {
      const roleRaw = await login(email, senha);
      const roleKey =
        typeof roleRaw === "string"
          ? roleRaw.trim().toLowerCase()
          : typeof roleRaw === "object" && roleRaw && "role" in roleRaw
          ? String((roleRaw as any).role ?? "").trim().toLowerCase()
          : "";
      const destino = roleKey === "admin" ? "/admin" : roleKey === "rh" ? "/rh" : "/colaborador";
      router.replace(destino);
      onClose();
    } catch (e: any) {
      const code = e?.code || "";
      const friendly =
        code === "auth/invalid-email"      ? "E-mail inválido." :
        code === "auth/user-not-found"     ? "Usuário não encontrado." :
        code === "auth/wrong-password" ||
        code === "auth/invalid-credential" ? "E-mail ou senha incorretos." :
        code === "auth/too-many-requests"  ? "Muitas tentativas. Tente novamente em alguns minutos." :
        code === "auth/user-disabled"      ? "Esta conta está desativada." :
                                             e?.message || "Erro ao fazer login.";
      setSubmitError(friendly);
    } finally {
      setCarregando(false);
    }
  };

  const openReset = () => {
    setResetEmail(email || "");
    setResetMsg(null);
    setResetErr(null);
    setResetOpen(true);
  };

  const handleResetPassword = async () => {
    setResetLoading(true);
    setResetMsg(null);
    setResetErr(null);
    try {
      if (!resetEmail) throw new Error("Informe seu e-mail para recuperar a senha.");
      await sendPasswordResetEmail(auth, resetEmail.trim());
      setResetMsg("Se este e-mail estiver cadastrado, você receberá um link para redefinir sua senha nos próximos minutos.");
    } catch (e: any) {
      const code = e?.code || "";
      const msg =
        code === "auth/invalid-email" ? "E-mail inválido." :
        code === "auth/user-not-found" ? "Usuário não encontrado para este e-mail." :
        "Não foi possível enviar o e-mail de redefinição. Tente novamente.";
      setResetErr(msg);
    } finally {
      setResetLoading(false);
    }
  };

  const canSubmit = carregando
    ? false
    : isLogin
    ? !!email && !!senha
    : !!empresa && !!ramo && !!telefone && !!responsavel && !!email && !!senha && !emailError;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-[2px]" aria-hidden="true" />

      {/* Painel */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          className="relative w-full max-w-md rounded-2xl bg-white text-slate-900 shadow-xl ring-1 ring-black/5"
        >
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer"
          >
            ✕
          </button>

          <div className="p-6 sm:p-8">
            <h2 className="text-2xl font-bold mb-4 text-center">
              {isLogin ? "Entrar" : "Criar Conta da Empresa"}
            </h2>

            {!isLogin && (
              <div className="flex flex-col gap-2">
                <Input
                  placeholder="Nome da Empresa"
                  value={empresa}
                  onChange={(e) => { setEmpresa(e.target.value); setSubmitError(""); }}
                  fullWidth
                />
                <Select
                  value={ramo}
                  onChange={(e) => { setRamo(e.target.value); setSubmitError(""); }}
                  options={opcoesRamo.map((r) => ({ label: r, value: r }))}
                  fullWidth
                  label="Ramo de Atuação"
                />
                <Input
                  placeholder="Telefone"
                  value={telefone}
                  onChange={(e) => { setTelefone(e.target.value); setSubmitError(""); }}
                  fullWidth
                />
                <Input
                  placeholder="Seu Nome (Admin)"
                  value={responsavel}
                  onChange={(e) => { setResponsavel(e.target.value); setSubmitError(""); }}
                  fullWidth
                />

                {/* Código promocional (opcional) */}
                <Input
                  placeholder="Código promocional (opcional)"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.trim())}
                  fullWidth
                />
                <p className="text-xs text-slate-500 -mt-1">
                  Se você recebeu um código (ex.: SERENZO1M), informe aqui. Também é possível aplicar direto no Checkout.
                </p>
              </div>
            )}

            <div className="flex flex-col gap-2 mt-2">
              <Input
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setSubmitError("");
                  if (!isLogin) setEmailError(""); // limpa enquanto digita (valida no blur)
                }}
                onBlur={checkEmailOnBlur}
                fullWidth
              />
              {!isLogin && emailError && (
                <div className="text-red-600 text-sm -mt-1">{emailError}</div>
              )}

              {!isLogin && (
                <p className="text-xs text-slate-500 mb-2">
                  Este será o e-mail usado para acessar como administrador da empresa.
                </p>
              )}

              <Input
                type="password"
                placeholder="Senha"
                value={senha}
                onChange={(e) => { setSenha(e.target.value); setSubmitError(""); }}
                fullWidth
              />

              {isLogin && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={openReset}
                    className="text-sm text-emerald-700 hover:text-emerald-800 underline cursor-pointer"
                  >
                    Esqueci minha senha
                  </button>
                </div>
              )}

              <Button
                loading={carregando}
                disabled={!canSubmit}
                onClick={isLogin ? handleLogin : iniciarCheckout}
                fullWidth
                className="cursor-pointer"
              >
                {isLogin ? "Entrar" : "Cadastrar e Pagar"}
              </Button>

              {submitError && (
                <div className="text-red-600 text-sm mt-2" role="alert">
                  {submitError}
                </div>
              )}

              <p className="text-sm text-center mt-4">
                {isLogin ? "Não tem conta?" : "Já tem conta?"}{" "}
                <button
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setSubmitError("");
                    setEmailError("");
                  }}
                  className="text-emerald-700 underline hover:text-emerald-800 transition-colors cursor-pointer"
                >
                  {isLogin ? "Criar conta" : "Entrar"}
                </button>
              </p>
            </div>
          </div>

          {resetOpen && (
            <>
              <div className="absolute inset-0 rounded-2xl bg-white/70 backdrop-blur-sm" />
              <div className="absolute inset-0 flex items-center justify-center p-4">
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
                    <Button variant="ghost" onClick={() => setResetOpen(false)} disabled={resetLoading} className="cursor-pointer">
                      Cancelar
                    </Button>
                    <Button onClick={handleResetPassword} loading={resetLoading} disabled={!resetEmail} className="cursor-pointer">
                      Enviar link
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
