import React from "react";
import { Quote, Star } from "lucide-react";

const testimonials = [
  {
    name: "Carla Souza",
    company: "RH • TechNova",
    avatar: "/dep-1.png",
    message:
      "Desde que adotamos a Previsiva conseguimos identificar sinais precoces de burnout e agir antes que os problemas aumentassem.",
  },
  {
    name: "Marcos Lima",
    company: "Diretor • EcoSolutions",
    avatar: "/dep-2.png",
    message:
      "A inteligência artificial realmente ajuda o RH. A triagem automática economiza horas de trabalho todas as semanas.",
  },
  {
    name: "Luciana Dias",
    company: "Psicóloga Organizacional • BrightTeam",
    avatar: "/dep-3.png",
    message:
      "Hoje conseguimos acompanhar o clima organizacional em tempo real. A plataforma é simples, bonita e muito eficiente.",
  },
];

export function Testimonials() {
  return (
    <section
      id="testimonials"
      className="relative overflow-hidden bg-gradient-to-b from-white via-rose-50/20 to-white py-28"
    >
      {/* decoração */}
      <div className="absolute left-0 top-20 h-72 w-72 rounded-full bg-pink-200/20 blur-3xl" />
      <div className="absolute right-0 bottom-0 h-72 w-72 rounded-full bg-emerald-200/20 blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">

          <span className="inline-flex items-center rounded-full bg-rose-50 text-rose-600 px-4 py-2 text-sm font-semibold">
            Quem usa recomenda
          </span>

          <h2 className="mt-6 text-4xl md:text-5xl font-bold text-slate-900">
            Empresas que já transformaram
            <br />
            a comunicação interna
          </h2>

          <p className="mt-5 text-xl text-slate-600 leading-relaxed">
            Veja como a Previsiva está ajudando empresas a criarem
            ambientes mais saudáveis e produtivos.
          </p>

        </div>

        {/* Cards */}
        <div className="mt-16 grid md:grid-cols-3 gap-8">

          {testimonials.map((item) => (

            <div
              key={item.name}
              className="
              relative
              bg-white
              rounded-3xl
              border border-slate-100
              shadow-lg
              hover:shadow-2xl
              hover:-translate-y-2
              transition-all
              duration-300
              p-8
              "
            >

              {/* aspas */}
              <Quote
                className="absolute right-6 top-6 h-14 w-14 text-emerald-100"
                strokeWidth={1}
              />

              {/* estrelas */}
              <div className="flex gap-1 mb-5">
                {[1,2,3,4,5].map((s)=>(
                  <Star
                    key={s}
                    className="h-4 w-4 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>

              <p className="leading-8 text-slate-600 italic">
                "{item.message}"
              </p>

              <div className="mt-8 flex items-center gap-4">

                <img
                  src={item.avatar}
                  className="h-14 w-14 rounded-full object-cover border-2 border-emerald-100"
                />

                <div>

                  <div className="font-semibold text-slate-900">
                    {item.name}
                  </div>

                  <div className="text-sm text-slate-500">
                    {item.company}
                  </div>

                </div>

              </div>

            </div>

          ))}

        </div>

        {/* Estatísticas */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6">

          {[
            ["98%", "Empresas satisfeitas"],
            ["72h", "Tempo médio de implantação"],
            ["+120 mil", "Mensagens analisadas"],
            ["92%", "RHs recomendam"],
          ].map(([v, l]) => (

            <div
              key={v}
              className="rounded-2xl bg-white border border-slate-100 shadow-sm py-8 text-center"
            >
              <div className="text-4xl font-bold text-emerald-600">
                {v}
              </div>

              <div className="mt-2 text-slate-500">
                {l}
              </div>

            </div>

          ))}

        </div>

      </div>
    </section>
  );
}