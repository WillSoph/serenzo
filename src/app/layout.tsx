import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from "@/context/useAuth";
import CookieConsent from "./components/CookieConsent/CookieConsent";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const OG_IMAGE = "/og.png"; // gere uma imagem 1200x630

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Serenzo — Plataforma de bem-estar corporativo com IA",
    template: "%s • Serenzo",
  },
  description:
    "Serenzo é uma plataforma de escuta ativa com IA para bem-estar corporativo. Mensagens anônimas, priorização de riscos e dashboard por setor.",
  applicationName: "Serenzo",
  alternates: { canonical: "/" },
  category: "Business",
  keywords: [
    "plataforma de escuta ativa",
    "bem-estar corporativo",
    "saúde emocional no trabalho",
    "mensagens anônimas",
    "análise com IA",
    "RH",
    "dashboard de RH",
    "clima organizacional",
    "Serenzo",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  viewport: { width: "device-width", initialScale: 1 },
  themeColor: "#10b981",
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon.ico", type: "image/x-icon" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Serenzo",
    title: "Serenzo — Bem-estar corporativo com IA",
    description:
      "Escuta ativa, IA que prioriza sinais de risco e painel para RH (dados agregados, LGPD).",
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "Serenzo — plataforma de bem-estar corporativo" }],
    locale: "pt_BR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Serenzo — Bem-estar corporativo com IA",
    description:
      "Escuta ativa, IA que prioriza riscos e insights por setor (dados agregados, LGPD).",
    images: [OG_IMAGE],
    // creator: "@serenzo_app",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // JSON-LD (Organization + SoftwareApplication)
  const orgLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Serenzo",
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
  };
  const appLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Serenzo",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "BRL" }, // ajuste se tiver planos
    url: SITE_URL,
  };

  return (
    <html lang="pt-BR">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>{children}<CookieConsent /></AuthProvider>

        {/* JSON-LD */}
        <Script
          id="ld-org"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }}
        />
        <Script
          id="ld-app"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(appLd) }}
        />
      </body>
    </html>
  );
}
