import { NextResponse, type NextRequest } from "next/server";

/* =====================================================================
   DETECÇÃO DE IDIOMA
   ---------------------------------------------------------------------
   Comportamento, na ordem em que as regras são avaliadas:

   1. Só age na RAIZ (`/`). Quem pede `/es` recebe `/es`, quem pede
      qualquer outra rota é deixado em paz. Redirecionar a partir de
      qualquer caminho quebra link direto e campanha.

   2. Cookie `dm_lang` manda mais que tudo. Se a pessoa clicou PT ou ES
      no seletor, essa escolha vale para sempre. Detecção que ignora
      escolha explícita é a forma mais rápida de irritar alguém.

   3. Sem cookie, lê `Accept-Language`. Só redireciona se espanhol
      estiver à FRENTE de português na lista de preferências. Um
      brasileiro que tem `es` como terceiro idioma continua em português.

   4. Não redireciona robô. Googlebot precisa ver as duas versões como
      elas são; se o crawler cair sempre em `/es`, a home em português
      pode sair do índice.

   O padrão é português. Espanhol é desvio, não destino.
   ===================================================================== */

const ROBOS = /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|whatsapp|telegram|lighthouse|headless/i;

/** Lê Accept-Language e devolve o idioma preferido entre pt e es. */
function idiomaPreferido(cabecalho: string | null): "pt" | "es" | null {
  if (!cabecalho) return null;

  // "es-419,es;q=0.9,pt-BR;q=0.8" -> [{tag,q}] ordenado por q
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

export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname !== "/") return NextResponse.next();

  if (ROBOS.test(req.headers.get("user-agent") ?? "")) return NextResponse.next();

  const escolhido = req.cookies.get("dm_lang")?.value;
  if (escolhido === "pt") return NextResponse.next();
  if (escolhido === "es") return NextResponse.redirect(new URL("/es", req.url));

  if (idiomaPreferido(req.headers.get("accept-language")) === "es") {
    const r = NextResponse.redirect(new URL("/es", req.url));
    // Vary avisa cache e CDN de que a resposta depende do idioma pedido.
    // Sem isso, a Vercel pode servir o redirect a todo mundo.
    r.headers.set("Vary", "Accept-Language, Cookie");
    return r;
  }

  const r = NextResponse.next();
  r.headers.set("Vary", "Accept-Language, Cookie");
  return r;
}

export const config = {
  // Fora do middleware: api, assets do Next, arquivos de ícone e tudo que
  // tenha extensão. Middleware em asset é custo puro.
  matcher: ["/((?!api|_next/static|_next/image|icon|apple-icon|opengraph-image|favicon|robots|sitemap|.*\\..*).*)"],
};
