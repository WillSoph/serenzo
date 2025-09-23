// app/sobre/page.tsx
import { ArrowBigLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "../components/Footer/Footer";
const title = "Sobre a Serenzo | Missão, equipe e princípios";
const description = "Somos apaixonados por bem-estar e tecnologia. Conheça nossa missão e o que nos guia na Serenzo.";

export const metadata: Metadata = {
  title, description,
  alternates: { canonical: `${process.env.NEXT_PUBLIC_BASE_URL}/sobre` },
};

export default function SobrePage() {
  return (
    <>
    <main className="max-w-3xl mx-auto px-4 py-16">
      <Link href="/" className="hover:text-emerald-900 flex mb-6"><ArrowBigLeft />  Voltar para Home</Link>
      <h1 className="text-3xl md:text-4xl font-bold text-emerald-900">Sobre a Serenzo</h1>
      <p className="mt-3 text-slate-700">
        Criamos a Serenzo para transformar como empresas cuidam da saúde emocional de seus times.
      </p>
      <h2 className="mt-8 text-xl font-semibold">Nossos princípios</h2>
      <ul className="list-disc pl-5 text-slate-700 mt-2 space-y-1">
        <li>Privacidade e ética em primeiro lugar</li>
        <li>Transparência e suporte humano</li>
        <li>Dados para decisões melhores</li>
      </ul>
    </main>
    <Footer/>
    </>
  );
}
