import { NextResponse, type NextRequest } from "next/server";
import {
  decidirRota,
  ehRobo,
  mercadoDaVisita,
  mercadoDoPais,
  COOKIE_MERCADO,
  COOKIE_MERCADO_SEGUNDOS,
  COOKIE_VISITA,
  COOKIE_VISITA_SEGUNDOS,
  type Pedido,
} from "@/lib/mercado";
import { CAMINHOS, destinoDoBaixar, destinoDoObrigado } from "@/lib/obrigado.mjs";
import { LOJAS_DO_LOCAL } from "@/lib/i18n";
import { SITE_LANCADO } from "@/config/lancamento";
import { mercadosDasOfertasDoEstudante } from "@/config/pricing";

/* =====================================================================
   ROTEAMENTO POR GEOGRAFIA
   ---------------------------------------------------------------------
   Antes: idioma do navegador. Agora: país do IP, via x-vercel-ip-country
   (handoff, seção 5). Idioma não decide moeda: português tem duas (BRL e
   EUR) e espanhol tem duas (USD e EUR).

   A decisão inteira mora em lib/mercado.ts (decidirRota), testada em
   test/mercado.test.js e test/standby.test.js. Aqui só se aplica o
   resultado, com a chave de lançamento (config/lancamento.ts):

   STANDBY (chave desligada, padrão): as homes mostram a lista de espera
   e cada país vai para a sua home, como a produção antes do lançamento,
   SEM a reescrita de "/" para /mundo. O site de vendas de cada mercado
   fica na vitrine, com o idioma na frente (/vendas, /es/vendas,
   /es-es/vendas, /pt-pt/vendas e /mundo/vendas; lib/mercado.ts,
   VENDAS_DO_MERCADO), e abre como foi pedido, de qualquer país. As
   prévias antigas (/embreve, /es/embreve, /pt-pt/embreve,
   /es-es/embreve) e os endereços antigos da vitrine (/vendas/es,
   /vendas/es-es, /vendas/pt-pt, /vendas/mundo) redirecionam (307, com
   os parâmetros) para a vitrine do mercado.

   LANÇADO (DM_SITE_LANCADO=1 no build):

     - só as homes (/, /es, /pt-pt, /es-es) decidem mercado
     - robô e prévia de link nunca são redirecionados
     - ?mercado=xx (seletor do rodapé) grava o cookie dm_market, 180 dias,
       e vence o país
     - sem cabeçalho de país, o idioma do navegador decide, como antes
     - resto do mundo fica em "/", reescrita para a rota interna com o
       bloco em dólar
     - utm, fbclid e gclid seguem junto em todo redirecionamento
     - a vitrine (/vendas, /es/vendas, /es-es/vendas, /pt-pt/vendas,
       /mundo/vendas) e os endereços antigos dela (/vendas/es...)
       redirecionam para a home real do mercado

   Vary: país, idioma e cookie. Sem isso o CDN pode servir o
   redirecionamento em cache para todo mundo.

   PÓS-PAGAMENTO (docs/POS-PAGAMENTO.md; regras em lib/obrigado.mjs),
   antes da decisão das homes. Dois idiomas, pt e es:
     - as três URLs de obrigado sem prefixo (as da Hotmart) e o
       /obrigado antigo descobrem o idioma (oferta de um mercado só no
       ?off=, cookie dm_mercado, ?lang=, Accept-Language, país do IP) e,
       se for espanhol, vão para a rota em espanhol do mesmo status
       (/es/gracias-aprobado, /es/gracias-pago-pendiente,
       /es/gracias-en-analisis): 307 com a busca INTEIRA (transaction,
       off, utm...)
     - /baixar e /es/descargar: iPhone e iPad vão direto para a App Store
       do idioma, Android para o Google Play (302); /baixar?lang=es no
       computador vai para /es/descargar (307); computador, aparelho
       desconhecido e robô veem a página
   E, depois da decisão, o cookie dm_mercado (lib/mercado.ts,
   mercadoDaVisita) em toda página de mercado que abre: homes e páginas
   de venda. É ele que diz às páginas de obrigado em que idioma a pessoa
   estava quando pagou.

   No Next.js 16 este arquivo passa a se chamar proxy.ts.
   Mantido como middleware.ts DE PROPÓSITO: proxy.ts roda só em Node.js,
   e este arquivo roda no Edge da Vercel. Renomear muda onde e como cada
   visita às homes é processada (e cobrada). O build avisa que o nome
   está obsoleto; o aviso é esperado. Trocar numa entrega própria.
   ===================================================================== */

const VARY = "x-vercel-ip-country, Accept-Language, Cookie";

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const userAgent = req.headers.get("user-agent");
  const idiomas = req.headers.get("accept-language");
  const pais = req.headers.get("x-vercel-ip-country");

  // Pós-pagamento: a URL da Hotmart, sem prefixo, leva ao idioma de quem pagou.
  const obrigado = destinoDoObrigado({
    pathname,
    busca: req.nextUrl.search,
    cookie: req.cookies.get(COOKIE_VISITA)?.value,
    idiomas,
    // Sem cabeçalho de país (ambiente local), o país não decide.
    mercadoDoIp: pais ? mercadoDoPais(pais) : null,
    // As ofertas de estudante (do Brasil): o código fica só no servidor.
    ofertasExtras: mercadosDasOfertasDoEstudante(),
  });
  if (obrigado) {
    const r = NextResponse.redirect(new URL(obrigado, req.url));
    r.headers.set("Vary", VARY);
    return r;
  }

  // /baixar e /es/descargar: o celular vai direto para a loja do idioma.
  if (!ehRobo(userAgent)) {
    const baixar = destinoDoBaixar({ pathname, busca: req.nextUrl.search, userAgent }, LOJAS_DO_LOCAL);
    if (baixar) {
      const r =
        baixar.status === 302
          ? NextResponse.redirect(baixar.destino, 302)
          : NextResponse.redirect(new URL(baixar.destino, req.url), 307);
      r.headers.set("Vary", "User-Agent");
      return r;
    }
  }

  const pedido: Pedido = {
    pathname,
    busca: req.nextUrl.search,
    userAgent,
    cookie: req.cookies.get(COOKIE_MERCADO)?.value,
    pais,
    idiomas,
    lancado: SITE_LANCADO,
  };
  const d = decidirRota(pedido);

  let r: NextResponse;
  if (d.tipo === "redirecionar") {
    r = NextResponse.redirect(new URL(d.destino, req.url));
    if (d.cookie) {
      r.cookies.set(COOKIE_MERCADO, d.cookie, {
        path: "/",
        maxAge: COOKIE_MERCADO_SEGUNDOS,
        sameSite: "lax",
      });
    }
  } else if (d.tipo === "reescrever") {
    const url = req.nextUrl.clone();
    url.pathname = d.destino;
    r = NextResponse.rewrite(url);
  } else {
    r = NextResponse.next();
  }
  if (d.vary) r.headers.set("Vary", VARY);
  // O computador que abre o /baixar vê a página; no celular, o 302 acima.
  if (pathname === CAMINHOS.pt.baixar || pathname === CAMINHOS.es.baixar) r.headers.set("Vary", "User-Agent");

  // Página de mercado que abriu: anota o mercado para as páginas de obrigado.
  const visita = mercadoDaVisita(pedido, d);
  if (visita) {
    r.cookies.set(COOKIE_VISITA, visita, {
      path: "/",
      maxAge: COOKIE_VISITA_SEGUNDOS,
      sameSite: "lax",
      secure: true,
    });
  }
  return r;
}

export const config = {
  // Fora do middleware: api, assets do Next, arquivos de ícone e tudo que
  // tenha extensão. Middleware em asset é custo puro. A vitrine
  // (/es/vendas, /mundo/vendas...) e os endereços antigos dela passam por
  // aqui.
  matcher: ["/((?!api|_next/static|_next/image|icon|apple-icon|opengraph-image|favicon|robots|sitemap|.*\\..*).*)"],
};
