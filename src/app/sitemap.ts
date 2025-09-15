// app/sitemap.ts
import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

// Liste aqui SOMENTE rotas públicas (sem login).
const PUBLIC_ROUTES = [
  "/",                         // landing page
  "/docs/politica-conduta",    // se forem públicas
  "/docs/faq",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return PUBLIC_ROUTES.map((path, i) => ({
    url: `${BASE_URL}${path}`,
    lastModified: now,
    changeFrequency: i === 0 ? "weekly" : "monthly",
    priority: i === 0 ? 1 : 0.6,
  }));
}
