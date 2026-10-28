import { PaginaObrigado, metadataDoObrigado, type Busca } from "@/components/PaginaObrigado";

// pt-BR, sem prefixo: é a URL que vai na Hotmart. Quem lê em espanhol já
// foi levado pelo middleware para a versão em espanhol (lib/obrigado.mjs,
// destinoDoObrigado), com todos os parâmetros. Regras: docs/POS-PAGAMENTO.md.

// Lê user-agent, cookie, país e parâmetros a cada visita (e a página é noindex).
export const dynamic = "force-dynamic";

export const metadata = metadataDoObrigado("aprovado", "pt");

export default function ObrigadoAprovado(props: { searchParams: Busca }) {
  return <PaginaObrigado estado="aprovado" local="pt" searchParams={props.searchParams} />;
}
