import type { MetadataRoute } from "next";
import { SITE } from "@/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE.dominio;
  const now = new Date();
  return [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/estudante`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/termos`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/privacidade`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];
}
