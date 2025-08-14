// components/rh/RhHeader.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Settings, Loader2 } from "lucide-react";
import { useAuth } from "@/context/useAuth";
import { useUserData } from "@/hooks/useUserData";
import { useCancelSubscription } from "@/hooks/useCancelSubscription";
import { useResumeSubscription } from "@/hooks/useResumeSubscription";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import toast, { Toaster } from "react-hot-toast";
import { Modal } from "../Dashboard/Modal";

interface RhHeaderProps {
  mensagensNaoVistas: { inbox: number; enviadas: number; ajuda: number };
  onMenuClick?: () => void;
}

export const RhHeader = ({ mensagensNaoVistas, onMenuClick }: RhHeaderProps) => {
  const { user } = useAuth();
  const ud = useUserData(user) as any;
  const empresaId = ud?.data?.empresaId ?? ud?.empresaId;

  const [menuOpen, setMenuOpen] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);

  const btnRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const { cancelRequest, loading: canceling } = useCancelSubscription(empresaId);
  const { resume, loading: resuming } = useResumeSubscription(empresaId);
  const { cancelAt } = useSubscriptionStatus(empresaId);

  const hasScheduledCancel = useMemo(() => {
    if (!cancelAt) return false;
    try {
      const now = Date.now();
      const when = cancelAt instanceof Date ? cancelAt.getTime() : new Date(cancelAt).getTime();
      return when > now;
    } catch {
      return true;
    }
  }, [cancelAt]);

  // fechar dropdown ao clicar fora / Esc
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (!menuRef.current || !btnRef.current) return;
      if (!menuRef.current.contains(t) && !btnRef.current.contains(t)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    if (menuOpen) {
      window.addEventListener("click", onClick);
      window.addEventListener("keydown", onKey);
    }
    return () => {
      window.removeEventListener("click", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  // ===== CANCELAR (com backfill automático) =====
  const confirmCancel = async () => {
    if (!empresaId) {
      toast.error("Empresa não identificada. Faça login novamente.");
      return;
    }

    const promise = (async () => {
      // 1) primeira tentativa
      let res = await cancelRequest();

      // 2) se falhar por "Assinatura não encontrada", roda backfill e tenta de novo
      if (!res.ok) {
        let errJson: any = null;
        try {
          errJson = await res.clone().json();
        } catch {
          /* ignore parse error */
        }
        const msg: string = errJson?.error || "";
        if (msg.toLowerCase().includes("assinatura não encontrada")) {
          await fetch("/api/backfill-subscription", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ empresaId }),
          });
          res = await cancelRequest();
        }
      }

      if (!res.ok) {
        // propaga erro amigável
        let cause = "Falha ao cancelar.";
        try {
          const e = await res.json();
          cause = e?.error || cause;
        } catch {}
        throw new Error(cause);
      }

      const json = await res.json(); // { ok, status, cancelAt }
      return json as { ok: boolean; status?: string; cancelAt?: number };
    })();

    setShowConfirmCancel(false);
    setMenuOpen(false);

    toast.promise(promise, {
      loading: "Cancelando assinatura…",
      success: (res) => {
        const when = res.cancelAt
          ? new Date(res.cancelAt * 1000).toLocaleString("pt-BR")
          : "ao final do ciclo";
        return `Cancelamento agendado. Acesso ativo até ${when}.`;
      },
      error: (e) => (e instanceof Error ? e.message : "Não foi possível cancelar. Tente novamente."),
    });
  };

  // ===== RETOMAR =====
  const handleResume = async () => {
    if (!empresaId) {
      toast.error("Empresa não identificada. Faça login novamente.");
      return;
    }
    const p = resume().then((res) => {
      if (!res?.ok) throw new Error("Falha ao retomar.");
      return res;
    });
    setMenuOpen(false);
    toast.promise(p, {
      loading: "Retomando assinatura…",
      success: "Assinatura retomada com sucesso.",
      error: (e) => (e instanceof Error ? e.message : "Não foi possível retomar. Tente novamente."),
    });
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-emerald-100 shadow-sm flex items-center px-4 z-40 md:ml-64">
      {onMenuClick && (
        <button
          onClick={onMenuClick}
          className="md:hidden mr-4 p-2 text-emerald-700 hover:text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 rounded-lg"
          aria-label="Abrir menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}

      <h1 className="text-lg font-semibold text-emerald-900">Painel</h1>

      <div className="ml-auto flex items-center space-x-4 relative">
        {/* Botão de Configurações */}
        <div className="relative">
          <button
            ref={btnRef}
            onClick={() => setMenuOpen((p) => !p)}
            className="p-2 rounded-lg text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label="Abrir configurações"
          >
            <Settings className="w-6 h-6" />
          </button>

          {/* Dropdown */}
          <div
            ref={menuRef}
            className={`absolute right-0 mt-2 w-64 origin-top-right rounded-xl border shadow-lg z-50
            border-emerald-100 bg-white ring-1 ring-emerald-100/60
            transition-transform transition-opacity duration-150
            ${menuOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}`}
            role="menu"
          >
            <div className="px-3 py-2 border-b border-emerald-100/70">
              <p className="text-sm font-medium text-emerald-900">Configurações</p>
              <p className="text-xs text-emerald-700/70">
                {hasScheduledCancel ? "Cancelamento agendado — você pode retomar." : "Gerencie sua assinatura"}
              </p>
            </div>

            <div className="p-1">
              {!hasScheduledCancel ? (
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    setShowConfirmCancel(true);
                  }}
                  disabled={canceling}
                  className={`flex w-full items-center gap-2 px-3 py-2 rounded-lg text-sm
                    hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/40
                    ${canceling ? "opacity-60 cursor-not-allowed" : "text-red-600 hover:text-red-700"}`}
                  role="menuitem"
                >
                  {canceling && <Loader2 className="w-4 h-4 animate-spin" />}
                  Cancelar assinatura
                </button>
              ) : (
                <button
                  onClick={handleResume}
                  disabled={resuming}
                  className={`flex w-full items-center gap-2 px-3 py-2 rounded-lg text-sm
                    text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50
                    focus:outline-none focus:ring-2 focus:ring-emerald-500/40
                    ${resuming ? "opacity-60 cursor-not-allowed" : ""}`}
                  role="menuitem"
                >
                  {resuming && <Loader2 className="w-4 h-4 animate-spin" />}
                  Retomar assinatura
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="text-sm text-emerald-900">{user?.email}</div>
      </div>

      {/* Modal de confirmação do cancelamento */}
      <Modal
        isOpen={showConfirmCancel}
        title="Cancelar assinatura"
        onClose={() => setShowConfirmCancel(false)}
      >
        <p className="text-slate-700 mb-4">
          Tem certeza que deseja cancelar a assinatura? Seu acesso permanecerá ativo até o fim do período já pago.
        </p>

        <div className="flex justify-end gap-2">
          <button
            onClick={() => setShowConfirmCancel(false)}
            className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
            disabled={canceling}
          >
            Voltar
          </button>
          <button
            onClick={confirmCancel}
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
            disabled={canceling}
          >
            {canceling ? "Cancelando..." : "Confirmar cancelamento"}
          </button>
        </div>
      </Modal>

      {/* Toaster (se já houver global, pode remover aqui) */}
      <Toaster
        position="top-right"
        toastOptions={{
          className: "border border-emerald-200 bg-white text-emerald-900 shadow-md rounded-lg",
          success: { iconTheme: { primary: "#10b981", secondary: "white" } },
          error: { iconTheme: { primary: "#ef4444", secondary: "white" } },
        }}
      />
    </header>
  );
};
