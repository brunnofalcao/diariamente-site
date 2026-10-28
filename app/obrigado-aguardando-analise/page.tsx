import { PaginaObrigado, metadataDoObrigado, type Busca } from "@/components/PaginaObrigado";

// pt-BR, sem prefixo: é a URL que vai na Hotmart. Quem não lê em pt-BR já
// foi levado pelo middleware para /es, /es-es ou /pt-pt (lib/obrigado.mjs,
// destinoDoObrigado), com todos os parâmetros. Regras: docs/POS-PAGAMENTO.md.

// Lê user-agent, cookie e parâmetros a cada visita (e a página é noindex).
export const dynamic = "force-dynamic";

export const metadata = metadataDoObrigado("aguardando-analise", "pt");

export default function ObrigadoAguardandoAnalise(props: { searchParams: Busca }) {
  return <PaginaObrigado estado="aguardando-analise" local="pt" searchParams={props.searchParams} />;
}
