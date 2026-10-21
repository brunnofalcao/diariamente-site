import type { Metadata } from "next";
import { headers } from "next/headers";
import { ObrigadoShell } from "@/components/ObrigadoShell";
import { formaDoPagamento, idiomaDoObrigado, TEXTOS } from "@/lib/obrigado.mjs";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

// pt ou es: ?lang= manda, depois o idioma do navegador (lib/obrigado.mjs).
async function idioma(props: Props) {
  const busca = await props.searchParams;
  const cabecalhos = await headers();
  return idiomaDoObrigado(busca.lang, cabecalhos.get("accept-language"));
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const t = TEXTOS["aguardando-pagamento"][await idioma(props)];
  return {
    title: t.aba,
    description: t.descricao,
    robots: { index: false, follow: false },
  };
}

// Sem Purchase aqui: o pagamento ainda não foi confirmado.
export default async function ObrigadoAguardandoPagamento(props: Props) {
  const lang = await idioma(props);
  // Pix ou boleto, se a URL disser; outra forma, só as instruções no e-mail;
  // sem a forma na URL, a página mostra Pix e boleto.
  const forma = formaDoPagamento(await props.searchParams);
  return <ObrigadoShell estado="aguardando-pagamento" lang={lang} forma={forma} />;
}
