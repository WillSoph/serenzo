"use client";

import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/useAuth";

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
  const { login } = useAuth();

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
        // ✅ Salva o e-mail para ser acessado na página de sucesso
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
          <>
            <input
              type="text"
              placeholder="Nome da Empresa"
              className="w-full mb-3 px-4 py-2 border rounded"
              value={empresa}
              onChange={(e) => setEmpresa(e.target.value)}
            />
            <input
              type="text"
              placeholder="Ramo de Atuação"
              className="w-full mb-3 px-4 py-2 border rounded"
              value={ramo}
              onChange={(e) => setRamo(e.target.value)}
            />
            <input
              type="text"
              placeholder="Telefone"
              className="w-full mb-3 px-4 py-2 border rounded"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
            />
            <input
              type="text"
              placeholder="Seu Nome (Admin)"
              className="w-full mb-3 px-4 py-2 border rounded"
              value={responsavel}
              onChange={(e) => setResponsavel(e.target.value)}
            />
          </>
        )}

        <input
          type="email"
          placeholder="E-mail"
          className="w-full mb-1 px-4 py-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {!isLogin && (
          <p className="text-xs text-gray-500 mb-2">
            Este será o e-mail usado para acessar como administrador da empresa.
          </p>
        )}

        <input
          type="password"
          placeholder="Senha"
          className="w-full mb-3 px-4 py-2 border rounded"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />

        {erro && <div className="text-red-600 text-sm mb-2">{erro}</div>}

        <button
          disabled={carregando}
          className="bg-primary text-white w-full py-2 rounded hover:bg-blue-700"
          onClick={isLogin ? handleLogin : iniciarCheckout}
        >
          {carregando
            ? "Carregando..."
            : isLogin
            ? "Entrar"
            : "Cadastrar e Pagar"}
        </button>

        <p className="text-sm text-center mt-4">
          {isLogin ? "Não tem conta?" : "Já tem conta?"}{" "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary underline"
          >
            {isLogin ? "Criar conta" : "Entrar"}
          </button>
        </p>
      </div>
    </div>
  );
}
