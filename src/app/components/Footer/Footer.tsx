"use client";

import Link from "next/link";
import {
  Instagram,
  Linkedin,
  MessageCircle,
  Heart,
} from "lucide-react";

export function Footer() {
  return (
    <footer
      id="footer"
      className="relative overflow-hidden bg-slate-950 text-slate-300"
    >
      {/* efeitos de fundo */}
      <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="absolute right-0 bottom-0 h-72 w-72 rounded-full bg-pink-400/10 blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-6 py-20">

        {/* Logo */}
        <div className="text-center">

          <img
            src="/logo-previsiva-white.png"
            alt="Previsiva"
            className="mx-auto h-14 w-auto"
          />

          <p className="mt-5 text-slate-400 max-w-xl mx-auto leading-relaxed">
            Tecnologia, inteligência artificial e empatia para criar
            ambientes de trabalho mais saudáveis.
          </p>

        </div>

        {/* Navegação */}
        <nav
          className="
            mt-14
            flex
            flex-wrap
            justify-center
            gap-x-12
            gap-y-5
            text-sm
            font-medium
          "
        >
          <Link href="#hero" className="hover:text-white transition">
            Início
          </Link>

          <Link href="#about" className="hover:text-white transition">
            Quem somos
          </Link>

          <Link href="#benefits" className="hover:text-white transition">
            Vantagens
          </Link>

          <Link href="#testimonials" className="hover:text-white transition">
            Depoimentos
          </Link>

          <Link href="/faq" className="hover:text-white transition">
            FAQ
          </Link>

          <Link href="/blog" className="hover:text-white transition">
            Blog
          </Link>

          <Link href="/contato" className="hover:text-white transition">
            Contato
          </Link>
        </nav>

        {/* divisor */}
        <div className="mt-14 border-t border-slate-800" />

        {/* Bottom */}
        <div className="mt-10 flex flex-col lg:flex-row items-center justify-between gap-8">

          {/* legais */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-400">

            <Link
              href="/politica-de-privacidade"
              className="hover:text-white transition"
            >
              Política de Privacidade
            </Link>

            <Link
              href="/termos-de-uso"
              className="hover:text-white transition"
            >
              Termos de Uso
            </Link>

            <Link
              href="/politica-de-cookies"
              className="hover:text-white transition"
            >
              Cookies
            </Link>

          </div>

          {/* Redes */}
          <div className="flex items-center gap-4">

            <a
              href="https://www.instagram.com/serenzo.app"
              target="_blank"
              rel="noopener noreferrer"
              className="
                h-11
                w-11
                rounded-xl
                bg-slate-900
                border
                border-slate-800
                flex
                items-center
                justify-center
                hover:border-pink-400
                hover:text-pink-400
                transition
              "
            >
              <Instagram size={18} />
            </a>

            <a
              href="https://www.linkedin.com/company/serenzo"
              target="_blank"
              rel="noopener noreferrer"
              className="
                h-11
                w-11
                rounded-xl
                bg-slate-900
                border
                border-slate-800
                flex
                items-center
                justify-center
                hover:border-sky-400
                hover:text-sky-400
                transition
              "
            >
              <Linkedin size={18} />
            </a>

            <a
              href="https://wa.me/5511939298907"
              target="_blank"
              rel="noopener noreferrer"
              className="
                h-11
                w-11
                rounded-xl
                bg-slate-900
                border
                border-slate-800
                flex
                items-center
                justify-center
                hover:border-emerald-400
                hover:text-emerald-400
                transition
              "
            >
              <MessageCircle size={18} />
            </a>

          </div>

        </div>

        {/* copyright */}
        <div className="mt-14 text-center">

          <div className="flex justify-center items-center gap-2 text-slate-400">

            <span>
              © {new Date().getFullYear()} Previsiva. Todos os direitos
              reservados.
            </span>

            <Heart
              className="text-pink-400 fill-pink-400"
              size={14}
            />

          </div>

        </div>

      </div>
    </footer>
  );
}