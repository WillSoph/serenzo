// components/site/CookieConsent.tsx
"use client";

import { useEffect, useState } from "react";
import { Modal } from "../Dashboard/Modal";
import { Button } from "../ui/Button";

const STORAGE_KEY = "serenzo_cookie_consent";
const COOKIE_NAME = "serenzo_cookie_consent";

function hasConsent(): boolean {
  if (typeof document === "undefined") return false;
  const fromStorage =
    typeof localStorage !== "undefined" &&
    localStorage.getItem(STORAGE_KEY) === "1";
  const fromCookie =
    typeof document !== "undefined" &&
    document.cookie.includes(`${COOKIE_NAME}=1`);
  return fromStorage || fromCookie;
}

export default function CookieConsent() {
  const [show, setShow] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  useEffect(() => {
    // Exibe apenas se ainda não houver consentimento salvo
    setShow(!hasConsent());
  }, []);

  const accept = () => {
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(STORAGE_KEY, "1");
      }
      // 365 dias
      if (typeof document !== "undefined") {
        document.cookie = `${COOKIE_NAME}=1; Max-Age=${
          60 * 60 * 24 * 365
        }; Path=/; SameSite=Lax`;
      }
    } catch {}
    setShow(false);
    setShowTerms(false);
  };

  if (!show) return null;

  return (
    <>
      {/* Barra fixa inferior */}
      <div
        className="fixed inset-x-0 bottom-0 z-50"
        role="region"
        aria-label="Aviso de uso de cookies"
      >
        <div className="mx-auto max-w-6xl px-4 pb-4">
          <div className="rounded-xl border border-slate-200 bg-white shadow-lg p-4 md:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <p className="text-sm md:text-[15px] text-slate-700">
              Usamos cookies para melhorar sua experiência e analisar o tráfego.
              Ao continuar, você concorda com nossa{" "}
              <button
                type="button"
                onClick={() => setShowTerms(true)}
                className="text-emerald-700 hover:text-emerald-800 underline cursor-pointer"
              >
                Política de Cookies e Privacidade
              </button>
              .
            </p>

            <div className="flex items-center gap-2 md:gap-3">
              <Button
                onClick={() => setShowTerms(true)}
                variant="outline"
              >
                Ler
              </Button>
              <Button
                onClick={accept}
              >
                Aceitar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal com a política */}
      <Modal
        isOpen={showTerms}
        title="Política de Cookies e Privacidade"
        onClose={() => setShowTerms(false)}
      >
        <div className="space-y-3 text-slate-700">
          <p>
            Esta Política explica como a <strong>Serenzo</strong> utiliza cookies
            e tecnologias semelhantes para operar o site, lembrar suas
            preferências, medir audiência e aprimorar sua experiência.
          </p>

          <h4 className="font-semibold">O que são cookies?</h4>
          <p className="text-sm">
            Cookies são pequenos arquivos armazenados no seu navegador. Eles
            permitem que o site reconheça seu dispositivo e mantenha algumas
            informações entre visitas.
          </p>

          <h4 className="font-semibold">Cookies que usamos</h4>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>
              <strong>Essenciais</strong>: garantem o funcionamento e a
              segurança do site (ex.: sessão).
            </li>
            <li>
              <strong>Preferências</strong>: lembram escolhas como idioma e
              consentimentos.
            </li>
            <li>
              <strong>Analytics</strong>: ajudam a entender o uso do site (em
              formato agregado/anonimizado quando possível) para melhorarmos
              conteúdo e desempenho.
            </li>
          </ul>

          <h4 className="font-semibold">Base legal</h4>
          <p className="text-sm">
            Utilizamos cookies essenciais com base em <em>legítimo interesse</em>.
            Os demais dependem do seu <em>consentimento</em>, que pode ser
            retirado a qualquer momento.
          </p>

          <h4 className="font-semibold">Como gerenciar</h4>
          <p className="text-sm">
            Você pode limpar ou bloquear cookies nas configurações do navegador.
            Cookies essenciais não podem ser desativados, pois são necessários
            ao funcionamento do site.
          </p>

          <h4 className="font-semibold">Retenção</h4>
          <p className="text-sm">
            Mantemos cookies apenas pelo tempo necessário para os fins
            informados. Alguns expiram ao fechar o navegador; outros persistem
            por um período limitado para lembrar preferências.
          </p>

          <h4 className="font-semibold">Contato</h4>
          <p className="text-sm">
            Dúvidas sobre privacidade? Fale com a gente:
            <br />
            <strong>privacidade@serenzo.com</strong>
          </p>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setShowTerms(false)}>
            Fechar
          </Button>
          <Button onClick={accept}>Aceitar e fechar</Button>
        </div>
      </Modal>
    </>
  );
}