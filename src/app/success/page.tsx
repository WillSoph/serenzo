"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function CheckoutSuccessPage() {
  const [mensagem, setMensagem] = useState("Finalizando cadastro...");
  const router = useRouter();

  useEffect(() => {
    const dados = localStorage.getItem("dadosCadastroEmpresa");

    if (!dados) {
      setMensagem("Dados de cadastro não encontrados.");
      return;
    }

    const finalizarCadastro = async () => {
      try {
        const res = await fetch("/api/finalizar-checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: dados,
        });

        if (!res.ok) {
          throw new Error("Erro ao finalizar cadastro.");
        }

        localStorage.removeItem("dadosCadastroEmpresa");
        setMensagem("Cadastro finalizado com sucesso! Redirecionando...");
        setTimeout(() => router.push("/"), 3000);
      } catch (err: any) {
        setMensagem(err.message || "Erro inesperado.");
      }
    };

    finalizarCadastro();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white shadow-md rounded p-6 max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4">🎉 Obrigado!</h1>
        <p className="text-gray-700">{mensagem}</p>
      </div>
    </div>
  );
}
