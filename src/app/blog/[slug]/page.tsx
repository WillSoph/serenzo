// app/blog/[slug]/page.tsx
import type { Metadata } from "next";

type Params = { params: { slug: string } };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const map: Record<string, { title: string; description: string }> = {
    "escuta-ativa-no-ambiente-de-trabalho": {
      title: "Escuta ativa no ambiente de trabalho | Blog Serenzo",
      description: "Estratégias práticas para implementar escuta ativa na sua empresa.",
    },
    "sinais-de-risco-emocional": {
      title: "Sinais de risco emocional | Blog Serenzo",
      description: "Como identificar sinais precoces e apoiar seu time.",
    },
  };
  const meta = map[params.slug] || {
    title: "Blog Serenzo",
    description: "Conteúdos sobre bem-estar corporativo.",
  };
  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: `${process.env.NEXT_PUBLIC_BASE_URL}/blog/${params.slug}` },
  };
}

export default function BlogPostPage({ params }: Params) {
  return (
    <main className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl md:text-4xl font-bold text-emerald-900">{decodeURIComponent(params.slug).replace(/-/g, " ")}</h1>
      <article className="prose prose-emerald mt-6">
        <p>Conteúdo do post… (migre seus textos aqui ou integre um CMS).</p>
      </article>
    </main>
  );
}
