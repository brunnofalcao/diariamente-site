import { PaginaObrigado, metadataDoObrigado, type Busca } from "@/components/PaginaObrigado";

// Espanhol da América Latina, com o endereço em espanhol. Quem chega pela
// URL da Hotmart (sem prefixo) e lê em espanhol é trazido para cá pelo
// middleware, com todos os parâmetros (lib/obrigado.mjs,
// destinoDoObrigado). Aqui o caminho decide o idioma. Regras:
// docs/POS-PAGAMENTO.md.

// Lê user-agent, cookie, país e parâmetros a cada visita (e a página é noindex).
export const dynamic = "force-dynamic";

export const metadata = metadataDoObrigado("aguardando-analise", "es");

export default function GraciasEnAnalisis(props: { searchParams: Busca }) {
  return <PaginaObrigado estado="aguardando-analise" local="es" searchParams={props.searchParams} />;
}
