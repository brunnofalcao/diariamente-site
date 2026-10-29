import { PaginaObrigado, metadataDoObrigado, type Busca } from "@/components/PaginaObrigado";

// Inglês dos Estados Unidos, com o endereço em inglês: a URL direta para
// uma futura oferta só dos Estados Unidos. Quem chega pela URL automática
// (sem prefixo, a da oferta em dólar) e é dos Estados Unidos ou de outro
// país fora do Brasil, de Portugal, da Espanha e da América Latina é
// trazido para cá pelo middleware, com todos os parâmetros
// (lib/obrigado.mjs, destinoDoObrigado). Aqui o caminho decide o idioma.
// Regras: docs/POS-PAGAMENTO.md.

// Lê user-agent, cookie, país e parâmetros a cada visita (e a página é noindex).
export const dynamic = "force-dynamic";

export const metadata = metadataDoObrigado("aguardando-analise", "en");

export default function ThankYouUnderReview(props: { searchParams: Busca }) {
  return <PaginaObrigado estado="aguardando-analise" local="en" searchParams={props.searchParams} />;
}
