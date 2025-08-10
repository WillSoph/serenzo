import React from 'react';
import { ShieldCheck, BrainCircuit, BellRing, BarChart3 } from 'lucide-react';

const benefits = [
  {
    title: 'Escuta ativa e anônima',
    description:
      'Colaboradores podem se expressar livremente, com segurança e privacidade.',
    icon: ShieldCheck,
  },
  {
    title: 'Análise automática com IA',
    description:
      'Classificação inteligente de mensagens: sugestões, críticas ou pedidos de ajuda.',
    icon: BrainCircuit,
  },
  {
    title: 'Alertas em tempo real',
    description:
      'Sinalizações imediatas para casos com risco emocional ou urgência.',
    icon: BellRing,
  },
  {
    title: 'Dashboard intuitivo',
    description:
      'Tendências, histórico e relatórios claros para decisões rápidas.',
    icon: BarChart3,
  },
];

export function Benefits() {
  return (
    <section id="benefits" className="bg-gray-50 py-20">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Vantagens do sistema</h2>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map(({ title, description, icon: Icon }) => (
            <div
              key={title}
              className="group bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition"
            >
              <div className="mx-auto h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                <Icon className="h-6 w-6 text-emerald-700" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">{title}</h3>
              <p className="mt-2 text-gray-600">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
