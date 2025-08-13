// app/colaborador/page.tsx (ColaboradorDashboard.tsx)
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Modal } from '../components/Dashboard/Modal';
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  limit,
} from 'firebase/firestore';
import { db } from '@/services/firebase';
import { useAuth } from '@/context/useAuth';
import { useUserData } from '@/hooks/useUserData';
import { Toast } from '../components/ui/Toast';
import { ColaboradorSidebar } from '../components/Colaborador/ColaboradorSidebar';
import { Button } from '../components/ui/Button';
import { MensagensEnviadas } from '../components/Dashboard/MensagensEnviadas';
import { ColaboradorHeader } from '../components/Colaborador/ColaboradorHeader';

type Aba = 'home' | 'inbox';

export default function ColaboradorDashboard() {
  const { user } = useAuth();

  // Se seu hook retorna { data, loading }:
  const hookResult = useUserData(user) as any;
  const userData = (hookResult?.data ?? hookResult) || null;
  const userDataLoading = hookResult?.loading ?? false;

  const [telaAtiva, setTelaAtiva] = useState<Aba>('home');
  const [menuAberto, setMenuAberto] = useState(false);

  const [tipo, setTipo] = useState(''); // vazio para forçar escolha
  const [mensagem, setMensagem] = useState('');
  const [anonimo, setAnonimo] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [respostaIA, setRespostaIA] = useState('');
  const [showToast, setShowToast] = useState(false);

  const [mensagens, setMensagens] = useState<any[]>([]);

  // Listener das mensagens SOMENTE na coleção do colaborador (sem collectionGroup)
  useEffect(() => {
    const uid = user?.uid;
    const empresaId = userData?.empresaId;

    if (!uid || !empresaId) return;

    console.log('[Colab] attach listener', { uid, empresaId });

    const itensRef = collection(db, 'mensagens', empresaId, 'colaboradores', uid, 'itens');
    const q = query(itensRef, orderBy('createdAt', 'desc'), limit(100));

    const unsub = onSnapshot(
      q,
      (snap) => {
        const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setMensagens(rows);
      },
      (err) => {
        console.error('[Colab Inbox] snapshot error:', err);
      }
    );

    return () => unsub();
  }, [user?.uid, userData?.empresaId]);

  const handleEnviar = async () => {
    const uid = user?.uid;
    const empresaId = userData?.empresaId;
    const temMensagem = !!mensagem.trim();

    if (!uid || !empresaId || !temMensagem || !tipo) return;

    try {
      setEnviando(true);

      // Chama API de análise
      const res = await fetch('/api/analisar-texto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texto: mensagem }),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`Falha na análise: ${err}`);
      }

      const { tipoDetectado, resposta } = await res.json();

      // Salva na coleção "minha" (do colaborador)
      await addDoc(
        collection(db, 'mensagens', empresaId, 'colaboradores', uid, 'itens'),
        {
          empresaId,
          uid,
          conteudo: mensagem,
          tipoDetectado: tipoDetectado || tipo, // fallback ao tipo selecionado
          respostaIA: resposta,
          anonimo,
          createdAt: serverTimestamp(),
          nomeUsuario: anonimo ? 'Anônimo' : userData?.nome,
          lida: false,
        }
      );

      setRespostaIA(resposta);
      setShowModal(true);
      setMensagem('');
      setTipo(''); // força escolher novamente
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
    } finally {
      setEnviando(false);
    }
  };

  const formatDate = (d?: any) => {
    try {
      const date = d?.toDate ? d.toDate() : d instanceof Date ? d : new Date(d);
      return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(date);
    } catch {
      return '';
    }
  };

  const badgeFor = (t?: string) => {
    const base = 'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium';
    switch ((t || '').toLowerCase()) {
      case 'elogio':
        return `${base} bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100`;
      case 'critica':
        return `${base} bg-rose-50 text-rose-700 ring-1 ring-rose-100`;
      case 'ajuda':
      case 'pedido de ajuda':
        return `${base} bg-amber-50 text-amber-700 ring-1 ring-amber-100`;
      default:
        return `${base} bg-sky-50 text-sky-700 ring-1 ring-sky-100`; // sugestão
    }
  };

  const podeEnviar = !!tipo && !!mensagem.trim() && !!userData?.empresaId && !enviando;

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <ColaboradorSidebar
        telaAtiva={telaAtiva}
        setTelaAtiva={setTelaAtiva}
        menuAberto={menuAberto}
        setMenuAberto={setMenuAberto}
      />

      <div className="flex-1">
        <ColaboradorHeader
          mensagensNaoVistas={{ inbox: mensagens.length, enviadas: 0, ajuda: 0 }}
          onMenuClick={() => setMenuAberto(true)}
        />

        <main className="pt-24 px-4 sm:px-6">
          {showToast && (
            <Toast message="Mensagem enviada com sucesso!" type="success" onClose={() => setShowToast(false)} />
          )}

          <Modal isOpen={showModal} title="Mensagem enviada com sucesso!" onClose={() => setShowModal(false)}>
            <p className="mb-4 text-slate-700">
              Obrigado por compartilhar. Em breve o RH poderá responder diretamente aqui.
            </p>
            {respostaIA && (
              <p className="text-sm text-slate-600 mb-4">
                <span className="font-medium">Análise automática:</span> {respostaIA}
              </p>
            )}
            <div className="flex justify-end">
              <Button onClick={() => setShowModal(false)}>Fechar</Button>
            </div>
          </Modal>

          <div className="max-w-5xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-emerald-900">
                {telaAtiva === 'home' ? 'Bem-vindo à sua área de bem-estar' : 'Mensagens e Respostas'}
              </h1>

              {telaAtiva === 'home' && (
                <p className="mt-1 text-slate-600">
                  Compartilhe sugestões, críticas, elogios ou pedidos de ajuda. Sua voz importa — você pode escolher
                  enviar de forma anônima.
                </p>
              )}
            </div>

            {telaAtiva === 'home' && (
              <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-6 mb-8">
                {!userData?.empresaId && !userDataLoading && (
                  <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-800 text-sm">
                    Aviso: empresa do colaborador não identificada. Recarregue a página ou faça login novamente.
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-4 items-center">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de mensagem</label>
                    <select
                      value={tipo}
                      onChange={(e) => setTipo(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    >
                      <option value="" disabled>
                        Selecione o tipo…
                      </option>
                      <option value="sugestao">Sugestão</option>
                      <option value="critica">Crítica</option>
                      <option value="elogio">Elogio</option>
                      <option value="ajuda">Pedido de Ajuda</option>
                    </select>
                  </div>

                  <div className="flex items-center sm:justify-end sm:mt-5">
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={anonimo}
                        onChange={() => setAnonimo(!anonimo)}
                        className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-sm text-slate-700">Enviar como anônimo</span>
                    </label>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mensagem</label>
                  <textarea
                    placeholder="Digite sua mensagem aqui..."
                    className="w-full min-h-[140px] border border-slate-300 rounded-lg px-3 py-2 text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    value={mensagem}
                    onChange={(e) => setMensagem(e.target.value)}
                  />
                  <div className="mt-4 flex justify-end">
                    <Button
                      onClick={handleEnviar}
                      disabled={!podeEnviar}
                      loading={enviando}
                      className="px-6"
                    >
                      {enviando ? 'Enviando…' : 'Enviar'}
                    </Button>
                  </div>
                </div>
              </section>
            )}

            {telaAtiva === 'inbox' && (
              <MensagensEnviadas />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
