const benefits = [
  {
    title: "Escuta ativa e anônima",
    description: "Permita que colaboradores expressem livremente suas ideias, críticas ou desabafos de forma segura."
  },
  {
    title: "Análise automática com IA",
    description: "Classificação inteligente de mensagens como sugestões, críticas ou pedidos de ajuda."
  },
  {
    title: "Alertas em tempo real",
    description: "RH recebe sinalizações imediatas de mensagens com risco emocional ou urgência."
  },
  {
    title: "Dashboard intuitivo",
    description: "Visualize tendências, histórico e relatórios com poucos cliques."
  },
];

export function Benefits() {
  return (
    <section className="bg-gray-50 py-20" id="benefits">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12">Vantagens do sistema</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {benefits.map((item, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg shadow hover:shadow-md transition"
            >
              <h3 className="text-xl font-semibold text-blue-600 mb-2">{item.title}</h3>
              <p className="text-gray-700">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
