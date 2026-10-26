import type { Metadata } from "next";
import { headers } from "next/headers";
import { ObrigadoShell } from "@/components/ObrigadoShell";
import { idiomaDoObrigado, TEXTOS } from "@/lib/obrigado.mjs";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

// pt ou es: ?lang= manda, depois o idioma do navegador (lib/obrigado.mjs),
// como nas outras duas páginas de obrigado. Antes desta página ler o
// idioma, ?lang=es saía em português.
async function idioma(props: Props) {
  const busca = await props.searchParams;
  const cabecalhos = await headers();
  return idiomaDoObrigado(busca.lang, cabecalhos.get("accept-language"));
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const t = TEXTOS["aguardando-analise"][await idioma(props)];
  return {
    title: t.aba,
    description: t.descricao,
    robots: { index: false, follow: false },
  };
}

// Sem Purchase aqui: o pagamento ainda não foi confirmado.
export default async function ObrigadoAguardandoAnalise(props: Props) {
  const lang = await idioma(props);
  return <ObrigadoShell estado="aguardando-analise" lang={lang} />;
}
