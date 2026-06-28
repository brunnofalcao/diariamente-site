import type { MetadataRoute } from "next";
import { SITE } from "@/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/obrigado"], // página de obrigado não indexa
    },
    sitemap: `${SITE.dominio}/sitemap.xml`,
  };
}
