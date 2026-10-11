import { NextResponse, type NextRequest } from "next/server";
import { mercadoDoPais, HOME_DO_MERCADO } from "@/lib/mercado";
import type { Mercado } from "@/config/pricing";

/* =====================================================================
   ROTEAMENTO POR GEOGRAFIA
   ---------------------------------------------------------------------
   Antes: idioma do navegador. Agora: país do IP, via x-vercel-ip-country.
   O motivo é simples e já estava no handoff: idioma não decide moeda.
   Português tem duas (BRL e EUR) e espanhol tem duas (USD e EUR).

   Ordem de decisão:

   1. Só as HOMES decidem mercado. Página interna abre como foi pedida,
      e anúncio aponta direto para a home do mercado, sem depender de
      detecção nenhuma.

   2. ?mercado=xx grava o cookie e manda para a home daquele mercado.
      É o que o seletor do rodapé usa.

   3. Cookie dm_market (180 dias) vence o país do IP. Escolha explícita
      sempre ganha de adivinhação.

   4. Robô e preview de link nunca são redirecionados. Se o Googlebot
      cair sempre em /es, a home brasileira pode sair do índice, e o card
      do WhatsApp precisa sair no idioma da URL compartilhada.

   5. Sem cabeçalho de país (ambiente local, por exemplo), cai no idioma
      do navegador, como antes.

   Vary: x-vercel-ip-country e Cookie. Sem isso o CDN pode servir o
   redirecionamento em cache para todo mundo.

   No Next.js 16 este arquivo passa a se chamar proxy.ts.
   ===================================================================== */

const ROBOS = /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|whatsapp|telegram|lighthouse|headless/i;
const HOMES = new Set(Object.values(HOME_DO_MERCADO));
const VALIDOS = new Set<Mercado>(["br", "la", "es", "pt", "rw"]);

function idiomaDoNavegador(cabecalho: string | null): "pt" | "es" | null {
  if (!cabecalho) return null;
  const itens = cabecalho
    .split(",")
    .map((parte) => {
      const [tag, ...params] = parte.trim().split(";");
      const q = params.find((p) => p.trim().startsWith("q="));
      return { tag: tag.toLowerCase(), q: q ? parseFloat(q.split("=")[1]) : 1 };
    })
    .filter((i) => i.tag && !Number.isNaN(i.q))
    .sort((a, b) => b.q - a.q);
  for (const { tag } of itens) {
    if (tag.startsWith("es")) return "es";
    if (tag.startsWith("pt")) return "pt";
  }
  return null;
}

function comVary(r: NextResponse) {
  r.headers.set("Vary", "x-vercel-ip-country, Accept-Language, Cookie");
  return r;
}

function fixar(req: NextRequest, destino: string, mercado: Mercado) {
  const url = new URL(destino, req.url);
  const r = NextResponse.redirect(url);
  r.cookies.set("dm_market", mercado, {
    path: "/",
    maxAge: 60 * 60 * 24 * 180,
    sameSite: "lax",
  });
  return comVary(r);
}

export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  // 2 · escolha explícita pelo seletor do rodapé
  const pedido = searchParams.get("mercado");
  if (pedido && VALIDOS.has(pedido as Mercado)) {
    return fixar(req, HOME_DO_MERCADO[pedido as Mercado], pedido as Mercado);
  }

  // 1 · só as homes decidem
  if (!HOMES.has(pathname)) return NextResponse.next();

  // 4 · robô recebe o que pediu
  if (ROBOS.test(req.headers.get("user-agent") ?? "")) return NextResponse.next();

  // 3 · cookie vence o IP
  const salvo = req.cookies.get("dm_market")?.value as Mercado | undefined;
  if (salvo && VALIDOS.has(salvo)) {
    const destino = HOME_DO_MERCADO[salvo];
    return destino === pathname ? comVary(NextResponse.next()) : comVary(NextResponse.redirect(new URL(destino, req.url)));
  }

  // país do IP
  const pais = req.headers.get("x-vercel-ip-country");
  if (pais) {
    const destino = HOME_DO_MERCADO[mercadoDoPais(pais)];
    return destino === pathname ? comVary(NextResponse.next()) : comVary(NextResponse.redirect(new URL(destino, req.url)));
  }

  // 5 · sem país: idioma do navegador
  if (pathname === "/" && idiomaDoNavegador(req.headers.get("accept-language")) === "es") {
    return comVary(NextResponse.redirect(new URL("/es", req.url)));
  }
  return comVary(NextResponse.next());
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|icon|apple-icon|opengraph-image|favicon|robots|sitemap|.*\\..*).*)"],
};
