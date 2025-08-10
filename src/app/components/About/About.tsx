import React from 'react';

export function About() {
  return (
    <section id="about" className="bg-white py-20">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Quem somos</h2>
        <p className="mt-6 text-gray-700 text-lg leading-relaxed">
          Somos uma equipe apaixonada por bem-estar, tecnologia e inovação. Criamos a Serenzo para
          transformar a forma como empresas cuidam da saúde emocional de seus colaboradores.
        </p>
        <p className="mt-4 text-gray-700 text-lg leading-relaxed">
          Nosso propósito é promover ambientes de trabalho mais humanos e produtivos — onde cada voz
          é ouvida, cada desabafo é acolhido e cada sugestão tem impacto real.
        </p>
      </div>
    </section>
  );
}
