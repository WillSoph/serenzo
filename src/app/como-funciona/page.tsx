// app/como-funciona/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "../components/Footer/Footer";
import { ArrowBigLeft } from "lucide-react";

const title = "Como funciona | Serenzo";
const description =
  "Veja como a Serenzo coleta feedback dos colaboradores, usa IA para priorizar casos e oferece um painel para RH agir com rapidez e empatia.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${process.env.NEXT_PUBLIC_BASE_URL}/como-funciona` },
  openGraph: {
    title,
    description,
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/como-funciona`,
    type: "article",
  },
};

export default function ComoFuncionaPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Como funciona a Serenzo",
    description,
    mainEntityOfPage: `${process.env.NEXT_PUBLIC_BASE_URL}/como-funciona`,
    publisher: {
      "@type": "Organization",
      name: "Serenzo",
      url: process.env.NEXT_PUBLIC_BASE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/favicon.png`,
      },
    },
  };

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Início",
        item: process.env.NEXT_PUBLIC_BASE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Como funciona",
        item: `${process.env.NEXT_PUBLIC_BASE_URL}/como-funciona`,
      },
    ],
  };

  return (
    <>
        <main className="max-w-4xl mx-auto px-4 py-16">
        <Link href="/" className="hover:text-emerald-900 flex mb-6"><ArrowBigLeft />  Voltar para Home</Link>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />

        <h1 className="text-3xl md:text-4xl font-bold text-emerald-900">Como a Serenzo funciona</h1>
        <p className="mt-3 text-slate-700">
            A Serenzo conecta colaboradores e RH com segurança, inteligência e rapidez. Entenda o passo a passo:
        </p>

        <ol className="mt-8 space-y-6 list-decimal pl-5">
            <li><strong>Envio de mensagens</strong>: o colaborador envia feedback anônimo ou identificado pelo portal.</li>
            <li><strong>Análise com IA</strong>: nosso modelo detecta sinais de risco e prioriza o que exige atenção imediata.</li>
            <li><strong>Contexto para o RH</strong>: o RH recebe as mensagens com sugestões de abordagem da IA.</li>
            <li><strong>Dashboard</strong>: indicadores por setor, tendências e pendências para ações efetivas.</li>
        </ol>

        <div className="mt-10 grid sm:grid-cols-2 gap-4">
            <Link href="/para-empresas" className="rounded-lg border px-4 py-3 hover:bg-emerald-50">
            Solução para empresas
            </Link>
            <Link href="/faq" className="rounded-lg border px-4 py-3 hover:bg-emerald-50">
            Perguntas frequentes
            </Link>
        </div>      
        </main>
        <Footer/>
    </>
  );
}
