"use client";

import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/useAuth";
import { useRouter } from "next/navigation";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";

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

export function AuthModal({ onClose }: { onClose: () => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [empresa, setEmpresa] = useState("");
  const [ramo, setRamo] = useState("");
  const [telefone, setTelefone] = useState("");
  const [responsavel, setResponsavel] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { login, tipo } = useAuth();

  const formPreenchido = isLogin
    ? email && senha
    : empresa && ramo && telefone && responsavel && email && senha;

  useEffect(() => {
    const verificarEmail = async () => {
      if (!email || isLogin) return;

      try {
        const res = await fetch("/api/check-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        const data = await res.json();

        if (data.exists) {
          setErro("Este e-mail já está cadastrado. Faça login.");
        } else {
          setErro("");
        }
      } catch {
        setErro("Erro ao verificar e-mail");
      }
    };

    verificarEmail();
  }, [email, isLogin]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const iniciarCheckout = async () => {
    setCarregando(true);
    setErro("");

    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          empresa,
          ramo,
          telefone,
          responsavel,
          email,
          senha,
        }),
      });

      const data = await res.json();

      if (data?.url) {
        localStorage.setItem(
          "dadosCadastroEmpresa",
          JSON.stringify({ empresa, ramo, telefone, responsavel, email, senha })
        );
        window.location.href = data.url;
      } else {
        throw new Error("Erro ao iniciar o checkout.");
      }
    } catch (err: any) {
      setErro(err.message || "Erro inesperado");
    } finally {
      setCarregando(false);
    }
  };

  const handleLogin = async () => {
    setCarregando(true);
    setErro("");
    try {
      await login(email, senha);
      onClose();

      const checkTipoInterval = setInterval(() => {
        if (tipo === "admin") {
          clearInterval(checkTipoInterval);
          router.push("/admin");
        } else if (tipo === "rh") {
          clearInterval(checkTipoInterval);
          router.push("/rh");
        } else if (tipo === "colaborador") {
          clearInterval(checkTipoInterval);
          router.push("/colaborador");
        }
      }, 100);

      setTimeout(() => clearInterval(checkTipoInterval), 5000);
    } catch (err: any) {
      setErro(err.message || "Erro ao fazer login");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="relative bg-white rounded-lg p-8 w-full max-w-md shadow-lg"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl font-bold"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold mb-4 text-center">
          {isLogin ? "Entrar" : "Criar Conta da Empresa"}
        </h2>

        {!isLogin && (
          <div className="flex flex-col gap-2">
            <Input
              placeholder="Nome da Empresa"
              value={empresa}
              onChange={(e) => setEmpresa(e.target.value)}
              fullWidth
            />

            <Select
              value={ramo}
              onChange={(e) => setRamo(e.target.value)}
              options={opcoesRamo.map((r) => ({ label: r, value: r }))}
              fullWidth
              label="Ramo de Atuação"
            />

            <Input
              placeholder="Telefone"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              fullWidth
            />

            <Input
              placeholder="Seu Nome (Admin)"
              value={responsavel}
              onChange={(e) => setResponsavel(e.target.value)}
              fullWidth
            />
          </div>
        )}
        <div className="flex flex-col gap-2 mt-2">
        <Input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
        />

        {!isLogin && (
          <p className="text-xs text-gray-500 mb-2">
            Este será o e-mail usado para acessar como administrador da empresa.
          </p>
        )}

        <Input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          fullWidth
        />

        {erro && !isLogin && <div className="text-red-600 text-sm mb-2">{erro}</div>}

        <Button
          loading={carregando}
          disabled={
            !!erro ||
            (isLogin
              ? !email || !senha
              : !empresa || !ramo || !telefone || !responsavel || !email || !senha)
          }
          onClick={isLogin ? handleLogin : iniciarCheckout}
          fullWidth
        >
          {isLogin ? "Entrar" : "Cadastrar e Pagar"}
        </Button>

        <p className="text-sm text-center mt-4">
          {isLogin ? "Não tem conta?" : "Já tem conta?"}{" "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-600 underline cursor-pointer hover:text-blue-800 transition-colors"
          >
            {isLogin ? "Criar conta" : "Entrar"}
          </button>
        </p>
        </div>
      </div>
    </div>
  );
}
