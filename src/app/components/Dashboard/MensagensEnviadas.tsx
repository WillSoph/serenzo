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
import { CheckCircle2, MessageSquare } from 'lucide-react';

export function MensagensEnviadas() {
  const { user } = useAuth();

  // compat: seu hook pode retornar {data,loading} ou só o objeto
  const hook = useUserData(user) as any;
  const userData = (hook?.data ?? hook) || null;
  const empresaId = userData?.empresaId;

  const [docs, setDocs] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);

  // mantém ids já marcados para não fazer update repetido
  const markedRef = useRef<Set<string>>(new Set());

  const q = useMemo(() => {
    if (!empresaId || !user?.uid) return null;
    const base = collection(db, 'mensagens', empresaId, 'colaboradores', user.uid, 'itens');
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
          ref: d.ref, // <- precisamos do ref para update
          ...d.data(),
        }));

        setDocs(rows);
        setLoading(false);

        // Marcar como lidas as que ainda não foram lidas
        // (e que ainda não marcamos nessa sessão)
        const toMark = rows.filter(
          (m: any) => m.lida !== true && !markedRef.current.has(m.id)
        );

        if (toMark.length > 0) {
          try {
            await Promise.all(
              toMark.map((m: any) => updateDoc(m.ref, { lida: true }))
            );
            toMark.forEach((m: any) => markedRef.current.add(m.id));
          } catch (e) {
            // silencioso para não atrapalhar a UI; pode logar se quiser
            console.warn('[MensagensEnviadas] falha ao marcar lida:', e);
          }
        }
      },
      () => setLoading(false)
    );

    return () => unsub();
  }, [q]);

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

  const badge = (t?: string) => {
    const base =
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1';
    switch ((t || '').toLowerCase()) {
      case 'elogio':
        return `${base} bg-emerald-50 text-emerald-700 ring-emerald-200`;
      case 'critica':
        return `${base} bg-rose-50 text-rose-700 ring-rose-200`;
      case 'ajuda':
      case 'pedido de ajuda':
        return `${base} bg-amber-50 text-amber-700 ring-amber-200`;
      default:
        return `${base} bg-sky-50 text-sky-700 ring-sky-200`; // sugestão
    }
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
      <div className="space-y-3">
        <div className="h-5 w-48 rounded bg-emerald-100 animate-pulse" />
        <div className="h-28 rounded-xl bg-white shadow-sm border border-slate-100 animate-pulse" />
        <div className="h-28 rounded-xl bg-white shadow-sm border border-slate-100 animate-pulse" />
      </div>
    );
  }

  if (docs.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
        <MessageSquare className="mx-auto mb-2 h-7 w-7 text-emerald-600" />
        <p className="text-slate-600">Você ainda não enviou mensagens.</p>
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-emerald-900">Mensagens e respostas</h2>

      {docs.map((m: any) => (
        <article
          key={m.id}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-6"
        >
          <header className="flex flex-wrap items-center justify-between gap-3">
            <span className={badge(m.tipoDetectado || m.tipo)}>
              {(m.tipoDetectado || m.tipo || 'sugestão').toString().toUpperCase()}
            </span>
            {m.createdAt && (
              <time className="text-xs text-slate-500">{formatDate(m.createdAt)}</time>
            )}
          </header>

          {/* Mensagem enviada */}
          <div className="mt-3">
            <p className="text-xs font-medium text-slate-500">Você escreveu</p>
            <p className="mt-1 text-slate-800 whitespace-pre-wrap">{m.conteudo}</p>
          </div>

          {/* Resposta do RH */}
          {m.respostaRH ? (
            <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 p-3">
              <div className="flex items-center gap-2 text-emerald-800">
                <CheckCircle2 className="h-4 w-4" />
                <p className="text-xs font-medium">Resposta do RH</p>
              </div>
              <p className="mt-1 text-sm text-emerald-900 whitespace-pre-wrap">
                {m.respostaRH}
              </p>
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs text-slate-600">Ainda sem resposta do RH.</p>
            </div>
          )}
        </article>
      ))}
    </section>
  );
}
