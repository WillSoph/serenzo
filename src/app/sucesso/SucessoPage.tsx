"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { useAuth } from "@/context/useAuth";

export default function SuccessPage() {
  const [mensagem, setMensagem] = useState("Finalizando cadastro...");
  const [erro, setErro] = useState("");
  const [cadastroFinalizado, setCadastroFinalizado] = useState(false);

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    const sessionId = searchParams?.get("session_id");
    const dadosLocalStorage = localStorage.getItem("dadosCadastroEmpresa");

    if (!sessionId || !dadosLocalStorage) {
      setMensagem("Sessão do Stripe ou dados do cadastro não encontrados.");
      return;
    }

    const {
      empresa,
      ramo,
      telefone,
      responsavel,
      email,
      senha,
    } = JSON.parse(dadosLocalStorage);

    const finalizarCadastro = async () => {
      try {
        const res = await fetch("/api/finalizar-checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            empresa,
            ramo,
            telefone,
            responsavel,
            email,
            senha,
            sessionId,
          }),
        });

        if (!res.ok) {
          const { error } = await res.json();
          throw new Error(error || "Erro ao finalizar cadastro.");
        }

        setMensagem("Cadastro finalizado! Faça login abaixo para continuar.");
        setEmail(email);
        setSenha(senha);
        setCadastroFinalizado(true);
      } catch (err: any) {
        setMensagem("Erro ao finalizar cadastro.");
        setErro(err.message || "Erro inesperado.");
      }
    };

    finalizarCadastro();
  }, [searchParams]);

  const handleLogin = async () => {
    setCarregando(true);
    setErro("");
    try {
      await login(email, senha);
      router.push("/rh");
    } catch (err: any) {
      setErro(err.message || "Erro ao fazer login");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white shadow-md rounded p-6 max-w-md text-center w-full">
        <h1 className="text-2xl font-bold mb-4">🎉 Obrigado!</h1>
        <p className="text-gray-700 mb-4">{mensagem}</p>

        {cadastroFinalizado && (
          <div className="space-y-3">
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
            {erro && <p className="text-red-500 text-sm">{erro}</p>}
            <Button onClick={handleLogin} loading={carregando} fullWidth>
              Entrar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
