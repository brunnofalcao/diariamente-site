import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { headers } from "next/headers";
import { SITE } from "@/config";
import { TelaDaLoja } from "@/components/TelaDaLoja";
import { Final, InstalarApp, Inteiro, Moldura, Rico, textosDo } from "@/components/PosPagamento";
import { ATIVOS, dicionario } from "@/lib/i18n";
import { IDIOMA_DO_APP, aparelhoDoUserAgent, caminhoDoBaixar } from "@/lib/obrigado.mjs";
import { OG_LOCALE, type Local } from "@/lib/pos-pagamento";

/* =====================================================================
   /baixar · o app no celular, com o idioma na frente do endereço
   ---------------------------------------------------------------------
   /baixar (pt-BR), /es/baixar, /es-es/baixar e /pt-pt/baixar. É o
   endereço dos QR codes das páginas de obrigado (public/qr).

   No celular a pessoa nem vê esta página: o middleware manda iPhone e
   iPad para a App Store do idioma e Android para o Google Play (302;
   lib/obrigado.mjs, destinoDoBaixar). Aqui chega o computador, o
   aparelho desconhecido e o robô: QR code, as duas lojas, o primeiro
   acesso com o chip do botão do app e a versão web. Se um celular chegar
   aqui assim mesmo, vê o botão da loja dele (InstalarApp).

   noindex, fora do sitemap, canonical para si. O caminho decide o idioma.
   ===================================================================== */

export function metadataDoBaixar(local: Local): Metadata {
  const t = textosDo(local).baixar;
  const proprio = SITE.dominio + caminhoDoBaixar(local);
  return {
    title: t.aba,
    description: t.descricao,
    alternates: { canonical: proprio },
    openGraph: { title: t.aba, description: t.descricao, url: proprio, locale: OG_LOCALE[local] },
    robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
  };
}

export async function BaixarApp({ local }: { local: Local }) {
  const t = textosDo(local).baixar;
  const aparelho = aparelhoDoUserAgent((await headers()).get("user-agent"));
  const lang = IDIOMA_DO_APP[local] as "pt" | "es";
  const alt = dicionario(lang, local === "pt-pt" ? "pt" : undefined).t1alt;
  return (
    <Moldura local={local} larga>
      <div className="pp-baixar">
        <div>
          <section className="pp-hero">
            <h1 className="pp-titulo pp-surge" style={{ "--d": 1 } as CSSProperties}>
              <Inteiro texto={t.titulo[0]} />
              <br />
              <Inteiro texto={t.titulo[1]} />
            </h1>
            <p className="pp-sub pp-surge" style={{ "--d": 2 } as CSSProperties}>{t.texto}</p>
          </section>

          <section className="pp-cartao is-destaque pp-surge" style={{ "--d": 3 } as CSSProperties}>
            <InstalarApp
              local={local}
              aparelho={aparelho}
              computador={{ titulo: t.qrTitulo, texto: t.qrTexto, lojasAntes: t.lojasAntes }}
            />
            <p className="pp-texto pp-baixar-acesso">
              <Rico partes={t.primeiroAcesso} />
            </p>
          </section>
        </div>

        {/* Sem animação de entrada: some no celular (display: none) e voltar a
            aparecer reiniciaria a animação a cada troca de largura. */}
        <div className="pp-baixar-tela">
          <TelaDaLoja base={ATIVOS[lang].img.hoje} alt={alt} sizes="300px" prioridade />
        </div>
      </div>

      <Final local={local} webAntes={t.webAntes} webLink={t.webLink} frase={t.frase} />
    </Moldura>
  );
}
