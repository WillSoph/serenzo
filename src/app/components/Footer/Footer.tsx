// components/site/Footer.tsx
"use client";

import Link from "next/link";
import { Instagram, Linkedin, MessageCircle } from "lucide-react";

export function Footer() {
  return (
    <footer id="footer" className="bg-gray-900 text-gray-300">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="text-center">
          <div className="font-extrabold tracking-tight text-white">SERENZO</div>
          <p className="mt-2 text-sm">Cuidado emocional com tecnologia e humanidade.</p>
        </div>

        {/* Navegação principal */}
        <nav
          aria-label="Links do site"
          className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-sm justify-items-center"
        >
          <Link href="/como-funciona" className="hover:text-white">Como funciona</Link>
          <Link href="/para-empresas" className="hover:text-white">Para empresas</Link>
          <Link href="/faq" className="hover:text-white">FAQ</Link>
          <Link href="/blog" className="hover:text-white">Blog</Link>
          <Link href="/sobre" className="hover:text-white">Sobre</Link>
          <Link href="/contato" className="hover:text-white">Contato</Link>
        </nav>

        <div className="mt-8 border-t border-white/10" />

        {/* Legal + Social */}
        <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Links legais */}
          <nav aria-label="Links legais" className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
            <Link href="/politica-de-privacidade" className="hover:text-white">Política de Privacidade</Link>
            <span className="text-gray-500">•</span>
            <Link href="/termos-de-uso" className="hover:text-white">Termos de Uso</Link>
            <span className="text-gray-500">•</span>
            <Link href="/politica-de-cookies" className="hover:text-white">Política de Cookies</Link>
          </nav>

          {/* Redes sociais */}
          <div className="flex items-center gap-4">
            <a
              href="https://www.instagram.com/serenzo.app"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram da Serenzo"
              className="inline-flex items-center gap-2 hover:text-white"
              title="Instagram"
            >
              <Instagram className="h-4 w-4" />
              <span className="text-sm">Instagram</span>
            </a>
            <a
              href="https://www.linkedin.com/company/serenzo"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn da Serenzo"
              className="inline-flex items-center gap-2 hover:text-white"
              title="LinkedIn"
            >
              <Linkedin className="h-4 w-4" />
              <span className="text-sm">LinkedIn</span>
            </a>
            <a
              href="https://wa.me/5511939298907"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp da Serenzo"
              className="inline-flex items-center gap-2 hover:text-white"
              title="WhatsApp"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm">WhatsApp</span>
            </a>
          </div>
        </div>

        <p className="mt-6 text-xs text-gray-400 text-center">
          &copy; {new Date().getFullYear()} Serenzo. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
