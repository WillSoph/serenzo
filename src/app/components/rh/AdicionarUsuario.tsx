// components/rh/AdicionarUsuario.tsx
"use client";

import { useState } from "react";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { Modal } from "../Dashboard/Modal";

export default function AdicionarUsuario() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const adicionarUsuario = async () => {
    setCarregando(true);
    setErro("");
    try {
      const res = await fetch("/api/adicionar-usuario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, senha }),
      });

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || "Erro ao adicionar usuário.");
      }

      setModalAberto(true);
      setNome("");
      setEmail("");
      setSenha("");
    } catch (err: any) {
      setErro(err.message || "Erro inesperado.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 shadow rounded">
      <h2 className="text-2xl font-bold mb-4">Adicionar Novo Usuário</h2>
        <div className="flex flex-col gap-2">
            <Input
                placeholder="Nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                fullWidth
            />
            <Input
                placeholder="E-mail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
            />
            <Input
                placeholder="Senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                fullWidth
            />

            {erro && <p className="text-red-500 text-sm mt-2">{erro}</p>}

            <Button
                className="mt-4"
                onClick={adicionarUsuario}
                loading={carregando}
                disabled={!nome || !email || !senha}
                fullWidth
            >
                Adicionar
            </Button>
        </div>

      <Modal isOpen={modalAberto} onClose={() => setModalAberto(false)}>
        <div className="p-6">
          <h3 className="text-xl font-semibold text-center mb-2">
            Usuário adicionado com sucesso!
          </h3>
        </div>
      </Modal>
    </div>
  );
}
