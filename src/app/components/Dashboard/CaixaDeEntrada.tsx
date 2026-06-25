// components/Dashboard/CaixaDeEntrada.tsx (RH)
'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  collectionGroup,
  onSnapshot,
  orderBy,
  query,
  where,
  updateDoc,
  DocumentData,
  limit,
  startAfter,
  getDocs,
  QueryDocumentSnapshot,
  getCountFromServer,
} from 'firebase/firestore';
import { db } from '@/services/firebase';
import { useAuth } from '@/context/useAuth';
import { useUserData } from '@/hooks/useUserData';
import { MensagensColaboradoresTable } from './MensagensColaboradoresTable';

export function CaixaDeEntrada() {
  const { user } = useAuth();
  const userData = useUserData(user); // { data, loading }
  const empresaId = userData?.data?.empresaId;
  const tipo = userData?.data?.tipo;

  const [mensagens, setMensagens] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string>('');

  const PAGE_SIZE = 10;

  const [pageDocs, setPageDocs] = useState<QueryDocumentSnapshot<DocumentData>[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [totalMensagens, setTotalMensagens] = useState(0);

  const baseQuery = useMemo(() => {
  if (!empresaId) return null;

  return query(
    collectionGroup(db, 'itens'),
    where('empresaId', '==', empresaId),
    orderBy('createdAt', 'desc')
  );
}, [empresaId]);

const carregarPagina = async (direction: 'first' | 'next' = 'first') => {
  if (!baseQuery) return;

  setLoading(true);

  try {
    const cursor =
      direction === 'next' && pageDocs.length > 0
        ? pageDocs[pageDocs.length - 1]
        : null;

    const pageQuery = cursor
      ? query(baseQuery, startAfter(cursor), limit(PAGE_SIZE + 1))
      : query(baseQuery, limit(PAGE_SIZE + 1));

    const snap = await getDocs(pageQuery);

    const docs = snap.docs.slice(0, PAGE_SIZE);
    const rows = docs.map((d) => ({
      id: d.id,
      ref: d.ref,
      ...d.data(),
    }));

  

    setMensagens(rows);
    setPageDocs(docs);
    setHasNextPage(snap.docs.length > PAGE_SIZE);
    setErro('');

    if (direction === 'first') {
      setPageIndex(0);
    } else {
      setPageIndex((p) => p + 1);
    }
  } catch (e: any) {
    console.error('[RH Inbox] erro ao carregar página:', e);
    setErro(e?.message || 'Erro ao carregar mensagens');
  } finally {
    setLoading(false);
  }
};

  const carregarTotal = async () => {
    if (!baseQuery) return;

    try {
      const snapshot = await getCountFromServer(baseQuery);
      setTotalMensagens(snapshot.data().count);
    } catch (e) {
      console.error('Erro ao buscar total', e);
    }
  };

  useEffect(() => {
    if (!empresaId || !baseQuery) {
      setLoading(false);
      return;
    }

    carregarTotal();
    carregarPagina('first');
  }, [empresaId, baseQuery]);



  const responder = async (m: any, texto: string) => {
    try {
      await updateDoc(m.ref, {
        respostaRH: texto,
        respondidoEm: new Date(),
        lida: true,
      });
    } catch (e) {
      console.error('[RH Inbox] erro ao responder:', e);
      alert('Erro ao responder.');
    }
  };

  if (!empresaId) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
        Empresa do RH não identificada ainda. Faça login novamente ou recarregue a página.
      </div>
    );
  }

  if (loading) {
    return <div className="animate-pulse text-slate-500">Carregando mensagens…</div>;
  }

  if (erro) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-800">
        {erro}
      </div>
    );
  }

  if (mensagens.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600">
        Nenhuma mensagem para esta empresa ainda.
      </div>
    );
  }

  

  return (
  <div className="space-y-6">
    <MensagensColaboradoresTable
      mensagens={mensagens}
      totalMensagens={totalMensagens}
      onResponder={responder}
      pageIndex={pageIndex}
      hasNextPage={hasNextPage}
      loadingPage={loading}
      onNextPage={() => carregarPagina('next')}
      onFirstPage={() => carregarPagina('first')}
    />
  </div>
);
}
