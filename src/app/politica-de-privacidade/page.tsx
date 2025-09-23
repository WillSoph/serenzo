// app/politica-de-privacidade/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "../components/Footer/Footer";
import { ArrowBigLeft } from "lucide-react";

const base = process.env.NEXT_PUBLIC_BASE_URL || "";
const title = "Política de Privacidade | Serenzo";
const description =
  "Saiba como a Serenzo coleta, utiliza e protege dados pessoais, em conformidade com boas práticas de privacidade.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${base}/politica-de-privacidade` },
  openGraph: {
    title,
    description,
    url: `${base}/politica-de-privacidade`,
    type: "article",
  },
};

export default function PoliticaPrivacidadePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Política de Privacidade",
    description,
    url: `${base}/politica-de-privacidade`,
    publisher: {
      "@type": "Organization",
      name: "Serenzo",
      url: base,
      logo: {
        "@type": "ImageObject",
        url: `${base}/favicon.png`,
      },
    },
  };

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: base },
      { "@type": "ListItem", position: 2, name: "Política de Privacidade", item: `${base}/politica-de-privacidade` },
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

        <h1 className="text-3xl md:text-4xl font-bold text-emerald-900">Política de Privacidade</h1>
        <p className="mt-3 text-slate-700">
          A Serenzo respeita sua privacidade. Esta política descreve como coletamos, usamos, armazenamos e protegemos
          seus dados pessoais ao utilizar nossos sites e serviços.
        </p>

        <section className="mt-8 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-emerald-900">1. Dados que coletamos</h2>
            <p className="text-slate-700 mt-2">
              Coletamos informações fornecidas por você (por exemplo, nome, e-mail, telefone e dados da empresa)
              e informações técnicas (como IP, dispositivo e páginas acessadas) para melhorar sua experiência e segurança.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-emerald-900">2. Finalidades do uso</h2>
            <ul className="list-disc pl-5 text-slate-700 mt-2 space-y-1">
              <li>Viabilizar o cadastro, autenticação e contratação do serviço.</li>
              <li>Entregar funcionalidades do produto e suporte.</li>
              <li>Analisar uso para aprimorar a plataforma e segurança.</li>
              <li>Comunicar novidades, mudanças e informações relevantes.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-emerald-900">3. Compartilhamento</h2>
            <p className="text-slate-700 mt-2">
              Podemos compartilhar dados com prestadores de serviço confiáveis (por exemplo, provedores de nuvem e
              processamento de pagamentos) estritamente para cumprir as finalidades desta política. Não vendemos seus dados.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-emerald-900">4. Cookies</h2>
            <p className="text-slate-700 mt-2">
              Utilizamos cookies essenciais e analíticos para manter sessões e entender o uso do site. Você pode gerenciar
              preferências no seu navegador. Veja também nossa{" "}
              <Link href="/politica-de-cookies" className="text-emerald-700 hover:underline">
                Política de Cookies
              </Link>.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-emerald-900">5. Segurança e retenção</h2>
            <p className="text-slate-700 mt-2">
              Adotamos medidas técnicas e organizacionais para proteger os dados. Mantemos informações somente pelo tempo
              necessário às finalidades informadas ou conforme exigido por lei.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-emerald-900">6. Seus direitos</h2>
            <p className="text-slate-700 mt-2">
              Você pode solicitar acesso, correção, exclusão e portabilidade de seus dados, bem como informações sobre o
              tratamento. Entre em contato pelo canal disponível em{" "}
              <Link href="/contato" className="text-emerald-700 hover:underline">
                Contato
              </Link>.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-emerald-900">7. Atualizações desta política</h2>
            <p className="text-slate-700 mt-2">
              Esta política pode ser atualizada periodicamente. A versão vigente estará sempre disponível nesta página.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
