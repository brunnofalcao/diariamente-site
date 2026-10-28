import { PaginaObrigado, metadataDoObrigado, type Busca } from "@/components/PaginaObrigado";

// Português de Portugal. O caminho decide o idioma. Regras: docs/POS-PAGAMENTO.md.

// Lê user-agent, cookie e parâmetros a cada visita (e a página é noindex).
export const dynamic = "force-dynamic";

export const metadata = metadataDoObrigado("aguardando-pagamento", "pt-pt");

export default function ObrigadoAguardandoPagamento(props: { searchParams: Busca }) {
  return <PaginaObrigado estado="aguardando-pagamento" local="pt-pt" searchParams={props.searchParams} />;
}
