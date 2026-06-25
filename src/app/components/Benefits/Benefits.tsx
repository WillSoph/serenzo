import React from "react";
import {
  ShieldCheck,
  BrainCircuit,
  BellRing,
  BarChart3,
  Check,
} from "lucide-react";

export function Benefits() {
  return (
    <section
      id="benefits"
      className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50 py-24"
    >
      <div className="absolute left-0 top-20 h-72 w-72 rounded-full bg-emerald-100/50 blur-3xl" />
      <div className="absolute right-0 bottom-20 h-72 w-72 rounded-full bg-pink-100/50 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-6">

        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex rounded-full bg-pink-100 px-4 py-1 text-sm font-semibold text-pink-600">
            Recursos inteligentes
          </span>

          <h2 className="mt-5 text-4xl font-black text-slate-900">
            Muito mais do que uma caixa de sugestões
          </h2>

          <p className="mt-5 text-lg leading-relaxed text-slate-600">
            A Previsiva identifica riscos, organiza informações,
            orienta o RH e transforma mensagens em ações antes
            que pequenos problemas se tornem grandes crises.
          </p>
        </div>

        {/* BLOCO 1 */}

        <div className="mt-20 grid items-center gap-16 lg:grid-cols-2">

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
            <img
              src="/benefits-dashboard.png"
              className="w-full"
            />
          </div>

          <div>

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100">
              <ShieldCheck className="text-emerald-700"/>
            </div>

            <h3 className="mt-6 text-3xl font-bold">
              Escuta ativa e totalmente anônima
            </h3>

            <p className="mt-5 text-lg leading-relaxed text-slate-600">
              Os colaboradores podem falar com segurança,
              sabendo que suas informações são protegidas.
            </p>

            <div className="mt-8 space-y-4">

              <div className="flex items-center gap-3">
                <Check className="text-emerald-600"/>
                Anonimato opcional
              </div>

              <div className="flex items-center gap-3">
                <Check className="text-emerald-600"/>
                Comunicação segura
              </div>

              <div className="flex items-center gap-3">
                <Check className="text-emerald-600"/>
                Ambiente de confiança
              </div>

            </div>

          </div>

        </div>

        {/* BLOCO 2 */}

        <div className="mt-28 grid items-center gap-16 lg:grid-cols-2">

          <div className="order-2 lg:order-1">

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-100">
              <BrainCircuit className="text-pink-600"/>
            </div>

            <h3 className="mt-6 text-3xl font-bold">
              Inteligência Artificial que ajuda o RH
            </h3>

            <p className="mt-5 text-lg leading-relaxed text-slate-600">
              Nossa IA entende o contexto das mensagens,
              identifica urgências, classifica sentimentos
              e ainda sugere a melhor abordagem.
            </p>

          </div>

          <div className="order-1 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl lg:order-2">
            <img
              src="/benefits2-dashboard.png"
              className="w-full"
            />
          </div>

        </div>

        {/* BLOCO FINAL */}

        <div className="mt-24 grid gap-6 md:grid-cols-2">

          <div className="rounded-3xl bg-white p-8 shadow-lg">

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100">
              <BellRing className="text-amber-600"/>
            </div>

            <h4 className="mt-5 text-2xl font-bold">
              Alertas inteligentes
            </h4>

            <p className="mt-4 text-slate-600">
              Casos críticos são destacados imediatamente
              para evitar que situações delicadas passem despercebidas.
            </p>

          </div>

          <div className="rounded-3xl bg-white p-8 shadow-lg">

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100">
              <BarChart3 className="text-emerald-700"/>
            </div>

            <h4 className="mt-5 text-2xl font-bold">
              Dashboard estratégico
            </h4>

            <p className="mt-4 text-slate-600">
              Indicadores, tendências e evolução da saúde
              emocional da empresa em tempo real.
            </p>

          </div>

        </div>

      </div>
    </section>
  );
}