import type { MetadataRoute } from "next";
import { SITE } from "@/config";
import { CHAVES, PRIVADAS, parDeIdiomas, type Chave } from "@/lib/rotas";
import { HREFLANG } from "@/lib/mercado";

/* =====================================================================
   SITEMAP
   ---------------------------------------------------------------------
   Gerado a partir do mapa de rotas: toda página nova entra sozinha, nos
   dois idiomas, com hreflang recíproco. Não existe lista paralela para
   esquecer de atualizar.

   As QUATRO homes (/, /pt-pt, /es-es, /es) entram com o grupo de
   mercado inteiro: pt-BR, pt-PT, es-ES, es-419, es e x-default, o mesmo
   que cada home declara no <head> (lib/mercado.ts, HREFLANG). As outras
   páginas seguem o par pt-BR e es.

   O Google recomenda hreflang no sitemap além das tags no <head>: é o
   sinal mais confiável, porque não depende de o crawler renderizar a
   página. E a reciprocidade é obrigatória: se uma das versões não aponta
   de volta, o grupo inteiro é descartado.

   A rota interna do resto do mundo (/mundo) não entra: ela é servida na
   própria "/".
   ===================================================================== */

const PRIORIDADE: Record<string, number> = {
  estudante: 0.8, sobre: 0.6, termos: 0.3, privacidade: 0.3,
};
const FREQUENCIA: Record<string, "weekly" | "monthly" | "yearly"> = {
  estudante: "monthly", sobre: "monthly", termos: "yearly", privacidade: "yearly",
};

// Homes de mercado: tratadas à parte, com o grupo de cinco hreflang.
const HOMES_DE_MERCADO: Chave[] = ["home", "homePt", "homeEs"];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE.dominio;
  const now = new Date();
  const abs = (p: string) => base + (p === "/" ? "" : p);

  const grupo: Record<string, string> = {};
  for (const [tag, caminho] of Object.entries(HREFLANG)) grupo[tag] = abs(caminho);

  // Uma entrada por home, sem repetir a "/" do x-default.
  const homes = Array.from(new Set(Object.values(HREFLANG))).map((caminho) => ({
    url: abs(caminho),
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: caminho === "/" ? 1 : 0.9,
    alternates: { languages: grupo },
  }));

  const paginas = CHAVES.filter((c) => !PRIVADAS.includes(c) && !HOMES_DE_MERCADO.includes(c)).flatMap((chave) => {
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

  return [...homes, ...paginas];
}
