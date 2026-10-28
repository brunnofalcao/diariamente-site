import { PaginaObrigado, metadataDoObrigado, type Busca } from "@/components/PaginaObrigado";

// Espanhol da Espanha. O caminho decide o idioma. Regras: docs/POS-PAGAMENTO.md.

// Lê user-agent, cookie e parâmetros a cada visita (e a página é noindex).
export const dynamic = "force-dynamic";

export const metadata = metadataDoObrigado("aguardando-analise", "es-es");

export default function ObrigadoAguardandoAnalise(props: { searchParams: Busca }) {
  return <PaginaObrigado estado="aguardando-analise" local="es-es" searchParams={props.searchParams} />;
}
