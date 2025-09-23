"use client";
import React, { useEffect, useState } from 'react';
import { AuthModal } from '../AuthModal/AuthModal';
import { Menu, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { ContactModal } from '../ContactModal/ContactModal';

export function Header() {
  const [showAuth, setShowAuth] = useState(false);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`w-full fixed top-0 left-0 z-50 transition
        ${scrolled ? 'bg-white/90 backdrop-blur shadow-sm' : 'bg-white'}`}
      aria-label="Cabeçalho da Serenzo"
    >
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <a href="#hero" className="flex items-center">
          <img
              src="/logo-serenzo.png"
              alt="Logo Serenzo"
              className="rounded-lg w-[140px] h-10"
            />
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 text-gray-700 font-medium">
          <a href="#about" className="hover:text-emerald-700">Quem somos</a>
          <a href="#benefits" className="hover:text-emerald-700">Vantagens</a>
          <a href="#testimonials" className="hover:text-emerald-700">Depoimentos</a>
          <Button variant="outline" onClick={() => setContactOpen(true)}>Contato</Button>
        </nav>

        <div className="hidden md:block">
          <Button
            onClick={() => setShowAuth(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            Entrar
          </Button>
        </div>

        {/* Mobile button */}
        <button
          aria-label="Abrir menu"
          className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile nav */}
      {open && (
        <div className="md:hidden border-t bg-white">
          <nav className="max-w-6xl mx-auto px-4 py-3 grid gap-3 text-gray-800">
            <a onClick={() => setOpen(false)} href="#about" className="py-1">Quem somos</a>
            <a onClick={() => setOpen(false)} href="#benefits" className="py-1">Vantagens</a>
            <a onClick={() => setOpen(false)} href="#testimonials" className="py-1">Depoimentos</a>
            <a onClick={() => setOpen(false)} href="#footer" className="py-1">Contato</a>
            <button
              onClick={() => { setOpen(false); setShowAuth(true); }}
              className="mt-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-center"
            >
              Entrar
            </button>
          </nav>
        </div>
      )}
    <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />  
    </header>
  );
}
