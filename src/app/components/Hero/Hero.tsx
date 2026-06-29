"use client";

import React, { useEffect, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Heart,
  Lock,
  PlayCircle,
  ShieldCheck,
  X,
} from "lucide-react";
import { Button } from "../ui/Button";
import { HowItWorksModal } from "../Modal/HowItWorksModal";
import { VideoModal } from "../Modal/VideoModal";

export function Hero() {
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);
  const [videoOpen, setVideoOpen] = useState(false);

  const videoUrl = "https://youtube.com/shorts/JwT0wD5NIYM?si=svHq-CwugGm6fjGO";

  const slides = [
    { src: "/slides/como-funciona-1.png", alt: "Envio de mensagem pelo colaborador" },
    { src: "/slides/como-funciona-2.png", alt: "IA analisando e priorizando" },
    { src: "/slides/como-funciona-3.png", alt: "RH recebe com sugestão e vê o dashboard" },
    { src: "/slides/como-funciona-4.png", alt: "O RH acompanha um dashboard" },
  ];

  const steps = [
    "O colaborador envia uma mensagem ao RH com opção de anonimato.",
    "A inteligência artificial analisa o conteúdo, identifica sinais de risco e prioriza o que precisa de atenção.",
    "O RH visualiza a mensagem com uma sugestão da IA sobre como tratar o caso.",
    "O RH acompanha um dashboard com os setores que demandam maior atenção.",
  ];

  const next = () => setIdx((i) => (i + 1) % slides.length);
  const prev = () => setIdx((i) => (i - 1 + slides.length) % slides.length);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "Escape") setOpen(false);
    };

    const bodyPrev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
      // document.body.style.overflow = bodyPrev;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-gradient-to-br from-white via-emerald-50/60 to-pink-50/40 pt-32 pb-20 md:pt-36 md:pb-24"
    >
      <div className="absolute left-0 top-20 h-72 w-72 rounded-full bg-emerald-200/30 blur-3xl" />
      <div className="absolute right-0 top-40 h-72 w-72 rounded-full bg-pink-200/30 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 md:grid-cols-2 md:px-8">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-white/80 px-4 py-2 text-sm font-medium text-emerald-700 shadow-sm">
            <CheckCircle2 className="h-4 w-4" />
            Escuta segura, humana e inteligente
          </div>

          <h1 className="max-w-xl text-4xl font-black leading-tight tracking-tight text-slate-950 md:text-6xl">
            Cuidando da saúde emocional dos seus{" "}
            <span className="text-pink-500">colaboradores</span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
            Plataforma de escuta ativa, análise com IA e apoio psicológico — para
            empresas que valorizam o bem-estar e a produtividade dos times.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:flex sm:flex-row">
            <Button
              type="button"
              onClick={() => {
                setIdx(0);
                setOpen(true);
              }}
              className="h-12 rounded-xl bg-emerald-600 px-3 text-sm text-white hover:bg-emerald-700 sm:px-6"
            >
              Ver como funciona
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <button
              type="button"
              onClick={() => setVideoOpen(true)}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-pink-200 hover:bg-pink-50 hover:text-pink-600 sm:px-6"
            >
              <PlayCircle className="h-5 w-5 text-pink-500" />
              Assistir vídeo
            </button>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-2 text-center text-[11px] font-medium text-slate-600 sm:flex sm:flex-wrap sm:gap-5 sm:text-sm sm:text-left">
            <span className="flex flex-col items-center gap-2 sm:flex-row">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 sm:h-9 sm:w-9">
                <ShieldCheck className="h-4 w-4" />
              </span>
              Seguro e anônimo
            </span>

            <span className="flex flex-col items-center gap-2 sm:flex-row">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 sm:h-9 sm:w-9">
                <Lock className="h-4 w-4" />
              </span>
              Confiável
            </span>

            <span className="flex flex-col items-center gap-2 sm:flex-row">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-pink-100 text-pink-500">
                <Heart className="h-4 w-4" />
              </span>
              Focado em pessoas
            </span>
          </div>
        </div>

        <div className="relative mt-2 md:mt-0">

          <div className="absolute -right-4 top-20 hidden rounded-2xl bg-white p-4 shadow-xl ring-1 ring-slate-100 md:block">
            <div className="h-10 w-16 rounded-lg bg-emerald-100" />
          </div>

          <div className="absolute -right-6 bottom-28 hidden rounded-2xl bg-white p-4 shadow-xl ring-1 ring-slate-100 md:block">
            <Heart className="h-8 w-8 text-pink-500" />
          </div>

          <div className="relative">

          {/* Card */}
          <div className="relative z-10 mx-auto max-w-[340px] overflow-hidden rounded-[1.5rem] border border-emerald-100 bg-white/80 p-3 shadow-xl backdrop-blur md:max-w-none md:rounded-[2rem] md:p-5 md:shadow-2xl">
            <div className="relative overflow-hidden rounded-[1.2rem] bg-gradient-to-br from-emerald-50 via-white to-pink-50 p-4 md:rounded-[1.5rem] md:p-8">             
              <img
                src="/mascote-previ.png"
                alt="Mascote Previ"
                className="relative z-20 mx-auto max-h-[250px] w-full object-contain md:max-h-[430px]"
              />
            </div>
          </div>

          {/* Balão principal */}
          <div className="absolute -left-10 top-20 z-30 hidden md:block">
              <div className="rounded-2xl bg-white px-6 py-5 shadow-xl ring-1 ring-slate-100">
                <p className="text-2xl font-bold text-slate-900">
                  Escuta que acolhe.
                </p>
                <p className="text-emerald-600 text-2xl font-bold">
                  IA que orienta.
                </p>
              </div>
            </div>


            {/* Card inferior */}
            <div className="absolute -right-7 bottom-24 z-30 hidden md:block rounded-2xl bg-white p-4 shadow-xl ring-1 ring-slate-100">
              <Heart className="h-8 w-8 text-pink-500" />
            </div>

          </div>

          <div className="absolute -right-7 top-1/2 hidden text-3xl text-pink-400 md:block">♥</div>
          <div className="absolute -left-5 bottom-20 hidden text-2xl text-pink-400 md:block">♥</div>
        </div>
      </div>

      <HowItWorksModal
        open={open}
        onClose={() => setOpen(false)}
        slides={slides}
        steps={steps}
      />
      <VideoModal
        open={videoOpen}
        onClose={() => setVideoOpen(false)}
        videoUrl={videoUrl}
        title="Conheça a Previsiva"
      />
    </section>
  );
}