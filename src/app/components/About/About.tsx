import React from 'react';

export function About() {
  return (
    <section className="bg-white py-20" id="about">
      <div className="max-w-5xl mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Quem somos</h2>
        <p className="text-gray-700 text-lg leading-relaxed">
          Somos uma equipe apaixonada por bem-estar, tecnologia e inovação. Criamos a SaúdeMentalPro para transformar a forma como empresas cuidam da saúde emocional de seus colaboradores.
          <br /><br />
          Nosso propósito é promover ambientes de trabalho mais saudáveis, humanos e produtivos — onde cada voz é ouvida, cada desabafo é acolhido e cada sugestão tem impacto real.
        </p>
      </div>
    </section>
  );
}