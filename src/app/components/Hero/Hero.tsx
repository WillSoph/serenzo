import React from 'react';

export function Hero() {
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
            Plataforma de escuta ativa, análise com IA e apoio psicológico —
            para empresas que valorizam o bem-estar e a produtividade dos times.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center md:justify-start">
            <a
              href="#footer"
              className="inline-flex justify-center items-center bg-emerald-600 text-white px-6 py-3 rounded-lg text-lg font-medium hover:bg-emerald-700 transition"
            >
              Solicitar Demonstração
            </a>
            <a
              href="#benefits"
              className="inline-flex justify-center items-center px-6 py-3 rounded-lg text-lg font-medium border border-emerald-200 text-emerald-700 hover:bg-white"
            >
              Ver como funciona
            </a>
          </div>
        </div>

        {/* Visual do produto (placeholder) */}
        <div aria-hidden className="relative">
          <div className="rounded-2xl border border-emerald-100 bg-white shadow-lg p-4 md:p-6">
            {/* substitua o src abaixo por uma imagem real depois */}
            <img
              src="/hero-serenzo.png"
              alt=""
              className="w-full h-auto rounded-lg"
            />
          </div>
          {/* Brilho decorativo */}
          <div className="absolute -top-10 -right-10 h-40 w-40 bg-emerald-200/40 rounded-full blur-2xl" />
          <div className="absolute -bottom-6 -left-6 h-32 w-32 bg-indigo-200/40 rounded-full blur-2xl" />
        </div>
      </div>
    </section>
  );
}
