import type { CSSProperties } from "react";
import { TELA_FALLBACK, TELA_LARGURAS, TELA_PROPORCAO } from "@/lib/i18n";

/* =====================================================================
   TELA DA LOJA · a arte da App Store, servida do próprio domínio
   ---------------------------------------------------------------------
   `base` é o caminho sem largura nem extensão (lib/i18n.ts, telasDo):
   /telas/pt/hoje vira /telas/pt/hoje-360.webp, -560.webp e -840.webp, e
   /telas/pt/hoje-560.jpg para o navegador que não abre WebP.

   A arte já traz o fundo, a legenda e o aparelho, por isso não há moldura
   de celular: só os cantos arredondados e o filete dos cartões do site
   (rgba(255,255,255,.07)), com a sombra das telas. width e height da arte
   (1320 x 2868) reservam o espaço antes de a imagem chegar.

   `prioridade`: só para a tela da primeira dobra (/estudante). As outras
   ficam com loading="lazy".
   ===================================================================== */

export const RAIO_DA_TELA = 16;

export function TelaDaLoja({
  base,
  alt,
  sizes,
  prioridade = false,
  style,
}: {
  base: string;
  alt: string;
  /** Largura de exibição, para o navegador escolher no srcset. */
  sizes: string;
  prioridade?: boolean;
  style?: CSSProperties;
}) {
  return (
    <picture style={{ display: "block" }}>
      <source type="image/webp" srcSet={TELA_LARGURAS.map((w) => `${base}-${w}.webp ${w}w`).join(", ")} sizes={sizes} />
      <img
        src={`${base}-${TELA_FALLBACK}.jpg`}
        alt={alt}
        width={TELA_PROPORCAO.largura}
        height={TELA_PROPORCAO.altura}
        loading={prioridade ? "eager" : "lazy"}
        fetchPriority={prioridade ? "high" : undefined}
        decoding="async"
        style={{
          display: "block",
          width: "100%",
          height: "auto",
          aspectRatio: `${TELA_PROPORCAO.largura} / ${TELA_PROPORCAO.altura}`,
          borderRadius: RAIO_DA_TELA,
          background: "#111616",
          boxShadow: "0 0 0 1px rgba(255,255,255,.07), 0 18px 48px rgba(0,0,0,.45)",
          ...style,
        }}
      />
    </picture>
  );
}
