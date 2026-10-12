import { NextResponse, type NextRequest } from "next/server";
import { decidirRota, COOKIE_MERCADO, COOKIE_MERCADO_SEGUNDOS } from "@/lib/mercado";

/* =====================================================================
   ROTEAMENTO POR GEOGRAFIA
   ---------------------------------------------------------------------
   Antes: idioma do navegador. Agora: país do IP, via x-vercel-ip-country
   (handoff, seção 5). Idioma não decide moeda: português tem duas (BRL e
   EUR) e espanhol tem duas (USD e EUR).

   A decisão inteira mora em lib/mercado.ts (decidirRota), testada em
   test/mercado.test.js. Aqui só se aplica o resultado:

     - só as homes (/, /es, /pt-pt, /es-es) decidem mercado
     - robô e prévia de link nunca são redirecionados
     - ?mercado=xx (seletor do rodapé) grava o cookie dm_market, 180 dias,
       e vence o país
     - sem cabeçalho de país, o idioma do navegador decide, como antes
     - resto do mundo fica em "/", reescrita para a rota interna com o
       bloco em dólar
     - utm, fbclid e gclid seguem junto em todo redirecionamento

   Vary: país, idioma e cookie. Sem isso o CDN pode servir o
   redirecionamento em cache para todo mundo.

   No Next.js 16 este arquivo passa a se chamar proxy.ts.
   ===================================================================== */

const VARY = "x-vercel-ip-country, Accept-Language, Cookie";

export function middleware(req: NextRequest) {
  const d = decidirRota({
    pathname: req.nextUrl.pathname,
    busca: req.nextUrl.search,
    userAgent: req.headers.get("user-agent"),
    cookie: req.cookies.get(COOKIE_MERCADO)?.value,
    pais: req.headers.get("x-vercel-ip-country"),
    idiomas: req.headers.get("accept-language"),
  });

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
  return r;
}

export const config = {
  // Fora do middleware: api, assets do Next, arquivos de ícone e tudo que
  // tenha extensão. Middleware em asset é custo puro.
  matcher: ["/((?!api|_next/static|_next/image|icon|apple-icon|opengraph-image|favicon|robots|sitemap|.*\\..*).*)"],
};
