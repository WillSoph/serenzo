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
import { Input } from "../ui/Input";

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

  // ====== Modal "Informações de contato" ======
  const [showContatoModal, setShowContatoModal] = useState(false);
  const [contatoEmail, setContatoEmail] = useState("");
  const [contatoTel, setContatoTel] = useState("");
  const [contatoHorario, setContatoHorario] = useState("");
  const [savingContato, setSavingContato] = useState(false);
  const [loadingContato, setLoadingContato] = useState(false);
  const [contatoErr, setContatoErr] = useState("");

  const openContato = async () => {
    if (!empresaId) {
      toast.error("Empresa não identificada.");
      return;
    }
    setMenuOpen(false);
    setContatoErr("");
    setShowContatoModal(true);
    setLoadingContato(true);
    try {
      const res = await fetch(`/api/contato-rh?empresaId=${empresaId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Falha ao carregar.");
      const c = data?.contatoRH || {};
      setContatoEmail(c.email || "");
      setContatoTel(c.telefone || "");
      setContatoHorario(c.atendimento || "");
    } catch (e: any) {
      setContatoErr(e?.message || "Erro ao carregar.");
    } finally {
      setLoadingContato(false);
    }
  };

  const saveContato = async () => {
    if (!empresaId) return;
    setSavingContato(true);
    setContatoErr("");
    try {
      const res = await fetch("/api/contato-rh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          empresaId,
          email: contatoEmail,
          telefone: contatoTel,
          atendimento: contatoHorario,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Falha ao salvar.");
      toast.success("Informações de contato salvas.");
      setShowContatoModal(false);
    } catch (e: any) {
      setContatoErr(e?.message || "Erro ao salvar.");
    } finally {
      setSavingContato(false);
    }
  };
  // ==========================================

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
      let res = await cancelRequest();

      if (!res.ok) {
        let errJson: any = null;
        try {
          errJson = await res.clone().json();
        } catch {}
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
        let cause = "Falha ao cancelar.";
        try {
          const e = await res.json();
          cause = e?.error || cause;
        } catch {}
        throw new Error(cause);
      }

      const json = await res.json();
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
  <>
  <header className="fixed top-0 left-0 right-0 z-40 flex h-20 items-center border-b border-slate-200/70 bg-white/90 px-4 shadow-sm backdrop-blur-xl md:ml-72 md:px-8">
    {onMenuClick && (
      <button
        onClick={onMenuClick}
        className="mr-4 rounded-xl p-2 text-emerald-700 transition hover:bg-emerald-50 hover:text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 md:hidden"
        aria-label="Abrir menu"
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    )}

    <div>
      <h1 className="text-xl font-bold text-slate-900">Caixa de Entrada</h1>
      <p className="mt-0.5 text-sm text-slate-500">
        Acompanhe e gerencie mensagens dos colaboradores com apoio da IA.
      </p>
    </div>

    <div className="ml-auto flex items-center gap-3">
      <button
        className="relative rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-emerald-700"
        aria-label="Notificações"
      >
        <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-emerald-500" />
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5m6 0a3 3 0 0 1-6 0"
          />
        </svg>
      </button>

      <div className="relative">
        <button
          ref={btnRef}
          onClick={() => setMenuOpen((p) => !p)}
          className="rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          aria-label="Abrir configurações"
        >
          <Settings className="h-5 w-5" />
        </button>

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
              <button
                onClick={openContato}
                className="flex w-full items-center gap-2 px-3 py-2 rounded-lg text-sm
                        text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50
                        focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                role="menuitem"
              >
                Informações de contato
              </button>

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

      <div className="hidden h-8 w-px bg-slate-200 md:block" />

      <div className="hidden items-center gap-3 md:flex">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-800">
          {user?.email?.[0]?.toUpperCase() || "U"}
        </div>

        <div className="leading-tight">
          <p className="text-sm font-semibold text-slate-800">Área RH</p>
          <p className="max-w-[180px] truncate text-xs text-slate-500">
            {user?.email}
          </p>
        </div>
      </div>
    </div>
    </header>

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

      {/* Modal: Informações de contato */}
      <Modal
        isOpen={showContatoModal}
        title="Informações de contato"
        onClose={() => setShowContatoModal(false)}
      >
        {loadingContato ? (
          <div className="p-2 text-slate-600">Carregando…</div>
        ) : (
          <div className="space-y-3">
            <Input
              fullWidth
              placeholder="E-mail do RH (ex: rh@empresa.com)"
              value={contatoEmail}
              onChange={(e) => setContatoEmail(e.target.value)}
            />
            <Input
              fullWidth
              placeholder="Telefone (ex: (11) 4000-0000)"
              value={contatoTel}
              onChange={(e) => setContatoTel(e.target.value)}
            />
            <Input
              fullWidth
              placeholder="Horário de atendimento (ex: seg. a sex., 9h–18h)"
              value={contatoHorario}
              onChange={(e) => setContatoHorario(e.target.value)}
            />

            {contatoErr && <p className="text-sm text-rose-600">{contatoErr}</p>}

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowContatoModal(false)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
                disabled={savingContato}
              >
                Cancelar
              </button>
              <button
                onClick={saveContato}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60 inline-flex items-center gap-2"
                disabled={savingContato}
              >
                {savingContato && <Loader2 className="w-4 h-4 animate-spin" />}
                Salvar
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Toaster */}
      <Toaster
        position="top-right"
        toastOptions={{
          className: "border border-emerald-200 bg-white text-emerald-900 shadow-md rounded-lg",
          success: { iconTheme: { primary: "#10b981", secondary: "white" } },
          error: { iconTheme: { primary: "#ef4444", secondary: "white" } },
        }}
      />
    </>
  );
};
