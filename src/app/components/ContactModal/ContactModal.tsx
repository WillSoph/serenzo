"use client";

import { Modal } from "../Dashboard/Modal";
import { Instagram, Linkedin, MessageCircle } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  // opcional: URLs para você customizar sem mexer no componente
  links?: {
    instagram?: string;
    linkedin?: string;
    whatsapp?: string; // use wa.me
  };
};

export function ContactModal({
  open,
  onClose,
  links = {
    instagram: "https://www.instagram.com/sistema.serenzo",
    linkedin: "https://www.linkedin.com/company/sistema-serenzo",
    whatsapp:
      "https://wa.me/5511939298907?text=Ol%C3%A1%20equipe%20Serenzo!%20Quero%20saber%20mais%20sobre%20a%20plataforma.",
  },
}: Props) {
  return (
    <Modal isOpen={open} title="Fale com a Serenzo" onClose={onClose}>
      <p className="text-slate-600 mb-4">
        Escolha um dos canais abaixo para falar com nosso time. Respondemos o
        quanto antes!
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <a
          href={links.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="cursor-pointer group rounded-xl border border-slate-200 p-4 flex flex-col items-center gap-2 hover:border-emerald-300 hover:bg-emerald-50 transition"
          aria-label="Abrir Instagram da Serenzo"
        >
          <div className="rounded-full p-3 bg-pink-50 group-hover:bg-pink-100">
            <Instagram className="h-6 w-6 text-pink-600" />
          </div>
          <span className="text-sm font-medium text-slate-800">Instagram</span>
          <span className="text-xs text-slate-500">@sistema.serenzo</span>
        </a>

        <a
          href={links.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="cursor-pointer group rounded-xl border border-slate-200 p-4 flex flex-col items-center gap-2 hover:border-emerald-300 hover:bg-emerald-50 transition"
          aria-label="Abrir LinkedIn da Serenzo"
        >
          <div className="rounded-full p-3 bg-blue-50 group-hover:bg-blue-100">
            <Linkedin className="h-6 w-6 text-blue-700" />
          </div>
          <span className="text-sm font-medium text-slate-800">LinkedIn</span>
          <span className="text-xs text-slate-500">/company/sistema-serenzo</span>
        </a>

        <a
          href={links.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="cursor-pointer group rounded-xl border border-slate-200 p-4 flex flex-col items-center gap-2 hover:border-emerald-300 hover:bg-emerald-50 transition"
          aria-label="Abrir WhatsApp da Serenzo"
        >
          <div className="rounded-full p-3 bg-green-50 group-hover:bg-green-100">
            <MessageCircle className="h-6 w-6 text-green-600" />
          </div>
          <span className="text-sm font-medium text-slate-800">WhatsApp</span>
          <span className="text-xs text-slate-500">+55 (11) 93929-8907</span>
        </a>
      </div>
    </Modal>
  );
}
