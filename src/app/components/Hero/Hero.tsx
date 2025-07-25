import React from 'react';

export function Hero() {
  return (
    <section className="bg-blue-50 py-24" id="hero">
      <div className="max-w-6xl mx-auto px-4 flex flex-col items-center text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Cuidando da saúde emocional dos seus colaboradores
        </h1>
        <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-2xl">
          Uma plataforma completa de escuta ativa, análise inteligente e apoio psicológico para empresas que valorizam o bem-estar de seus times.
        </p>
        <a
          href="#footer"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-medium hover:bg-blue-700 transition"
        >
          Solicitar Demonstração
        </a>
      </div>
    </section>
  );
}