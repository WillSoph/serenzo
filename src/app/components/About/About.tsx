import React from 'react';
import { HeartHandshake, Sparkles } from 'lucide-react';

export function About() {
  return (
    <section id="about" className="relative bg-white py-20 md:py-24">
      <div className="absolute left-0 top-20 h-64 w-64 rounded-full bg-emerald-100/60 blur-3xl" />
      <div className="absolute right-0 bottom-10 h-64 w-64 rounded-full bg-pink-100/60 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        <div className="overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-xl shadow-slate-200/60">
          <div className="grid items-center gap-8 p-6 md:grid-cols-2 md:p-10 lg:p-12">
            <div>
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-100 text-pink-500">
                <HeartHandshake className="h-7 w-7" />
              </div>

              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-700">
                <Sparkles className="h-3.5 w-3.5" />
                Sobre a Previsiva
              </span>

              <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 md:text-4xl">
                Quem somos
              </h2>

              <p className="mt-6 text-base leading-relaxed text-slate-600 md:text-lg">
                Somos uma equipe apaixonada por bem-estar, tecnologia e inovação. Criamos a
                Previsiva para transformar a forma como empresas cuidam da saúde emocional de
                seus colaboradores.
              </p>

              <p className="mt-4 text-base leading-relaxed text-slate-600 md:text-lg">
                Nosso propósito é promover ambientes de trabalho mais humanos e produtivos —
                onde cada voz é ouvida, cada desabafo é acolhido e cada sugestão tem impacto real.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-emerald-50 p-4">
                  <p className="text-2xl font-black text-emerald-700">IA</p>
                  <p className="mt-1 text-xs font-medium text-slate-600">
                    Apoio inteligente para o RH
                  </p>
                </div>

                <div className="rounded-2xl bg-pink-50 p-4">
                  <p className="text-2xl font-black text-pink-500">+Humano</p>
                  <p className="mt-1 text-xs font-medium text-slate-600">
                    Cuidado com empatia
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-2xl font-black text-slate-800">Seguro</p>
                  <p className="mt-1 text-xs font-medium text-slate-600">
                    Escuta com privacidade
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -right-5 -top-5 hidden h-20 w-20 rounded-full bg-pink-100 md:block" />
              <div className="absolute -bottom-5 -left-5 hidden h-24 w-24 rounded-full bg-emerald-100 md:block" />

              <div className="relative overflow-hidden rounded-[1.7rem] bg-gradient-to-br from-emerald-50 via-white to-pink-50 p-3 shadow-lg">
                <img
                  src="/about-team.png"
                  alt="Equipe reunida conversando sobre bem-estar no trabalho"
                  className="h-full min-h-[320px] w-full rounded-[1.3rem] object-cover"
                />
              </div>

              <div className="absolute -bottom-6 -right-4 hidden rounded-2xl border border-pink-100 bg-white p-4 shadow-xl md:block">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-pink-100 text-pink-500">
                    ♥
                  </span>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Cuidado real</p>
                    <p className="text-xs text-slate-500">Tecnologia a favor das pessoas</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}