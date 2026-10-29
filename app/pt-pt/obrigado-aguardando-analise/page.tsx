import { PaginaObrigado, metadataDoObrigado, type Busca } from "@/components/PaginaObrigado";

// Português de Portugal: a URL que vai na oferta de Portugal (3n484jbe,
// euro). Quem chega pela URL automática (sem prefixo) e é de Portugal
// também é trazido para cá pelo middleware, com todos os parâmetros
// (lib/obrigado.mjs, destinoDoObrigado). Aqui o caminho decide o idioma.
// Regras: docs/POS-PAGAMENTO.md.

// Lê user-agent, cookie, país e parâmetros a cada visita (e a página é noindex).
export const dynamic = "force-dynamic";

export const metadata = metadataDoObrigado("aguardando-analise", "pt-pt");

export default function ObrigadoAguardandoAnalisePortugal(props: { searchParams: Busca }) {
  return <PaginaObrigado estado="aguardando-analise" local="pt-pt" searchParams={props.searchParams} />;
}
