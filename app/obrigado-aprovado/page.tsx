import type { Metadata } from "next";
import { headers } from "next/headers";
import { ObrigadoShell } from "@/components/ObrigadoShell";
import { PurchaseTracking } from "@/components/PurchaseTracking";
import { idiomaDoObrigado, TEXTOS } from "@/lib/obrigado.mjs";

// Parâmetros que a Hotmart manda (transaction, price...) e ?lang=. O
// PurchaseTracking lê os mesmos parâmetros direto da URL, no navegador.
type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

// pt ou es: ?lang= manda, depois o idioma do navegador (lib/obrigado.mjs).
// Ler o pedido deixa a página dinâmica, o que aqui é o certo: o idioma
// muda por visita e a página é noindex.
async function idioma(props: Props) {
  const busca = await props.searchParams;
  const cabecalhos = await headers();
  return idiomaDoObrigado(busca.lang, cabecalhos.get("accept-language"));
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const t = TEXTOS.aprovado[await idioma(props)];
  return {
    title: t.aba,
    description: t.descricao,
    robots: { index: false, follow: false },
  };
}

export default async function ObrigadoAprovado(props: Props) {
  const lang = await idioma(props);
  return (
    <>
      {/* Purchase dispara SÓ aqui. Nas telas de boleto/Pix pendente e de
          análise a venda ainda não existe: disparar lá inflaria o pixel.
          As páginas antigas do app (obrigado-aprovado.html) só redirecionam
          para cá, sem pixel, para o evento não sair duas vezes. */}
      <PurchaseTracking />
      <ObrigadoShell estado="aprovado" lang={lang} />
    </>
  );
}
