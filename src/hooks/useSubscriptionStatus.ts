// hooks/useSubscriptionStatus.ts
"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/services/firebase";

type SubState = {
  subscriptionStatus?: string | null;
  cancelAt?: Date | null;
  loading: boolean;
};

export function useSubscriptionStatus(empresaId?: string | null) {
  const [state, setState] = useState<SubState>({ loading: true });

  useEffect(() => {
    if (!empresaId) {
      setState({ loading: false });
      return;
    }
    const ref = doc(db, "empresas", empresaId);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        const d = snap.data() as any;
        const cancelAt =
          d?.cancelAt instanceof Date
            ? d.cancelAt
            : d?.cancelAt?.toDate
            ? d.cancelAt.toDate()
            : d?.cancelAt
            ? new Date(d.cancelAt)
            : null;

        setState({
          subscriptionStatus: d?.subscriptionStatus ?? null,
          cancelAt: cancelAt ?? null,
          loading: false,
        });
      },
      () => setState((s) => ({ ...s, loading: false }))
    );
    return () => unsub();
  }, [empresaId]);

  return state;
}
