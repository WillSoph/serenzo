import React from 'react';

const testimonials = [
  {
    name: 'Carla Souza',
    company: 'RH, TechNova',
    message:
      'Desde que adotamos a plataforma, conseguimos identificar sinais precoces de burnout e promover ações mais humanas.',
  },
  {
    name: 'Marcos Lima',
    company: 'Diretor, EcoSolutions',
    message:
      'A análise por IA surpreendeu pela precisão na triagem das mensagens. O dashboard é simples e eficaz.',
  },
  {
    name: 'Luciana Dias',
    company: 'Psicóloga Organizacional, BrightTeam',
    message:
      'Conseguimos consolidar sugestões, desabafos e críticas de forma estruturada. Recomendo muito.',
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="bg-white py-20">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Depoimentos</h2>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((item) => (
            <div
              key={item.name}
              className="h-full bg-gray-50 border border-gray-100 p-6 rounded-2xl text-left shadow-sm"
            >
              <p className="text-gray-700 italic leading-relaxed">“{item.message}”</p>
              <div className="mt-4">
                <div className="text-sm font-semibold text-emerald-700">{item.name}</div>
                <div className="text-xs text-gray-500">{item.company}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
