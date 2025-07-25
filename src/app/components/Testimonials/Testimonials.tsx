const testimonials = [
  {
    name: "Carla Souza",
    company: "RH, TechNova",
    message:
      "Desde que adotamos a plataforma, conseguimos identificar sinais precoces de burnout e promover ações mais humanas no ambiente de trabalho."
  },
  {
    name: "Marcos Lima",
    company: "Diretor, EcoSolutions",
    message:
      "A inteligência artificial surpreendeu pela precisão na triagem das mensagens. O dashboard é simples e eficaz."
  },
  {
    name: "Luciana Dias",
    company: "Psicóloga Organizacional, BrightTeam",
    message:
      "Pela primeira vez conseguimos consolidar sugestões, desabafos e críticas de forma estruturada. Recomendo muito."
  },
];

export function Testimonials() {
  return (
    <section className="bg-white py-20" id="testimonials">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12">Depoimentos</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((item, index) => (
            <div
              key={index}
              className="bg-gray-50 border border-gray-200 p-6 rounded-lg shadow-sm"
            >
              <p className="text-gray-700 italic mb-4">“{item.message}”</p>
              <div className="text-sm font-semibold text-blue-600">{item.name}</div>
              <div className="text-xs text-gray-500">{item.company}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}