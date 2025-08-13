// src/hooks/useUnreadCountRH.ts
import { useEffect, useMemo, useState } from 'react';
import { collectionGroup, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/services/firebase';

/**
 * Conta em tempo real as mensagens não lidas da empresa (visão RH).
 * Estrutura: mensagens/{empresaId}/colaboradores/{uid}/itens/{msgId}
 *
 * Requer um índice de grupo de coleção em "itens" com os campos:
 *   empresaId (ASC), lida (ASC)
 */
export function useUnreadCountRH(empresaId?: string) {
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const q = useMemo(() => {
    if (!empresaId) return null;
    try {
      return query(
        collectionGroup(db, 'itens'),
        where('empresaId', '==', empresaId),
        where('lida', '==', false)
      );
    } catch (e: any) {
      setError(e?.message || 'Erro ao montar consulta.');
      return null;
    }
  }, [empresaId]);

  useEffect(() => {
    if (!q) {
      setCount(0);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = onSnapshot(
      q,
      (snap) => {
        setCount(snap.size);
        setError("");
        setLoading(false);
      },
      (err) => {
        console.error('[useUnreadCountRH] snapshot error:', err);
        setError(err.message || 'Erro ao carregar contador.');
        setLoading(false);
      }
    );
    return () => unsub();
  }, [q]);

  return { count, loading, error };
}
