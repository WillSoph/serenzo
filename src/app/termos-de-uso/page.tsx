// app/termos-de-uso/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "../components/Footer/Footer";
import { ArrowBigLeft } from "lucide-react";

const base = process.env.NEXT_PUBLIC_BASE_URL || "";
const title = "Termos de Uso | Serenzo";
const description =
  "Condições para utilização do site e serviços da Serenzo. Leia atentamente antes de usar a plataforma.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${base}/termos-de-uso` },
  openGraph: {
    title,
    description,
    url: `${base}/termos-de-uso`,
    type: "article",
  },
};

export default function TermosUsoPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Termos de Uso",
    description,
    url: `${base}/termos-de-uso`,
    publisher: {
      "@type": "Organization",
      name: "Serenzo",
      url: base,
      logo: { "@type": "ImageObject", url: `${base}/favicon.png` },
    },
  };

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: base },
      { "@type": "ListItem", position: 2, name: "Termos de Uso", item: `${base}/termos-de-uso` },
    ],
  };

  return (
    <>
      <main className="max-w-4xl mx-auto px-4 py-16">
        <Link href="/" className="hover:text-emerald-900 flex mb-6">
          <ArrowBigLeft /> <span className="ml-1">Voltar para Home</span>
        </Link>

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />

        <h1 className="text-3xl md:text-4xl font-bold text-emerald-900">Termos de Uso</h1>
        <p className="mt-3 text-slate-700">
          Ao acessar e utilizar os serviços da Serenzo, você concorda com as condições abaixo. Caso não concorde, não utilize a plataforma.
        </p>

        <section className="mt-8 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-emerald-900">1. Uso da plataforma</h2>
            <p className="text-slate-700 mt-2">
              Nossos serviços devem ser utilizados conforme sua finalidade: promover escuta ativa e gestão de bem-estar
              nas empresas, respeitando a legislação vigente e os direitos de terceiros.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-emerald-900">2. Cadastro e contas</h2>
            <p className="text-slate-700 mt-2">
              Você se compromete a fornecer informações verdadeiras e mantê-las atualizadas. É responsável pela
              confidencialidade de suas credenciais de acesso e por atividades realizadas em sua conta.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-emerald-900">3. Assinatura e pagamentos</h2>
            <p className="text-slate-700 mt-2">
              Planos e condições comerciais podem ser ajustados conforme comunicado. Pagamentos são processados por
              parceiros (ex.: Stripe) e estão sujeitos a seus termos. Cancelamentos seguem as regras do plano contratado.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-emerald-900">4. Conteúdos e conduta</h2>
            <p className="text-slate-700 mt-2">
              É proibido publicar conteúdo ilegal, ofensivo, discriminatório ou que infrinja direitos. Podemos restringir
              ou encerrar o acesso em caso de violação destes termos.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-emerald-900">5. Privacidade</h2>
            <p className="text-slate-700 mt-2">
              O tratamento de dados pessoais é regido pela nossa{" "}
              <Link href="/politica-de-privacidade" className="text-emerald-700 hover:underline">
                Política de Privacidade
              </Link>.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-emerald-900">6. Limitações de responsabilidade</h2>
            <p className="text-slate-700 mt-2">
              A Serenzo envida esforços para manter a disponibilidade e segurança do serviço, mas não garante operação
              ininterrupta. Não nos responsabilizamos por danos indiretos decorrentes do uso indevido da plataforma.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-emerald-900">7. Alterações</h2>
            <p className="text-slate-700 mt-2">
              Estes termos podem ser atualizados periodicamente. A versão vigente estará sempre disponível nesta página.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
