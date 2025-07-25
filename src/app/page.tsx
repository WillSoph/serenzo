// app/page.tsx
"use client";

import { Header } from './components/Header/Header';
import { Hero } from './components/Hero/Hero';
import { About } from './components/About/About';
import { Benefits } from './components/Benefits/Benefits';
import { Testimonials } from './components/Testimonials/Testimonials';
import { Footer } from './components/Footer/Footer';

export default function HomePage() {
  return (
    <div className="scroll-smooth">
      <Header />
      <main className="pt-20">
        <Hero />
        <About />
        <Benefits />
        <Testimonials />
        <Footer />
      </main>
    </div>
  );
}
