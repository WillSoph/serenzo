// app/blog/[slug]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

// Conteúdo dummy – substitua pelo seu CMS/MDX depois
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

// Gera as rotas estáticas para SSG (evita 404 no build)
export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

// Metadata por página (tipagem correta: params NÃO é Promise)
export function generateMetadata(
  { params }: { params: { slug: string } }
): Metadata {
  const post = posts.find((p) => p.slug === params.slug);
  const title = post ? `${post.title} · Blog Serenzo` : "Blog Serenzo";
  const description = post?.excerpt ?? "Conteúdos sobre bem-estar corporativo e produtividade.";
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "";

  return {
    title,
    description,
    alternates: {
      canonical: `${base}/blog/${params.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${base}/blog/${params.slug}`,
      type: "article",
    },
  };
}

export default function BlogPostPage(
  { params }: { params: { slug: string } }
) {
  const post = posts.find((p) => p.slug === params.slug);

  if (!post) {
    // Opcional: você pode jogar para notFound() do Next
    return (
      <main className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-2xl font-bold text-emerald-900">Post não encontrado</h1>
        <p className="mt-2 text-slate-600">O conteúdo que você procura não existe ou foi movido.</p>
        <div className="mt-6">
          <Link href="/blog" className="text-emerald-700 hover:underline">
            ← Voltar para o blog
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-16">
      <Link href="/blog" className="text-emerald-700 hover:underline">
        ← Voltar para o blog
      </Link>

      <article className="mt-4">
        <h1 className="text-3xl md:text-4xl font-bold text-emerald-900">
          {post.title}
        </h1>
        <p className="mt-2 text-slate-600">{post.excerpt}</p>

        <div className="prose prose-emerald max-w-none mt-8">
          <p>{post.content}</p>
        </div>
      </article>
    </main>
  );
}
