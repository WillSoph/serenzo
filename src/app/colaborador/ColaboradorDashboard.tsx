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
  doc,
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

/* -------------------- helpers visuais -------------------- */
const TIPO_CHIPS: Array<{ key: string; label: string }> = [
  { key: 'sugestao', label: 'Sugestão' },
  { key: 'critica', label: 'Crítica' },
  { key: 'elogio', label: 'Elogio' },
  { key: 'ajuda', label: 'Pedido de ajuda' },
];

const MAX_CHARS = 1000;

function fmtDateTime(d?: any) {
  try {
    const date = d?.toDate ? d.toDate() : d instanceof Date ? d : new Date(d);
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(date);
  } catch {
    return '';
  }
}
/* -------------------------------------------------------- */

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
  const [showToast, setShowToast] = useState(false);

  const [mensagens, setMensagens] = useState<any[]>([]);

  // 🟢 contato RH carregado do Firestore (empresas/{empresaId}.contatoRH)
  const [contatoRH, setContatoRH] = useState<{
    email?: string;
    telefone?: string;
    atendimento?: string;
  } | null>(null);

  /* -------------------- rascunho automático -------------------- */
  const draftKey = user?.uid ? `draft_msg_${user.uid}` : '';
  const draftTipoKey = user?.uid ? `draft_tipo_${user.uid}` : '';
  const draftAnonKey = user?.uid ? `draft_anon_${user.uid}` : '';

  // carrega rascunho quando usuário mudar
  useEffect(() => {
    if (!user?.uid) return;
    const m = localStorage.getItem(draftKey);
    const t = localStorage.getItem(draftTipoKey);
    const a = localStorage.getItem(draftAnonKey);
    if (m) setMensagem(m);
    if (t) setTipo(t);
    if (a) setAnonimo(a === '1');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  // salva rascunho (debounced simples)
  useEffect(() => {
    if (!user?.uid) return;
    const id = setTimeout(() => {
      localStorage.setItem(draftKey, mensagem);
      localStorage.setItem(draftTipoKey, tipo);
      localStorage.setItem(draftAnonKey, anonimo ? '1' : '0');
    }, 300);
    return () => clearTimeout(id);
  }, [mensagem, tipo, anonimo, user?.uid, draftKey, draftTipoKey, draftAnonKey]);
  /* -------------------------------------------------------------- */

  // Listener das mensagens SOMENTE na coleção do colaborador (sem collectionGroup)
  useEffect(() => {
    const uid = user?.uid;
    const empresaId = userData?.empresaId;
    if (!uid || !empresaId) return;

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

  // 🟢 Listener do doc da empresa para obter contatoRH
  useEffect(() => {
    const empresaId = userData?.empresaId;
    if (!empresaId) return;
    const unsub = onSnapshot(doc(db, 'empresas', empresaId), (snap) => {
      const d = snap.exists() ? snap.data() : null;
      setContatoRH(d?.contatoRH || null);
    });
    return () => unsub();
  }, [userData?.empresaId]);

  // helper: remove chaves com undefined (Firestore não aceita)
  function pruneUndefined<T extends Record<string, any>>(obj: T): T {
    return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as T;
  }

  // regra simples de escalonamento: se IA marcar 'ajuda', prioriza; senão usa IA ou seleção do usuário
  const decideTipoFinal = (selecionado: string, detectado?: string) => {
    const sel = (selecionado || '').toLowerCase();
    const det = (detectado || '').toLowerCase();
    if (det === 'ajuda') return 'ajuda';
    return det || sel || 'sugestao';
  };

  const handleEnviar = async () => {
    const uid = user?.uid;
    const empresaId = userData?.empresaId;
    const temMensagem = !!mensagem.trim();
    if (!uid || !empresaId || !temMensagem || !tipo) return;

    try {
      setEnviando(true);

      const res = await fetch('/api/analisar-texto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texto: mensagem }),
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(`Falha na análise: ${err}`);
      }
      const { tipoDetectado, orientacaoRH } = await res.json();

      const tipoFinal = decideTipoFinal(tipo, tipoDetectado);

      // monta payload SEM undefined
      const payload = pruneUndefined({
        empresaId,
        uid,
        conteudo: mensagem,
        tipoDetectado, // mantém para auditoria, só entra se existir
        tipo: tipoFinal, // tipo “oficial” para UI
        orientacaoRH, // orientação privada ao RH
        anonimo,
        createdAt: serverTimestamp(),
        nomeUsuario: anonimo ? 'Anônimo' : userData?.nome ?? null, // nunca undefined
        lida: false,
      });

      await addDoc(collection(db, 'mensagens', empresaId, 'colaboradores', uid, 'itens'), payload);

      setShowModal(true);
      setMensagem('');
      setTipo('');
      setAnonimo(false);

      // limpar rascunho após envio
      if (user?.uid) {
        localStorage.removeItem(draftKey);
        localStorage.removeItem(draftTipoKey);
        localStorage.removeItem(draftAnonKey);
      }

      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
    } finally {
      setEnviando(false);
    }
  };

  const podeEnviar = !!tipo && !!mensagem.trim() && !!userData?.empresaId && !enviando;

  /* -------------------- derivados p/ cards -------------------- */
  const ultimas = useMemo(() => mensagens.slice(0, 5), [mensagens]); // Máx. 5
  const usedChars = mensagem.length;
  /* ----------------------------------------------------------- */

  /* -------------------- Recursos úteis (Modal) -------------------- */
  const [resourceModal, setResourceModal] = useState<{
    open: boolean;
    type?: 'policy' | 'faq' | 'emergency' | 'contacts';
  }>({ open: false });

  const openResource = (type: 'policy' | 'faq' | 'emergency' | 'contacts') =>
    setResourceModal({ open: true, type });
  const closeResource = () => setResourceModal({ open: false });

  const resourceTitle =
    resourceModal.type === 'policy'
      ? 'Política de Conduta'
      : resourceModal.type === 'faq'
      ? 'FAQ'
      : resourceModal.type === 'emergency'
      ? 'Canal de Emergência'
      : resourceModal.type === 'contacts'
      ? 'Contatos do RH'
      : '';

  const ResourceContent = () => {
    switch (resourceModal.type) {
      case 'policy':
        return (
          <div className="space-y-2 text-slate-700">
            <p>Aqui você encontra os princípios que guiam a convivência na empresa.</p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Respeito e cordialidade em qualquer situação.</li>
              <li>Assédio de qualquer natureza é intolerável.</li>
              <li>Uso responsável de recursos e informações.</li>
              <li>Canal de denúncia disponível em caso de violações.</li>
            </ul>
          </div>
        );
      case 'faq':
        return (
          <div className="space-y-2 text-slate-700">
            <p>Dúvidas frequentes sobre o uso da plataforma:</p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>
                <strong>Posso enviar anônimo?</strong> Sim, basta marcar a opção “Enviar como anônimo”.
              </li>
              <li>
                <strong>Quem vê minhas mensagens?</strong> Somente o time de RH.
              </li>
              <li>
                <strong>Quando recebo resposta?</strong> Em até 2 dias úteis, em média.
              </li>
            </ul>
          </div>
        );
      case 'emergency':
        return (
          <div className="space-y-2 text-slate-700">
            <p>Para situações urgentes que envolvam risco à integridade, saúde ou segurança.</p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Disque 190 (Polícia) ou 192 (SAMU) conforme o caso.</li>
              <li>Contato interno de emergência: <strong>(11) 99999-0000</strong>.</li>
              <li>Informe seu gestor ou RH o quanto antes.</li>
            </ul>
          </div>
        );
      case 'contacts':
        return (
          <div className="space-y-2 text-slate-700">
            <p>Canais oficiais do RH:</p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              {contatoRH?.email ? (
                <li>
                  E-mail: <strong>{contatoRH.email}</strong>
                </li>
              ) : null}
              {contatoRH?.telefone ? (
                <li>
                  Telefone: <strong>{contatoRH.telefone}</strong>
                </li>
              ) : null}
              {contatoRH?.atendimento ? (
                <li>
                  Atendimento: <strong>{contatoRH.atendimento}</strong>
                </li>
              ) : null}
              {!contatoRH?.email && !contatoRH?.telefone && !contatoRH?.atendimento && (
                <li>As informações de contato ainda não foram configuradas.</li>
              )}
            </ul>
          </div>
        );
      default:
        return null;
    }
  };
  /* ------------------------------------------------------------------ */

  return (
  <div className="h-screen overflow-hidden bg-slate-50">
    <ColaboradorSidebar
      telaAtiva={telaAtiva}
      setTelaAtiva={setTelaAtiva}
      menuAberto={menuAberto}
      setMenuAberto={setMenuAberto}
    />

    <div className="h-screen md:ml-72">
      <ColaboradorHeader
        mensagensNaoVistas={{ inbox: mensagens.length, enviadas: 0, ajuda: 0 }}
        onMenuClick={() => setMenuAberto(true)}
      />

      <main className="h-[calc(100vh-1rem)] overflow-y-auto px-5 pt-24 pb-8 md:px-8">
        {showToast && (
          <Toast
            message="Mensagem enviada com sucesso!"
            type="success"
            onClose={() => setShowToast(false)}
          />
        )}

        <Modal isOpen={showModal} title="Mensagem enviada com sucesso!" onClose={() => setShowModal(false)}>
          <p className="mb-4 text-slate-700">
            Obrigado por compartilhar. Em breve o RH poderá responder diretamente aqui.
          </p>
          <div className="flex justify-end">
            <Button onClick={() => setShowModal(false)}>Fechar</Button>
          </div>
        </Modal>

        <Modal isOpen={resourceModal.open} title={resourceTitle} onClose={closeResource}>
          <div className="mb-4">
            <ResourceContent />
          </div>
          <div className="flex justify-end">
            <Button onClick={closeResource}>Fechar</Button>
          </div>
        </Modal>

        <div className="mx-auto space-y-6">
          {telaAtiva === 'home' && (
            <>
              <section className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-white via-white to-emerald-50/70 p-6 shadow-sm md:p-8">
                <div className="max-w-3xl">
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                    Canal seguro
                  </span>

                  <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
                    Bem-vindo à sua área de bem-estar
                  </h1>

                  <p className="mt-3 text-base text-slate-600">
                    Compartilhe sugestões, críticas, elogios ou pedidos de ajuda.
                    Sua voz importa — você pode escolher enviar de forma anônima.
                  </p>
                </div>
              </section>

              <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.4fr_0.8fr]">
                <div className="space-y-5">
                  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    {!userData?.empresaId && !userDataLoading && (
                      <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                        Aviso: empresa do colaborador não identificada. Recarregue a página ou faça login novamente.
                      </div>
                    )}

                    <div className="mb-5">
                      <h2 className="text-xl font-bold text-slate-900">
                        Enviar nova mensagem
                      </h2>
                      <p className="mt-1 text-sm text-slate-500">
                        Escolha o tipo, descreva a situação e envie ao RH.
                      </p>
                    </div>

                    <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {TIPO_CHIPS.map((c) => {
                        const active = tipo === c.key;

                        return (
                          <button
                            key={c.key}
                            type="button"
                            onClick={() => setTipo(c.key)}
                            className={`rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                              active
                                ? 'border-emerald-500 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-100'
                                : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:bg-emerald-50/50'
                            }`}
                          >
                            {c.label}
                          </button>
                        );
                      })}
                    </div>

                    <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
                      <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">
                          Tipo de mensagem
                        </label>

                        <select
                          value={tipo}
                          onChange={(e) => setTipo(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
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

                      <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
                        <input
                          type="checkbox"
                          checked={anonimo}
                          onChange={() => setAnonimo(!anonimo)}
                          className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        Enviar como anônimo
                      </label>
                    </div>

                    <div className="mt-5">
                      <label className="mb-1 block text-sm font-medium text-slate-700">
                        Mensagem
                      </label>

                      <textarea
                        placeholder="Digite sua mensagem aqui..."
                        className="min-h-[190px] w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                        value={mensagem}
                        onChange={(e) => setMensagem(e.target.value)}
                        maxLength={MAX_CHARS}
                      />

                      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                        <span>{usedChars}/{MAX_CHARS}</span>
                        <span>Rascunho salvo automaticamente</span>
                      </div>

                      <div className="mt-5 flex justify-end">
                        <Button
                          onClick={handleEnviar}
                          disabled={!podeEnviar}
                          loading={enviando}
                          className="px-7"
                        >
                          {enviando ? 'Enviando…' : 'Enviar mensagem'}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="font-semibold text-slate-900">
                      Dicas para uma mensagem clara
                    </h3>

                    <div className="mt-4 grid gap-3 md:grid-cols-3">
                      <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                        Explique o que aconteceu e quando.
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                        Descreva o impacto em você, no time ou no cliente.
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                        Se puder, sugira um caminho ou necessidade.
                      </div>
                    </div>
                  </div>
                </div>

                <aside className="space-y-5">
                  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-slate-900">
                        Suas últimas mensagens
                      </h3>

                      <button
                        onClick={() => setTelaAtiva('inbox')}
                        className="text-sm font-medium text-emerald-700 hover:underline"
                      >
                        Ver tudo
                      </button>
                    </div>

                    {ultimas.length === 0 ? (
                      <p className="mt-4 text-sm text-slate-500">
                        Você ainda não enviou mensagens.
                      </p>
                    ) : (
                      <ul className="mt-4 space-y-3">
                        {ultimas.map((m) => {
                          const status = m?.respostaRH ? 'respondida' : m?.lida ? 'lida' : 'enviada';

                          const statusCls =
                            status === 'respondida'
                              ? 'bg-emerald-100 text-emerald-700'
                              : status === 'lida'
                              ? 'bg-slate-100 text-slate-700'
                              : 'bg-amber-100 text-amber-700';

                          return (
                            <li key={m.id} className="rounded-2xl border border-slate-100 p-3">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-medium text-slate-800">
                                    {(m?.conteudo || '').toString().slice(0, 80) || '(sem texto)'}
                                  </p>
                                  <p className="mt-1 text-xs text-slate-500">
                                    {fmtDateTime(m?.createdAt)}
                                  </p>
                                </div>

                                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusCls}`}>
                                  {status}
                                </span>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>

                  <div className="rounded-3xl border border-emerald-100 bg-emerald-50/70 p-5 shadow-sm">
                    <h3 className="font-semibold text-emerald-950">
                      Como tratamos suas mensagens
                    </h3>

                    <ul className="mt-3 space-y-2 text-sm text-emerald-900/80">
                      <li>Tempo médio de resposta: <strong>até 2 dias úteis</strong>.</li>
                      <li>Se marcar “anônimo”, o RH não verá seu nome.</li>
                      <li>Somente o time de RH tem acesso às mensagens.</li>
                    </ul>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="font-semibold text-slate-900">
                      Recursos úteis
                    </h3>

                    <div className="mt-4 grid gap-2">
                      <button className="rounded-xl bg-slate-50 px-3 py-2 text-left text-sm text-emerald-700 transition hover:bg-emerald-50" onClick={() => openResource('policy')}>
                        Política de Conduta
                      </button>
                      <button className="rounded-xl bg-slate-50 px-3 py-2 text-left text-sm text-emerald-700 transition hover:bg-emerald-50" onClick={() => openResource('faq')}>
                        FAQ
                      </button>
                      <button className="rounded-xl bg-slate-50 px-3 py-2 text-left text-sm text-emerald-700 transition hover:bg-emerald-50" onClick={() => openResource('emergency')}>
                        Canal de Emergência
                      </button>
                      <button className="rounded-xl bg-slate-50 px-3 py-2 text-left text-sm text-emerald-700 transition hover:bg-emerald-50" onClick={() => openResource('contacts')}>
                        Contatos do RH
                      </button>
                    </div>
                  </div>
                </aside>
              </section>
            </>
          )}

          {telaAtiva === 'inbox' && (
            <div className="mx-auto">
              <MensagensEnviadas />
            </div>
          )}
        </div>
      </main>
    </div>
  </div>
);
}
