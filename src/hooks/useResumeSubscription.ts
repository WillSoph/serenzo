// hooks/useResumeSubscription.ts
"use client";

import { useState } from "react";

type ResumeResult = { ok: boolean; status?: string };

export function useResumeSubscription(empresaId?: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState<string | null>(null);
  const [data, setData]     = useState<ResumeResult | null>(null);

  const resume = async () => {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const res = await fetch("/api/resume-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ empresaId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Falha ao retomar assinatura");
      setData(json as ResumeResult);
      return json as ResumeResult;
    } catch (e: any) {
      setError(e?.message || "Erro inesperado");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { resume, loading, error, data };
}
