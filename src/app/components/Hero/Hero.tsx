"use client";
import React, { useEffect, useState } from 'react';
import { Button } from '../ui/Button';

export function Hero() {
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);

  // Troque pelos seus arquivos de imagem
  const slides = [
    { src: '/slides/como-funciona-1.png', alt: 'Envio de mensagem pelo colaborador' },
    { src: '/slides/como-funciona-2.png', alt: 'IA analisando e priorizando' },
    { src: '/slides/como-funciona-3.png', alt: 'RH recebe com sugestão e vê o dashboard' },
    { src: '/slides/como-funciona-4.png', alt: 'O RH acompanha um dashboard' },
  ];

  const steps = [
    'O colaborador envia uma mensagem ao RH (com opção de anonimato).',
    'A inteligência artificial analisa o conteúdo, identifica sinais de risco e prioriza o que precisa de atenção.',
    'O RH visualiza a mensagem com uma sugestão da IA sobre como tratar o caso.',
    'O RH acompanha um dashboard com os setores que demandam maior atenção.',
  ];

  const next = () => setIdx((i) => (i + 1) % slides.length);
  const prev = () => setIdx((i) => (i - 1 + slides.length) % slides.length);

  // Teclado + travar scroll do body quando o modal estiver aberto
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'Escape') setOpen(false);
    };
    const bodyPrev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = bodyPrev;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-gradient-to-b from-emerald-50 to-indigo-50 pt-28 md:pt-32 pb-16"
    >
      <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 items-center gap-10">
        {/* Texto */}
        <div className="text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
            Cuidando da saúde emocional dos seus colaboradores
          </h1>
          <p className="mt-5 text-lg md:text-xl text-gray-700">
            Plataforma de escuta ativa, análise com IA e apoio psicológico — para empresas que
            valorizam o bem-estar e a produtividade dos times.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center md:justify-start">
            {/* <a
              href="#footer"
              className="inline-flex justify-center items-center bg-emerald-600 text-white px-6 py-3 rounded-lg text-lg font-medium hover:bg-emerald-700 transition"
            >
              Solicitar Demonstração
            </a> */}
            <Button
              type="button"
              onClick={() => {
                setIdx(0);
                setOpen(true);
              }}
              className=""
            >
              Ver como funciona
            </Button>
          </div>
        </div>

        {/* Visual do produto (placeholder) */}
        <div aria-hidden className="relative">
          <div className="rounded-2xl border border-emerald-100 bg-white shadow-lg p-4 md:p-6">
            <img src="/hero-serenzo.png" alt="" className="w-full h-auto rounded-lg" />
          </div>
          <div className="absolute -top-10 -right-10 h-40 w-40 bg-emerald-200/40 rounded-full blur-2xl" />
          <div className="absolute -bottom-6 -left-6 h-32 w-32 bg-indigo-200/40 rounded-full blur-2xl" />
        </div>
      </div>

      {/* Modal: Como funciona */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          role="dialog"
          aria-modal="true"
          aria-label="Como funciona"
        >
          {/* backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]"
            onClick={() => setOpen(false)}
          />

          {/* content */}
          <div className="relative w-full max-w-4xl rounded-2xl bg-white shadow-xl ring-1 ring-black/5 overflow-hidden">
            {/* header */}
            <div className="flex items-center justify-between px-5 py-3 border-b">
              <h3 className="text-lg font-semibold text-slate-900">Como funciona</h3>
              <button
                className="text-slate-500 hover:text-slate-700 text-xl leading-none cursor-pointer"
                onClick={() => setOpen(false)}
                aria-label="Fechar"
              >
                ✕
              </button>
            </div>

            {/* slider */}
            <div className="relative">
              {/* imagem */}
              <div className="aspect-[16/9] bg-slate-50 flex items-center justify-center">
                <img
                  key={slides[idx].src}
                  src={slides[idx].src}
                  alt={slides[idx].alt}
                  className="max-h-[60vh] w-full object-contain"
                />
              </div>

              {/* botões prev/next */}
              <button
                onClick={prev}
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 border p-2 shadow hover:bg-white cursor-pointer"
                aria-label="Anterior"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={next}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 border p-2 shadow hover:bg-white cursor-pointer"
                aria-label="Próximo"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* indicadores */}
              <div className="absolute bottom-2 left-0 right-0 flex items-center justify-center gap-2">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setIdx(i)}
                    className={`h-2.5 w-2.5 rounded-full transition ${
                      i === idx ? 'bg-emerald-600' : 'bg-slate-300 hover:bg-slate-400'
                    }`}
                    aria-label={`Ir para slide ${i + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* texto / bullets */}
            <div className="px-5 pt-4 pb-5">
              <ul className="text-sm text-slate-700 list-disc pl-5 space-y-1">
                {steps.map((s, i) => (
                  <li key={i}>
                    <span className="font-medium">{i + 1}.</span> {s}
                  </li>
                ))}
              </ul>

              {/* rodapé */}
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Slide {idx + 1} de {slides.length}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={prev}
                    className="px-3 py-2 rounded-lg border text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={next}
                    className="px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                  >
                    Próximo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
