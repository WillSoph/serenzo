'use client';

import React, { useState } from "react";
import { Modal } from "../components/Dashboard/Modal";
import { httpsCallable } from "firebase/functions";
import { functions, db } from "@/services/firebase";
import { collection, addDoc } from "firebase/firestore";
import { useAuth } from "@/context/useAuth";
import { useUserData } from "@/hooks/useUserData";

export default function ColaboradorDashboard() {
  const [tipo, setTipo] = useState("sugestao");
  const [mensagem, setMensagem] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [respostaIA, setRespostaIA] = useState("");
  const { user } = useAuth();
  const userData = useUserData(user);

  const mensagensEnviadas = [
    {
      id: 1,
      tipo: "crítica",
      conteudo: "A comunicação interna poderia ser mais clara.",
      resposta: "Estamos revisando nossos canais de comunicação. Obrigado pelo feedback!",
    },
    {
      id: 2,
      tipo: "ajuda",
      conteudo: "Tenho sentido muita ansiedade no trabalho.",
      resposta: "Encaminhamos seu pedido ao time de apoio emocional. Você será contatado em breve.",
    },
  ];

  const handleEnviar = async () => {
    if (!mensagem.trim() || !userData) return;

    try {
      const analisarTexto = httpsCallable(functions, "analisarTexto");
      const result = await analisarTexto({ texto: mensagem });
      const { tipoDetectado, resposta } = result.data as {
        tipoDetectado: string;
        resposta: string;
      };

      await addDoc(collection(db, "mensagens"), {
        conteudo: mensagem,
        tipoDetectado,
        respostaIA: resposta,
        empresaId: userData.empresaId,
        nomeUsuario: userData.nome,
        uid: user?.uid,
        createdAt: new Date(),
      });

      setTipo(tipoDetectado);
      setRespostaIA(resposta);
      setShowModal(true);
      setMensagem("");
    } catch (err) {
      console.error("Erro ao enviar mensagem:", err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Modal
        isOpen={showModal}
        title="Mensagem enviada com sucesso!"
        onClose={() => setShowModal(false)}
      >
        <p className="mb-4">
          Obrigado por compartilhar. Em breve o RH poderá responder diretamente aqui.
        </p>
        {respostaIA && (
          <p className="text-sm text-gray-700 mb-4">
            Análise automática: {respostaIA}
          </p>
        )}
        <div className="flex justify-end">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={() => setShowModal(false)}
          >
            Fechar
          </button>
        </div>
      </Modal>

      <h1 className="text-2xl font-bold mb-4 text-center">
        Bem-vindo à sua área de bem-estar
      </h1>

      <div className="bg-white rounded shadow p-4 mb-6">
        <label className="block text-sm font-semibold mb-2">
          Tipo de mensagem:
        </label>
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className="w-full mb-4 border rounded px-3 py-2"
        >
          <option value="sugestao">Sugestão</option>
          <option value="critica">Crítica</option>
          <option value="ajuda">Pedido de Ajuda</option>
        </select>

        <textarea
          placeholder="Digite sua mensagem aqui..."
          className="w-full h-32 border rounded px-3 py-2 mb-4"
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
        />

        <button
          onClick={handleEnviar}
          className="bg-primary text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Enviar
        </button>
      </div>

      <h2 className="text-xl font-semibold mb-2">Mensagens enviadas</h2>
      <div className="space-y-4">
        {mensagensEnviadas.map((msg) => (
          <div key={msg.id} className="border p-4 rounded bg-white shadow-sm">
            <p className="text-sm text-gray-500 mb-1 capitalize">
              Tipo: {msg.tipo}
            </p>
            <p className="mb-2">{msg.conteudo}</p>
            <p className="text-sm text-green-600 border-t pt-2 mt-2">
              Resposta do RH: {msg.resposta}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
