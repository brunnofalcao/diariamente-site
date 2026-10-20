import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

/* =====================================================================
   PRÉVIA DE LINK DO /es (WhatsApp, Instagram, Facebook, X, LinkedIn)
   ---------------------------------------------------------------------
   Vale para /es e para tudo abaixo dele (acerca-de, estudiantes,
   privacidad, condicionesdeuso, embreve): o Next usa a imagem do
   segmento mais próximo da página, e as páginas em português continuam
   com app/opengraph-image.png.

   Mesma peça da imagem em português, com uma linha em espanhol entre a
   marca e a sequência. O lockup (símbolo + escrito em Literata) e a
   sequência NÃO são redesenhados: saem recortados, pixel a pixel, da
   própria app/opengraph-image.png. Assim não há segunda versão da marca
   para manter, e não é preciso carregar fonte de fora (o gerador não
   aceita woff2, e buscar a Literata no Google a cada build criaria uma
   dependência externa para o card). A linha em espanhol usa a Noto Sans
   Regular, a sem serifa que vinha embutida no gerador do Next 14,
   próxima da Inter do site. Desde o Next 15 o gerador embute a Geist
   no lugar dela; por isso o arquivo (o mesmo do Next 14, 27.748 bytes,
   SIL Open Font License 1.1, copyright e licença dentro do .ttf) fica
   aqui ao lado e entra em `fonts`, com o mesmo nome e peso que o
   gerador do 14 usava. Sem isso a linha muda de letra no card.

   Gerada no build (estática): nada roda quando alguém compartilha.
   Medidas tiradas da imagem original (1200x630, fundo #0A0E0E):
     lockup     x 343 a 859, y 249 a 318
     sequência  x 509 a 723, y 425 a 431
   ===================================================================== */

export const alt = "diariamente · una práctica diaria de hábitos y bienestar";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const FUNDO = "#0A0E0E"; // S0 do brandbook, o mesmo da imagem original
const TEXTO = "#AAB2B2"; // N300, cor do texto secundário do site

/** Recorte da imagem original: mostra só o retângulo `de`, colocado em `em`. */
function Recorte({
  src,
  de,
  em,
}: {
  src: string;
  de: { x: number; y: number; w: number; h: number };
  em: { x: number; y: number };
}) {
  return (
    <div
      style={{
        position: "absolute",
        left: em.x,
        top: em.y,
        width: de.w,
        height: de.h,
        overflow: "hidden",
        display: "flex",
      }}
    >
      <img
        src={src}
        alt=""
        width={size.width}
        height={size.height}
        style={{ position: "absolute", left: -de.x, top: -de.y }}
      />
    </div>
  );
}

export default async function Image() {
  const original = await readFile(join(process.cwd(), "app", "opengraph-image.png"));
  const src = `data:image/png;base64,${original.toString("base64")}`;
  const notoSans = await readFile(join(process.cwd(), "app", "es", "noto-sans-v27-latin-regular.ttf"));

  // O lockup sobe 19 px para abrir espaço à linha em espanhol; a
  // sequência fica exatamente onde estava.
  const SUBIDA = 19;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: FUNDO,
        }}
      >
        <Recorte src={src} de={{ x: 333, y: 239, w: 536, h: 90 }} em={{ x: 333, y: 239 - SUBIDA }} />

        <div
          style={{
            position: "absolute",
            left: 0,
            top: 344,
            width: size.width,
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: TEXTO,
            fontSize: 26,
            lineHeight: 1,
            letterSpacing: "-0.005em",
          }}
        >
          Una práctica diaria de hábitos y bienestar
        </div>

        <Recorte src={src} de={{ x: 503, y: 420, w: 226, h: 17 }} em={{ x: 503, y: 420 }} />
      </div>
    ),
    {
      ...size,
      // Mesmo nome e peso da fonte padrão do gerador do Next 14.
      fonts: [{ name: "sans serif", data: notoSans, weight: 700, style: "normal" }],
    },
  );
}
