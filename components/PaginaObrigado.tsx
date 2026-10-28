import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { SITE } from "@/config";
import { ObrigadoShell } from "@/components/ObrigadoShell";
import { PurchaseTracking } from "@/components/PurchaseTracking";
import { textosDo } from "@/components/PosPagamento";
import { COOKIE_VISITA, mercadoDoPais } from "@/lib/mercado";
import {
  aparelhoDoUserAgent,
  caminhoDoObrigado,
  formaDoPagamento,
  linhaDoLog,
  mercadoDoObrigado,
  primeiro,
} from "@/lib/obrigado.mjs";
import { OG_LOCALE, moedaDoMercado, valorDoPedido, type Estado, type Local } from "@/lib/pos-pagamento";
import { mercadosDasOfertasDoEstudante } from "@/config/pricing";

/* =====================================================================
   PÁGINA DE OBRIGADO · o que roda no servidor
   ---------------------------------------------------------------------
   Cada rota (app/obrigado-<status>/page.tsx em pt e
   app/es/gracias-<status>/page.tsx em espanhol) só diz o status e o
   local; o resto mora aqui:

     - o idioma já veio decidido pelo CAMINHO. As três URLs sem prefixo
       (as da Hotmart) passam antes pelo middleware, que leva quem lê em
       espanhol para a rota em espanhol (lib/obrigado.mjs,
       destinoDoObrigado). Nada de ?lang= aqui.
     - o aparelho, pelo user-agent (iPhone, Android ou computador), para
       mostrar a loja certa ou o QR code
     - o MERCADO do pedido (lib/obrigado.mjs, mercadoDoObrigado: a oferta
       ?off=, o cookie dm_mercado e o país do IP, quando são do idioma da
       página): decide a moeda e o valor do Purchase na aprovada e, no
       pendente, se Pix e boleto aparecem (só no mercado br; quem lê em
       português e paga em dólar ou euro vê a linha geral)
     - a forma de pagamento, se a URL disser (só muda o pendente do Brasil)
     - LOG DE APRENDIZADO: uma linha com o status, o local e só os NOMES
       dos parâmetros que chegaram (nunca os valores), para descobrirmos o
       que a Hotmart manda (lib/obrigado.mjs, linhaDoLog)
     - o Purchase (Meta Pixel e GA4) SÓ na aprovada, com a moeda e o valor
       do mercado do pedido (lib/pos-pagamento.ts, valorDoPedido) e só com
       a medição liberada (components/Consentimento.tsx: quem recusou os
       cookies não manda nada, nem em standby)

   Dinâmica de propósito (cada rota exporta dynamic = "force-dynamic"):
   lê cabeçalhos, cookie e parâmetros a cada visita, e a página é
   noindex (meta aqui e cabeçalho X-Robots-Tag em next.config.js). Nunca
   vai para cache de CDN.
   ===================================================================== */

export type Busca = Promise<Record<string, string | string[] | undefined>>;

/** Metadata de toda página de obrigado: noindex, nofollow, canonical para si. */
export function metadataDoObrigado(estado: Estado, local: Local): Metadata {
  const t = textosDo(local)[estado];
  const proprio = SITE.dominio + caminhoDoObrigado(estado, local);
  return {
    title: t.aba,
    description: t.descricao,
    // Sobrescreve o canonical "/" e o hreflang que o layout raiz declara.
    alternates: { canonical: proprio },
    openGraph: { title: t.aba, description: t.descricao, url: proprio, locale: OG_LOCALE[local] },
    robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
  };
}

export async function PaginaObrigado({
  estado,
  local,
  searchParams,
}: {
  estado: Estado;
  local: Local;
  searchParams: Busca;
}) {
  const busca = await searchParams;
  const cabecalhos = await headers();
  const biscoitos = await cookies();

  // Só os NOMES dos parâmetros, ordenados. Valor nunca (pode ter e-mail).
  console.log(linhaDoLog(estado, local, busca));

  const aparelho = aparelhoDoUserAgent(cabecalhos.get("user-agent"));
  const forma = estado === "aguardando-pagamento" ? formaDoPagamento(busca) : null;
  const off = primeiro(busca.off);
  // Sem cabeçalho de país (ambiente local), o país não decide.
  const pais = cabecalhos.get("x-vercel-ip-country");
  const mercado = mercadoDoObrigado(local, {
    cookie: biscoitos.get(COOKIE_VISITA)?.value,
    off,
    mercadoDoIp: pais ? mercadoDoPais(pais) : null,
    // As ofertas de estudante são do Brasil: o código fica só no servidor.
    ofertasExtras: mercadosDasOfertasDoEstudante(),
  });

  if (estado !== "aprovado") {
    // Sem Purchase aqui: a venda ainda não existe (pendente ou em análise).
    return <ObrigadoShell estado={estado} local={local} aparelho={aparelho} forma={forma} mercado={mercado} />;
  }

  return (
    <>
      {/* Purchase dispara SÓ aqui, na aprovada. As páginas antigas do app
          (obrigado-aprovado.html) só redirecionam para cá, sem pixel, para
          o evento não sair duas vezes. */}
      <PurchaseTracking moeda={moedaDoMercado(mercado)} valor={valorDoPedido(mercado, off)} />
      <ObrigadoShell estado="aprovado" local={local} aparelho={aparelho} mercado={mercado} />
    </>
  );
}
