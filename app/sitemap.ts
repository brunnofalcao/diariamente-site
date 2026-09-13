import type { MetadataRoute } from "next";
import { SITE } from "@/config";
import { CHAVES, parDeIdiomas } from "@/lib/rotas";

/* =====================================================================
   SITEMAP
   ---------------------------------------------------------------------
   Gerado a partir do mapa de rotas: toda página nova entra sozinha, nos
   dois idiomas, com hreflang recíproco. Não existe lista paralela para
   esquecer de atualizar.

   O Google recomenda hreflang no sitemap além das tags no <head>: é o
   sinal mais confiável, porque não depende de o crawler renderizar a
   página. E a reciprocidade é obrigatória — se uma das duas não aponta
   de volta, o par inteiro é descartado.
   ===================================================================== */

const PRIORIDADE: Record<string, number> = {
  home: 1, estudante: 0.8, sobre: 0.6, termos: 0.3, privacidade: 0.3,
};
const FREQUENCIA: Record<string, "weekly" | "monthly" | "yearly"> = {
  home: "weekly", estudante: "monthly", sobre: "monthly", termos: "yearly", privacidade: "yearly",
};

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE.dominio;
  const now = new Date();
  const abs = (p: string) => base + (p === "/" ? "" : p);

  return CHAVES.flatMap((chave) => {
    const par = parDeIdiomas(chave);
    const languages = { "pt-BR": abs(par.pt), es: abs(par.es), "x-default": abs(par.pt) };

    return (["pt", "es"] as const).map((lang) => ({
      url: abs(par[lang]),
      lastModified: now,
      changeFrequency: FREQUENCIA[chave],
      // A versão espanhola entra logo abaixo da portuguesa: mesmo conteúdo,
      // público menor. Prioridade é dica relativa, não ranking.
      priority: lang === "pt" ? PRIORIDADE[chave] : Math.max(0.1, PRIORIDADE[chave] - 0.1),
      alternates: { languages },
    }));
  });
}
