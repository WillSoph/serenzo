import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from "@/context/useAuth";
import CookieConsent from "./components/CookieConsent/CookieConsent";
import GaAdsTracking from "./ga-ads-tracking";
import { Suspense } from "react";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const OG_IMAGE = "/og.png"; // gere uma imagem 1200x630

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Previsiva — Plataforma de bem-estar corporativo com IA",
    template: "%s • Previsiva",
  },
  description:
    "Previsiva é uma plataforma de escuta ativa com IA para bem-estar corporativo. Mensagens anônimas, priorização de riscos e dashboard por setor.",
  applicationName: "Previsiva",
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
    "Previsiva",
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
    siteName: "Previsiva",
    title: "Previsiva — Bem-estar corporativo com IA",
    description:
      "Escuta ativa, IA que prioriza sinais de risco e painel para RH (dados agregados, LGPD).",
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "Previsiva — plataforma de bem-estar corporativo" }],
    locale: "pt_BR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Previsiva — Bem-estar corporativo com IA",
    description:
      "Escuta ativa, IA que prioriza riscos e insights por setor (dados agregados, LGPD).",
    images: [OG_IMAGE],
    // creator: "@previsiva_app",
  },
};

const GA_ADS_ID = process.env.NEXT_PUBLIC_GA_ADS_ID || "AW-17597320159";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // JSON-LD (Organization + SoftwareApplication)
  const orgLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Previsiva",
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
  };
  const appLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Previsiva",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "BRL" }, // ajuste se tiver planos
    url: SITE_URL,
  };

  return (
    <html lang="pt-BR">
      <head>
        {/* gtag.js base */}
        <Script
          id="gtag-base"
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ADS_ID}`}
        />
        <Script id="gtag-config" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ADS_ID}');
          `}
        </Script>
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Suspense fallback={null}>
          <GaAdsTracking />
        </Suspense>
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
