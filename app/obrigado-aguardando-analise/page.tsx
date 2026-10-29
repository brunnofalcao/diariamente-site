import { PaginaObrigado, metadataDoObrigado, type Busca } from "@/components/PaginaObrigado";

// pt-BR, sem prefixo: a URL automática, a que vai nas ofertas do Brasil e
// na oferta em dólar (América Latina e Estados Unidos e demais países).
// Quem não lê em pt-BR já foi levado pelo middleware para a rota do seu
// local (/pt-pt, /es ou /en; lib/obrigado.mjs, destinoDoObrigado), com
// todos os parâmetros. Regras: docs/POS-PAGAMENTO.md.

// Lê user-agent, cookie, país e parâmetros a cada visita (e a página é noindex).
export const dynamic = "force-dynamic";

export const metadata = metadataDoObrigado("aguardando-analise", "pt");

export default function ObrigadoAguardandoAnalise(props: { searchParams: Busca }) {
  return <PaginaObrigado estado="aguardando-analise" local="pt" searchParams={props.searchParams} />;
}
