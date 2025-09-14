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
} from 'firebase/firestore';
import { db } from '@/services/firebase';
import { useAuth } from '@/context/useAuth';
import { useUserData } from '@/hooks/useUserData';

export function CaixaDeEntrada() {
  const { user } = useAuth();
  const userData = useUserData(user); // { data, loading }
  const empresaId = userData?.data?.empresaId;
  const tipo = userData?.data?.tipo;

  const [mensagens, setMensagens] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string>('');

  // Monta query só quando tiver empresaId
  const q = useMemo(() => {
    if (!empresaId) return null;
    try {
      const qBuilt = query(
        collectionGroup(db, 'itens'),
        where('empresaId', '==', empresaId),
        orderBy('createdAt', 'desc')
      );
      return qBuilt;
    } catch (e: any) {
      console.error('[RH Inbox] erro ao montar query:', e);
      setErro(e?.message || 'Erro ao montar consulta');
      return null;
    }
  }, [empresaId]);

  useEffect(() => {
    // Logs de depuração
    console.log('[RH Inbox] user uid:', user?.uid);
    console.log('[RH Inbox] tipo (should be "rh"):', tipo);
    console.log('[RH Inbox] empresaId do RH:', empresaId);

    if (!empresaId) {
      setLoading(false);
      return;
    }
    if (!q) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsub = onSnapshot(
      q,
      (snap) => {
        const rows = snap.docs.map((d) => ({ id: d.id, ref: d.ref, ...d.data() }));
        console.log('[RH Inbox] total docs:', rows.length);
        setMensagens(rows);
        setErro('');
        setLoading(false);
      },
      (err) => {
        console.error('[RH Inbox] snapshot error:', err);
        setErro(err.message || 'Erro ao carregar mensagens');
        setLoading(false);
      }
    );

    return () => unsub();
  }, [q, empresaId, tipo, user?.uid]);

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
    <div className="space-y-4 max-h-[calc(100vh-100px)] overflow-auto pr-2">
      {mensagens.map((m) => {
        // preferir o novo campo; manter compat com itens antigos
        const orientacao = m.orientacaoRH ?? m.respostaIA;
        const tipoMostrado = (m.tipo ?? m.tipoDetectado ?? '').toString();
  
        return (
          <article key={m.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-slate-500">
                  {m.nomeUsuario || 'Colaborador'} · {tipoMostrado}
                </p>
                <p className="mt-1 text-slate-800 whitespace-pre-wrap">{m.conteudo}</p>
  
                {orientacao && (
                  <div className="mt-3 rounded-lg bg-emerald-50 border border-emerald-100 p-3">
                    <p className="text-xs font-medium text-emerald-800">Orientação para RH</p>
                    <p className="text-sm text-emerald-900 mt-1">{orientacao}</p>
                  </div>
                )}
  
                {m.respostaRH && (
                  <div className="mt-3 border-t pt-3">
                    <p className="text-xs font-medium text-slate-600">Sua resposta</p>
                    <p className="text-sm text-slate-800 mt-1">{m.respostaRH}</p>
                  </div>
                )}
              </div>
            </div>
  
            {!m.respostaRH && (
              <form
                className="mt-4 flex w-full gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  const input = e.currentTarget.elements.namedItem('resposta') as HTMLInputElement | null;
                  const texto = input?.value.trim();
                  if (!texto) return;
                  responder(m, texto);
                  if (input) input.value = '';
                }}
              >
                <input
                  name="resposta"
                  className="flex-1 border border-slate-300 rounded-lg px-3 py-2"
                  placeholder="Escreva uma resposta ao colaborador…"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  Enviar
                </button>
              </form>
            )}
          </article>
        );
      })}
    </div>
  );
}
