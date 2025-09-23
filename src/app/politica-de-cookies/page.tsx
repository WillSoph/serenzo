// app/politica-de-cookies/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "../components/Footer/Footer";
import { ArrowBigLeft } from "lucide-react";

const base = process.env.NEXT_PUBLIC_BASE_URL || "";
const title = "Política de Cookies | Serenzo";
const description =
  "Entenda quais cookies utilizamos, para que servem e como gerenciar suas preferências no navegador.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${base}/politica-de-cookies` },
  openGraph: {
    title,
    description,
    url: `${base}/politica-de-cookies`,
    type: "article",
  },
};

export default function PoliticaCookiesPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Política de Cookies",
    description,
    url: `${base}/politica-de-cookies`,
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
      { "@type": "ListItem", position: 2, name: "Política de Cookies", item: `${base}/politica-de-cookies` },
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

        <h1 className="text-3xl md:text-4xl font-bold text-emerald-900">Política de Cookies</h1>
        <p className="mt-3 text-slate-700">
          Cookies são pequenos arquivos armazenados no seu dispositivo para lembrar preferências e melhorar sua experiência.
          Esta política explica como usamos cookies na Serenzo.
        </p>

        <section className="mt-8 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-emerald-900">1. Tipos de cookies</h2>
            <ul className="list-disc pl-5 text-slate-700 mt-2 space-y-1">
              <li><strong>Essenciais:</strong> necessários para autenticação, segurança e funcionamento do site.</li>
              <li><strong>Analíticos:</strong> ajudam a entender o uso do site e guiar melhorias.</li>
              <li><strong>Funcionais:</strong> lembram preferências (por exemplo, idioma).</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-emerald-900">2. Como gerenciar cookies</h2>
            <p className="text-slate-700 mt-2">
              Você pode aceitar, bloquear ou apagar cookies nas configurações do navegador. Se bloquear todos os cookies,
              partes do site podem não funcionar corretamente.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-emerald-900">3. Cookies de terceiros</h2>
            <p className="text-slate-700 mt-2">
              Podemos usar serviços de terceiros (por exemplo, analytics) que também definem cookies. Esses provedores
              têm suas próprias políticas e controles.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-emerald-900">4. Atualizações desta política</h2>
            <p className="text-slate-700 mt-2">
              Podemos atualizar esta política periodicamente. Consulte esta página para ver a versão mais recente.
            </p>
          </div>

          <div>
            <p className="text-slate-700">
              Para dúvidas sobre privacidade, acesse{" "}
              <Link href="/politica-de-privacidade" className="text-emerald-700 hover:underline">
                nossa Política de Privacidade
              </Link>{" "}
              ou entre em <Link href="/contato" className="text-emerald-700 hover:underline">Contato</Link>.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
