// ColaboradorDashboard.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { Modal } from '../components/Dashboard/Modal';
import { collection, addDoc, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { useAuth } from '@/context/useAuth';
import { useUserData } from '@/hooks/useUserData';
import { Toast } from '../components/ui/Toast';
import { RhHeader } from '../components/rh/RhHeader';
import { ColaboradorSidebar } from '../components/Colaborador/ColaboradorSidebar';

export default function ColaboradorDashboard() {
  const [tipo, setTipo] = useState('sugestao');
  const [mensagem, setMensagem] = useState('');
  const [anonimo, setAnonimo] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [respostaIA, setRespostaIA] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [mensagens, setMensagens] = useState<any[]>([]);
  const [telaAtiva, setTelaAtiva] = useState('home');
  const { user } = useAuth();
  const userData = useUserData(user);
  const [menuAberto, setMenuAberto] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, 'mensagens'),
      where('uid', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dados = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMensagens(dados);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const handleEnviar = async () => {
    if (!mensagem.trim() || !userData) return;

    try {
      const response = await fetch('/api/analisar-texto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texto: mensagem }),
      });

      const { tipoDetectado, resposta } = await response.json();

      await addDoc(collection(db, 'mensagens'), {
        conteudo: mensagem,
        tipoDetectado,
        respostaIA: resposta,
        empresaId: userData.empresaId,
        nomeUsuario: anonimo ? 'Anônimo' : userData.nome,
        uid: user?.uid,
        anonimo,
        createdAt: new Date(),
      });

      setTipo(tipoDetectado);
      setRespostaIA(resposta);
      setShowModal(true);
      setMensagem('');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
    }
  };

  return (
    <div className="flex">
      <ColaboradorSidebar
        telaAtiva={telaAtiva}
        setTelaAtiva={setTelaAtiva}
        mensagensNaoVistas={{ inbox: mensagens.length }}
        menuAberto={menuAberto}
        setMenuAberto={setMenuAberto}
      />

      <div className="flex-1 md:ml-64">
        <RhHeader mensagensNaoVistas={{ inbox: mensagens.length, enviadas: 0, ajuda: 0 }} onMenuClick={() => setMenuAberto(true)} />

        <main className="pt-20 px-6 max-w-3xl mx-auto">
          {showToast && (
            <Toast message="Mensagem enviada com sucesso!" type="success" onClose={() => setShowToast(false)} />
          )}

          <Modal
            isOpen={showModal}
            title="Mensagem enviada com sucesso!"
            onClose={() => setShowModal(false)}
          >
            <p className="mb-4">Obrigado por compartilhar. Em breve o RH poderá responder diretamente aqui.</p>
            {respostaIA && <p className="text-sm text-gray-700 mb-4">Análise automática: {respostaIA}</p>}
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
            {telaAtiva === 'home' ? 'Bem-vindo à sua área de bem-estar' : 'Mensagens Enviadas'}
          </h1>

          {telaAtiva === 'home' && (
            <div className="bg-white rounded shadow p-4 mb-6">
              <label className="block text-sm font-semibold mb-2">Tipo de mensagem:</label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="w-full mb-4 border rounded px-3 py-2"
              >
                <option value="sugestao">Sugestão</option>
                <option value="critica">Crítica</option>
                <option value="elogio">Elogio</option>
                <option value="ajuda">Pedido de Ajuda</option>
              </select>

              <label className="flex items-center gap-2 mb-4">
                <input type="checkbox" checked={anonimo} onChange={() => setAnonimo(!anonimo)} />
                Enviar como anônimo
              </label>

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
          )}

          {telaAtiva === 'mensagens' && (
            <div className="space-y-4">
              {mensagens.map((msg) => (
                <div key={msg.id} className="border p-4 rounded bg-white shadow-sm">
                  <p className="text-sm text-gray-500 mb-1 capitalize">
                    Tipo: {msg.tipoDetectado || msg.tipo}
                  </p>
                  <p className="mb-2">{msg.conteudo}</p>
                  {msg.respostaRH && (
                    <p className="text-sm text-green-600 border-t pt-2 mt-2">
                      Resposta do RH: {msg.respostaRH}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
