// app/faq/page.tsx
import type { Metadata } from "next";

const title = "FAQ | Serenzo";
const description = "Perguntas frequentes sobre anonimato, privacidade, prazos de resposta e integrações da Serenzo.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${process.env.NEXT_PUBLIC_BASE_URL}/faq` },
  openGraph: { title, description, url: `${process.env.NEXT_PUBLIC_BASE_URL}/faq` },
};

export default function FaqPage() {
  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: process.env.NEXT_PUBLIC_BASE_URL },
      { "@type": "ListItem", position: 2, name: "FAQ", item: `${process.env.NEXT_PUBLIC_BASE_URL}/faq` },
    ],
  };

  return (
    <main className="max-w-3xl mx-auto px-4 py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
      <h1 className="text-3xl md:text-4xl font-bold text-emerald-900">Perguntas frequentes</h1>

      <div className="mt-8 space-y-6">
        <section>
          <h2 className="text-lg font-semibold">Posso enviar mensagens anonimamente?</h2>
          <p className="text-slate-700">Sim. Basta marcar a opção de anonimato no envio.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold">Quem tem acesso às mensagens?</h2>
          <p className="text-slate-700">Apenas o time de RH autorizado da sua empresa.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold">Quanto tempo para uma resposta?</h2>
          <p className="text-slate-700">Em média até 2 dias úteis.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold">Quais integrações existem?</h2>
          <p className="text-slate-700">Podemos integrar com SSO e diretórios corporativos. Fale com a gente.</p>
        </section>
      </div>
    </main>
  );
}
