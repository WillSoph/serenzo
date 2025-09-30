// app/sitemap.ts
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_BASE_URL!;
  const now = new Date().toISOString();

  const staticRoutes = [
    "",
    "/como-funciona",
    "/faq",
    "/para-empresas",
    "/sobre",
    "/contato",
    "/blog",
  ].map((p) => ({
    url: `${base}${p}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: p === "" ? 1 : 0.7,
  }));

  return [...staticRoutes];
}
