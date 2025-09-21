// app/blog/page.tsx
import type { Metadata } from "next";
import BlogClient from "./BlogClient";

const base = process.env.NEXT_PUBLIC_BASE_URL || "";

export const metadata: Metadata = {
  title: "Blog da Serenzo",
  description:
    "Conteúdos sobre bem-estar corporativo, liderança, clima e produtividade.",
  alternates: { canonical: `${base}/blog` },
  openGraph: {
    title: "Blog da Serenzo",
    description:
      "Conteúdos sobre bem-estar corporativo, liderança, clima e produtividade.",
    url: `${base}/blog`,
    type: "website",
  },
};

export default function BlogPage() {
  return <BlogClient />;
}
