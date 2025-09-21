// components/blog/BlogClient.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

// Conteúdo dummy — substitua por CMS/MDX quando quiser
const posts = [
  {
    slug: "escuta-ativa-no-ambiente-de-trabalho",
    title: "Escuta ativa no ambiente de trabalho",
    excerpt: "Como criar um canal seguro e empático.",
    content:
      "A escuta ativa fortalece a confiança e melhora o clima organizacional. Crie canais de comunicação seguros e consistentes, com feedbacks frequentes e objetivos claros.",
  },
  {
    slug: "sinais-de-risco-emocional",
    title: "Sinais de risco emocional",
    excerpt: "Detecte cedo, previna crises.",
    content:
      "Observar mudanças de humor, queda de desempenho e isolamento ajuda a identificar riscos cedo. Encaminhe para apoio e documente ocorrências de forma responsável.",
  },
];

export default function BlogClient() {
  const [openSlug, setOpenSlug] = useState<string | null>(null);

  // Abre diretamente via hash (#slug)
  useEffect(() => {
    const hash = typeof window !== "undefined" ? window.location.hash.slice(1) : "";
    if (hash && posts.some((p) => p.slug === hash)) {
      setOpenSlug(hash);
      const el = document.getElementById(hash);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const toggle = (slug: string) => {
    setOpenSlug((cur) => (cur === slug ? null : slug));
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.hash = slug;
      window.history.replaceState(null, "", url.toString());
    }
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-3xl md:text-4xl font-bold text-emerald-900">Blog</h1>
      <p className="mt-2 text-slate-600">
        Artigos sobre bem-estar corporativo, liderança e produtividade.
      </p>

      <ul className="mt-8 space-y-6">
        {posts.map((p) => {
          const isOpen = openSlug === p.slug;
          return (
            <li
              key={p.slug}
              id={p.slug}
              className="rounded-xl border border-slate-200 bg-white p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-emerald-900">
                    <a
                      href={`#${p.slug}`}
                      onClick={(e) => {
                        e.preventDefault();
                        toggle(p.slug);
                      }}
                      className="hover:underline"
                    >
                      {p.title}
                    </a>
                  </h2>
                  <p className="text-slate-700 mt-1">{p.excerpt}</p>
                </div>

                <button
                  onClick={() => toggle(p.slug)}
                  aria-expanded={isOpen}
                  className="shrink-0 rounded-lg border px-3 py-1.5 text-sm hover:bg-slate-50"
                >
                  {isOpen ? "Fechar" : "Ler"}
                </button>
              </div>

              {isOpen && (
                <article className="prose prose-emerald max-w-none mt-4">
                  <p>{p.content}</p>
                  <div className="mt-4">
                    <Link href="/contato" className="text-emerald-700 hover:underline">
                      Fale com a Serenzo →
                    </Link>
                  </div>
                </article>
              )}
            </li>
          );
        })}
      </ul>
    </main>
  );
}
