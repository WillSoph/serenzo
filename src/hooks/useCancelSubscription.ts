// hooks/useCancelSubscription.ts
"use client";

import { useState } from "react";

export function useCancelSubscription(empresaId?: string) {
  const [loading, setLoading] = useState(false);

  /** Dispara o cancelamento e retorna o Response CRU (sem fazer .json()) */
  const cancelRequest = async (): Promise<Response> => {
    setLoading(true);
    try {
      return await fetch("/api/cancel-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ empresaId }),
      });
    } finally {
      setLoading(false);
    }
  };

  return { cancelRequest, loading };
}
