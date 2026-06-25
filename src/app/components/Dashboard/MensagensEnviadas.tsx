// components/Colaborador/MensagensEnviadas.tsx
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  limit,
  DocumentData,
  updateDoc,
} from 'firebase/firestore';
import { db } from '@/services/firebase';
import { useAuth } from '@/context/useAuth';
import { useUserData } from '@/hooks/useUserData';
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Filter,
  MessageSquare,
  MoreVertical,
  Search,
} from 'lucide-react';

type StatusFiltro = 'todas' | 'respondidas' | 'sem_resposta';

export function MensagensEnviadas() {
  const { user } = useAuth();

  const hook = useUserData(user) as any;
  const userData = (hook?.data ?? hook) || null;
  const empresaId = userData?.empresaId;

  const [docs, setDocs] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [statusFiltro, setStatusFiltro] = useState<StatusFiltro>('todas');

  const markedRef = useRef<Set<string>>(new Set());

  const q = useMemo(() => {
    if (!empresaId || !user?.uid) return null;

    const base = collection(
      db,
      'mensagens',
      empresaId,
      'colaboradores',
      user.uid,
      'itens'
    );

    return query(base, orderBy('createdAt', 'desc'), limit(100));
  }, [empresaId, user?.uid]);

  useEffect(() => {
    if (!q) {
      setDocs([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsub = onSnapshot(
      q,
      async (snap) => {
        const rows = snap.docs.map((d) => ({
          id: d.id,
          ref: d.ref,
          ...d.data(),
        }));

        setDocs(rows);
        setLoading(false);

        const toMark = rows.filter(
          (m: any) => m.lida !== true && !markedRef.current.has(m.id)
        );

        if (toMark.length > 0) {
          try {
            await Promise.all(toMark.map((m: any) => updateDoc(m.ref, { lida: true })));
            toMark.forEach((m: any) => markedRef.current.add(m.id));
          } catch (e) {
            console.warn('[MensagensEnviadas] falha ao marcar lida:', e);
          }
        }
      },
      () => setLoading(false)
    );

    return () => unsub();
  }, [q]);

  const mensagensFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return docs.filter((m: any) => {
      const conteudo = (m?.conteudo || '').toString().toLowerCase();
      const tipo = (m?.tipoDetectado || m?.tipo || '').toString().toLowerCase();
      const respondida = !!m?.respostaRH;

      const matchBusca = !termo || conteudo.includes(termo) || tipo.includes(termo);

      const matchStatus =
        statusFiltro === 'todas' ||
        (statusFiltro === 'respondidas' && respondida) ||
        (statusFiltro === 'sem_resposta' && !respondida);

      return matchBusca && matchStatus;
    });
  }, [docs, busca, statusFiltro]);

  const totalRespondidas = docs.filter((m: any) => !!m.respostaRH).length;
  const totalSemResposta = docs.length - totalRespondidas;

  const formatDate = (d?: any) => {
    try {
      const date = d?.toDate ? d.toDate() : d instanceof Date ? d : new Date(d);
      return new Intl.DateTimeFormat('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short',
      }).format(date);
    } catch {
      return '';
    }
  };

  const getTipoLabel = (t?: string) => {
    const tipo = (t || '').toLowerCase();

    if (tipo.includes('elogio')) return 'Elogio';
    if (tipo.includes('crit')) return 'Crítica';
    if (tipo.includes('ajuda')) return 'Ajuda';
    return 'Sugestão';
  };

  const badge = (t?: string) => {
    const base =
      'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase ring-1';

    const tipo = (t || '').toLowerCase();

    if (tipo.includes('elogio')) {
      return `${base} bg-emerald-50 text-emerald-700 ring-emerald-200`;
    }

    if (tipo.includes('crit')) {
      return `${base} bg-rose-50 text-rose-700 ring-rose-200`;
    }

    if (tipo.includes('ajuda')) {
      return `${base} bg-amber-50 text-amber-700 ring-amber-200`;
    }

    return `${base} bg-sky-50 text-sky-700 ring-sky-200`;
  };

  if (!empresaId) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
        Não conseguimos identificar sua empresa. Recarregue a página ou faça login novamente.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-20 animate-pulse rounded-3xl bg-white" />
        <div className="h-40 animate-pulse rounded-3xl bg-white" />
        <div className="h-40 animate-pulse rounded-3xl bg-white" />
      </div>
    );
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <MessageSquare className="h-7 w-7" />
          </div>

          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-950">
              Mensagens e respostas
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Acompanhe o status das mensagens que você enviou e as respostas do RH.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
              <MessageSquare className="h-5 w-5" />
            </div>

            <div>
              <p className="text-xs font-medium text-slate-500">Total de mensagens</p>
              <p className="text-2xl font-bold text-emerald-700">{docs.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative w-full xl:max-w-xl">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar nas suas mensagens..."
              className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-12 pr-4 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setStatusFiltro('todas')}
              className={`rounded-2xl border px-5 py-3 text-sm font-semibold transition ${
                statusFiltro === 'todas'
                  ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              Todas
            </button>

            <button
              type="button"
              onClick={() => setStatusFiltro('respondidas')}
              className={`rounded-2xl border px-5 py-3 text-sm font-semibold transition ${
                statusFiltro === 'respondidas'
                  ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              Respondidas ({totalRespondidas})
            </button>

            <button
              type="button"
              onClick={() => setStatusFiltro('sem_resposta')}
              className={`rounded-2xl border px-5 py-3 text-sm font-semibold transition ${
                statusFiltro === 'sem_resposta'
                  ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              Sem resposta ({totalSemResposta})
            </button>

            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              <Filter className="h-4 w-4" />
              Mais recentes
            </button>
          </div>
        </div>
      </div>

      {mensagensFiltradas.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <MessageSquare className="mx-auto mb-3 h-8 w-8 text-emerald-600" />
          <p className="font-medium text-slate-800">Nenhuma mensagem encontrada.</p>
          <p className="mt-1 text-sm text-slate-500">
            Tente ajustar a busca ou os filtros selecionados.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {mensagensFiltradas.map((m: any) => {
            const tipo = getTipoLabel(m.tipoDetectado || m.tipo);
            const respondida = !!m.respostaRH;

            return (
              <article
                key={m.id}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
              >
                <div
                  className={`border-l-4 p-5 sm:p-6 ${
                    respondida ? 'border-emerald-500' : 'border-amber-400'
                  }`}
                >
                  <header className="flex flex-wrap items-center justify-between gap-3">
                    <span className={badge(m.tipoDetectado || m.tipo)}>
                      {tipo}
                    </span>

                    <div className="flex items-center gap-3 text-sm text-slate-500">
                      {m.createdAt && (
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays className="h-4 w-4" />
                          {formatDate(m.createdAt)}
                        </span>
                      )}

                      <button className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
                        <MoreVertical className="h-5 w-5" />
                      </button>
                    </div>
                  </header>

                  <div className="mt-5">
                    <p className="text-sm font-medium text-slate-500">Você escreveu</p>
                    <p className="mt-1 max-w-5xl whitespace-pre-wrap text-base leading-relaxed text-slate-900">
                      {m.conteudo}
                    </p>
                  </div>

                  {respondida ? (
                    <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                          <CheckCircle2 className="h-5 w-5" />
                        </div>

                        <div>
                          <p className="text-sm font-bold text-emerald-900">
                            Resposta do RH
                          </p>
                          <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-emerald-950">
                            {m.respostaRH}
                          </p>
                          {m.respondidoEm && (
                            <p className="mt-2 text-xs text-emerald-700/80">
                              Respondido em {formatDate(m.respondidoEm)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-slate-500 ring-1 ring-slate-200">
                          <Clock3 className="h-5 w-5" />
                        </div>

                        <div>
                          <p className="text-sm font-bold text-slate-700">
                            Ainda sem resposta do RH.
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            Assim que o RH responder, você será notificado por aqui.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}