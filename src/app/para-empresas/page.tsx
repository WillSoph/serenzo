// app/para-empresas/page.tsx
import { ArrowBigLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "../components/Footer/Footer";

const title = "Serenzo para empresas | Reduza riscos e aumente o bem-estar";
const description =
  "Plataforma de bem-estar corporativo com escuta ativa, IA e painéis para RH. Reduza turnover, melhore clima e previna crises.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${process.env.NEXT_PUBLIC_BASE_URL}/para-empresas` },
  openGraph: { title, description, url: `${process.env.NEXT_PUBLIC_BASE_URL}/para-empresas` },
};

export default function ParaEmpresasPage() {
  return (
    <>
    <main className="max-w-5xl mx-auto px-4 py-16">
      <Link href="/" className="hover:text-emerald-900 flex mb-6"><ArrowBigLeft />  Voltar para Home</Link>
      <h1 className="text-3xl md:text-4xl font-bold text-emerald-900">Serenzo para empresas</h1>
      <p className="mt-3 text-slate-700">
        Transforme feedback em ações. Acompanhe sinais precoces e crie um ambiente de trabalho saudável.
      </p>

      <div className="mt-10 grid md:grid-cols-3 gap-6">
        {[
          { t: "Escuta ativa e anônima", d: "Canais seguros para todos se expressarem." },
          { t: "IA que prioriza riscos", d: "Detecção de urgências e sinais de burnout." },
          { t: "Dashboard por setor", d: "Tendências, alertas e relatórios claros." },
        ].map((b) => (
          <div key={b.t} className="rounded-xl border p-5 bg-white">
            <h2 className="font-semibold text-emerald-900">{b.t}</h2>
            <p className="text-slate-700 mt-1">{b.d}</p>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <Link href="/contato" className="inline-flex rounded-lg bg-emerald-600 text-white px-6 py-3 hover:bg-emerald-700">
          Falar com o time
        </Link>
      </div>
    </main>
    <Footer/>
    </>
  );
}
