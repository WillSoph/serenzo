// components/site/HowItWorksModal.tsx
"use client";

import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useState } from "react";

type Slide = {
  src: string;
  alt: string;
};

interface HowItWorksModalProps {
  open: boolean;
  onClose: () => void;
  slides: Slide[];
  steps: string[];
}

export function HowItWorksModal({
  open,
  onClose,
  slides,
  steps,
}: HowItWorksModalProps) {
  const [idx, setIdx] = useState(0);

  const next = () => setIdx((i) => (i + 1) % slides.length);
  const prev = () => setIdx((i) => (i - 1 + slides.length) % slides.length);

  useLockBodyScroll(open);

  useEffect(() => {
    if (!open) return;

    setIdx(0);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };

    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const current = slides[idx];

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/60 px-3 py-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Como funciona"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-white/20 md:max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 md:px-6">
          <div>
            <h3 className="text-lg font-bold text-slate-950">
              Como funciona
            </h3>
            <p className="mt-1 max-w-xl text-sm text-slate-500">
              Veja como a Previsiva transforma mensagens em cuidado.
            </p>
          </div>

          <button
            onClick={onClose}
            aria-label="Fechar modal"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="overflow-y-auto">
          <div className="relative bg-gradient-to-br from-slate-50 via-white to-emerald-50/60 p-3 md:p-5">
            <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
              <div className="flex aspect-[16/10] items-center justify-center bg-slate-50 md:aspect-[16/8]">
                <img
                  key={current.src}
                  src={current.src}
                  alt={current.alt}
                  className="h-full w-full object-contain"
                />
              </div>

              <button
                onClick={prev}
                aria-label="Slide anterior"
                className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-700 shadow-lg transition hover:scale-105 hover:bg-emerald-50 hover:text-emerald-700 md:h-12 md:w-12"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <button
                onClick={next}
                aria-label="Próximo slide"
                className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-700 shadow-lg transition hover:scale-105 hover:bg-emerald-50 hover:text-emerald-700 md:h-12 md:w-12"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 flex justify-center gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  aria-label={`Ir para slide ${i + 1}`}
                  className={`h-2.5 rounded-full transition ${
                    i === idx
                      ? "w-8 bg-emerald-600"
                      : "w-2.5 bg-slate-300 hover:bg-slate-400"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="grid gap-3 px-5 py-5 md:grid-cols-4 md:px-6">
            {steps.map((step, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={`rounded-2xl border p-4 text-left text-sm transition ${
                  i === idx
                    ? "border-emerald-200 bg-emerald-50 text-emerald-950"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span
                  className={`mb-3 flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                    i === idx
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {i + 1}
                </span>
                {step}
              </button>
            ))}
          </div>

          <footer className="flex items-center justify-between border-t border-slate-100 px-5 py-4 md:px-6">
            <span className="text-xs font-medium text-slate-500">
              Slide {idx + 1} de {slides.length}
            </span>

            <div className="flex gap-2">
              <button
                onClick={prev}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Anterior
              </button>

              <button
                onClick={next}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
              >
                Próximo
              </button>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}