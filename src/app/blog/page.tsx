// app/blog/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Blog da Serenzo",
  description: "Conteúdos sobre bem-estar corporativo, liderança, clima e produtividade.",
  alternates: { canonical: `${process.env.NEXT_PUBLIC_BASE_URL}/blog` },
};

const posts = [
  { slug: "escuta-ativa-no-ambiente-de-trabalho", title: "Escuta ativa no ambiente de trabalho", excerpt: "Como criar um canal seguro e empático." },
  { slug: "sinais-de-risco-emocional", title: "Sinais de risco emocional", excerpt: "Detecte cedo, previna crises." },
];

export default function BlogListPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-3xl md:text-4xl font-bold text-emerald-900">Blog</h1>
      <ul className="mt-8 space-y-6">
        {posts.map(p => (
          <li key={p.slug} className="rounded-xl border p-5 bg-white">
            <h2 className="text-xl font-semibold text-emerald-900">
              <Link href={`/blog/${p.slug}`} className="hover:underline">{p.title}</Link>
            </h2>
            <p className="text-slate-700 mt-1">{p.excerpt}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
