import type { MetadataRoute } from "next";
import { CHAVES, PRIVADAS, parDeIdiomas } from "@/lib/rotas";
import { hreflangDe, urlAbsoluta } from "@/lib/seo";

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

   O hreflang de cada endereço vem de hreflangDe (lib/seo.ts), a mesma
   função que escreve o <head> da página: sitemap e página dizem a mesma
   coisa. Endereço repetido sai uma vez só: /pt-pt e /es-es têm o mesmo
   caminho nos dois idiomas do mapa de rotas.
   ===================================================================== */

const PRIORIDADE: Record<string, number> = {
  vendas: 0, home: 1, homePt: 0.9, homeEs: 0.9, estudante: 0.8, sobre: 0.6, termos: 0.3, privacidade: 0.3,
};
const FREQUENCIA: Record<string, "weekly" | "monthly" | "yearly"> = {
  home: "weekly", homePt: "weekly", homeEs: "weekly", estudante: "monthly", sobre: "monthly", termos: "yearly", privacidade: "yearly",
};

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const jaListados = new Set<string>();

  return CHAVES.filter((c) => !PRIVADAS.includes(c)).flatMap((chave) => {
    const par = parDeIdiomas(chave);
    const languages = hreflangDe(chave);

    return (["pt", "es"] as const).flatMap((lang) => {
      const url = urlAbsoluta(par[lang]);
      if (jaListados.has(url)) return [];
      jaListados.add(url);
      return [{
        url,
        lastModified: now,
        changeFrequency: FREQUENCIA[chave],
        // A versão espanhola entra logo abaixo da portuguesa: mesmo conteúdo,
        // público menor. Prioridade é dica relativa, não ranking.
        priority: lang === "pt" ? PRIORIDADE[chave] : Math.max(0.1, PRIORIDADE[chave] - 0.1),
        alternates: { languages },
      }];
    });
  });
}
