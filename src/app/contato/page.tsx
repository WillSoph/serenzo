// app/contato/page.tsx
import type { Metadata } from "next";
const title = "Contato | Serenzo";
const description = "Fale com nossa equipe comercial e de suporte.";

export const metadata: Metadata = {
  title, description,
  alternates: { canonical: `${process.env.NEXT_PUBLIC_BASE_URL}/contato` },
};

export default function ContatoPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="text-3xl md:text-4xl font-bold text-emerald-900">Contato</h1>
      <p className="mt-3 text-slate-700">Envie um e-mail para <a className="underline text-emerald-700" href="mailto:contato@serenzo.com.br">contato@serenzo.com.br</a> ou fale no WhatsApp.</p>
      <ul className="mt-4 space-y-2 text-slate-700">
        <li><a className="underline text-emerald-700" href="https://wa.me/5511939298907" target="_blank">WhatsApp comercial</a></li>
        <li><a className="underline text-emerald-700" href="https://www.linkedin.com/company/serenzo" target="_blank">LinkedIn</a></li>
        <li><a className="underline text-emerald-700" href="https://www.instagram.com/serenzoapp" target="_blank">Instagram</a></li>
      </ul>
    </main>
  );
}
