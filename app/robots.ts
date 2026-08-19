import type { MetadataRoute } from "next";
import { SITE } from "@/config";

// As páginas de conversão (/obrigado-*, /estudante/solicitacaorecebida) já
// carregam robots:{ index:false } na própria metadata. Por isso NÃO usamos
// Disallow nelas: o Google precisa conseguir rastrear a página para LER o
// noindex — bloquear no robots.txt pode deixar a URL indexada sem conteúdo.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: SITE.dominio + "/sitemap.xml",
  };
}
