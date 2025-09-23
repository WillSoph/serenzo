// app/page.tsx
import type { Metadata } from "next";

import { Header } from "./components/Header/Header";
import { Hero } from "./components/Hero/Hero";
import { About } from "./components/About/About";
import { Benefits } from "./components/Benefits/Benefits";
import { Testimonials } from "./components/Testimonials/Testimonials";
import { Footer } from "./components/Footer/Footer";

// SEO da Home
export const metadata: Metadata = {
  title: "Escuta ativa anônima + IA que prioriza riscos | Serenzo",
  description:
    "A Serenzo organiza a escuta ativa (com anonimato opcional) e usa IA para priorizar sinais de risco — insights por setor em dados agregados (LGPD).",
  alternates: { canonical: "https://serenzo.com.br/" },
};

export default function HomePage() {
  return (
    <div className="scroll-smooth">
      <Header />
      <main>
        <Hero />
        <About />
        <Benefits />
        <Testimonials />
        <Footer />
      </main>
    </div>
  );
}
