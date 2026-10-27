import { ESTUDANTE_ATUAL } from "@/config";

/* =====================================================================
   TELA HOJE DA PRODUÇÃO · o hero da /estudante em STANDBY
   ---------------------------------------------------------------------
   O mockup Tela_HOJE do Cloudinary dentro da moldura de celular, como a
   produção (main, 0a25ffa) mostra hoje. Só em standby (chave de
   lançamento desligada, config/lancamento.ts); ligada a chave, o hero é
   a arte Hoje das lojas (components/TelaDaLoja.tsx).

   As classes ed-phone-moldura e ed-phone-moldura-shot (estudante.css)
   repõem a moldura e o espaço reservado da main só aqui.
   ===================================================================== */

/* Cloudinary: formato e qualidade automáticos + largura sob medida.
   Corta peso do hero sem tocar no asset original. */
function cld(url: string, t: string): string {
  return url.includes("/upload/") ? url.replace("/upload/", `/upload/${t}/`) : url;
}

export function TelaHojeAtual() {
  const tela = ESTUDANTE_ATUAL.telaHoje;
  return (
    <div className="ed-phone-moldura-shot">
      <img
        src={cld(tela, "f_auto,q_auto,w_640")}
        srcSet={`${cld(tela, "f_auto,q_auto,w_360")} 360w, ${cld(tela, "f_auto,q_auto,w_640")} 640w, ${cld(tela, "f_auto,q_auto,w_900")} 900w`}
        sizes="(min-width: 1024px) 300px, 74vw"
        alt={ESTUDANTE_ATUAL.telaHojeAlt}
        fetchPriority="high"
        decoding="async"
      />
    </div>
  );
}
