// components/site/FinalCTA.tsx
"use client";

import React, { useState } from "react";
import { ArrowRight, CheckCircle2, Heart } from "lucide-react";
import { Button } from "../ui/Button";
import { ContactModal } from "../ContactModal/ContactModal";

export function FinalCTA() {
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <section className="relative overflow-hidden bg-white px-5 py-20 md:px-8 md:py-24">
      <div className="absolute left-0 top-10 h-72 w-72 rounded-full bg-emerald-100/70 blur-3xl" />
      <div className="absolute right-0 bottom-10 h-72 w-72 rounded-full bg-pink-100/80 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        <div className="overflow-hidden rounded-[2rem] border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-pink-50 p-6 shadow-xl shadow-slate-200/70 md:p-10 lg:p-12">
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.8fr]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm ring-1 ring-emerald-100">
                <Heart className="h-4 w-4 fill-pink-400 text-pink-400" />
                Cuidado que começa pela escuta
              </span>

              <h2 className="mt-6 max-w-3xl text-3xl font-black tracking-tight text-slate-950 md:text-5xl">
                Pronto para transformar o cuidado em cultura na sua empresa?
              </h2>

              <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-600 md:text-lg">
                Descubra como a Previsiva ajuda o RH a identificar sinais de risco,
                acolher colaboradores e agir antes que pequenos problemas se tornem
                grandes crises.
              </p>

              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  Escuta segura
                </div>

                <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  IA de apoio
                </div>

                <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  Ações preventivas
                </div>
              </div>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Button
                  onClick={() => setContactOpen(true)}
                  className="rounded-xl bg-emerald-600 px-7 py-3 text-white hover:bg-emerald-700"
                >
                  Falar com especialista
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                <a
                  href="#benefits"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-7 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-pink-200 hover:bg-pink-50 hover:text-pink-600"
                >
                  Ver vantagens
                </a>
              </div>
            </div>

            <div className="relative flex justify-center lg:justify-end">
              <div className="absolute top-8 h-56 w-56 rounded-full bg-pink-200/50 blur-3xl" />

              <div className="relative rounded-[2rem] bg-white/70 p-5 shadow-2xl ring-1 ring-white/80 backdrop-blur">
                <img
                  src="/mascote-previ-acenando.png"
                  alt="Mascote Previ acenando"
                  className="h-64 w-auto object-contain md:h-80"
                />
              </div>

              <div className="absolute -bottom-3 right-0 hidden rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-xl ring-1 ring-slate-100 md:block">
                Vamos cuidar juntos 💚
              </div>
            </div>
          </div>
        </div>
      </div>

      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </section>
  );
}