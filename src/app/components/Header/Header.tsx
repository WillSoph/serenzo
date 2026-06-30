"use client";

import React, { useEffect, useState } from "react";
import { AuthModal } from "../AuthModal/AuthModal";
import { Menu, X } from "lucide-react";
import { Button } from "../ui/Button";
import { ContactModal } from "../ContactModal/ContactModal";

export function Header() {
  const [showAuth, setShowAuth] = useState(false);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinkClass =
    "text-sm font-medium text-slate-700 transition hover:text-emerald-700";

  return (
    <>
    <header
      className={`fixed left-0 top-0 z-50 w-full transition-all ${
        scrolled
          ? "border-b border-slate-200 bg-white/90 shadow-sm backdrop-blur-xl"
          : "bg-white/80 backdrop-blur-xl"
      }`}
      aria-label="Cabeçalho da Previsiva"
    >
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}

      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 md:px-8">
        <a href="#hero" className="flex items-center">
          <img
            src="/logo-previsiva.png"
            alt="Logo Previsiva"
            className="h-11 w-auto"
          />
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          <a href="#about" className={navLinkClass}>
            Quem somos
          </a>
          <a href="#benefits" className={navLinkClass}>
            Vantagens
          </a>
          <a href="#testimonials" className={navLinkClass}>
            Depoimentos
          </a>

          <button
            type="button"
            onClick={() => setContactOpen(true)}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
          >
            Contato
          </button>
        </nav>

        <div className="hidden md:block">
          <Button
            onClick={() => setShowAuth(true)}
            className="rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          >
            Entrar
          </Button>
        </div>

        <button
          aria-label="Abrir menu"
          className="rounded-xl p-2 text-slate-700 transition hover:bg-slate-100 md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-100 bg-white/95 backdrop-blur-xl md:hidden">
          <nav className="mx-auto grid max-w-7xl gap-2 px-5 py-4 text-slate-800">
            <a
              onClick={() => setOpen(false)}
              href="#about"
              className="rounded-xl px-3 py-2 hover:bg-emerald-50"
            >
              Quem somos
            </a>
            <a
              onClick={() => setOpen(false)}
              href="#benefits"
              className="rounded-xl px-3 py-2 hover:bg-emerald-50"
            >
              Vantagens
            </a>
            <a
              onClick={() => setOpen(false)}
              href="#testimonials"
              className="rounded-xl px-3 py-2 hover:bg-emerald-50"
            >
              Depoimentos
            </a>

            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setContactOpen(true);
              }}
              className="rounded-xl px-3 py-2 text-left hover:bg-emerald-50"
            >
              Contato
            </button>

            <button
              onClick={() => {
                setOpen(false);
                setShowAuth(true);
              }}
              className="mt-2 rounded-xl bg-emerald-600 px-4 py-3 text-center font-semibold text-white transition hover:bg-emerald-700"
            >
              Entrar
            </button>
          </nav>
        </div>
      )}
    </header>
    <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </>
  );
}