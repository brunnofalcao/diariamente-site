import { metadataDaPagina } from "@/lib/seo";
import { SITE, EMPRESA, PLANO_APP, ESTUDANTE } from "@/config";
import { LockupHorizontal } from "@/components/Brand";

/* =====================================================================
   /sobre — informações gerais
   ---------------------------------------------------------------------
   Por que esta página existe:

   O bloco factual saiu da home para a home voltar a ser one page, com
   respiro e cara de produto. Mas ele NÃO virou página órfã: página sem
   link de entrada praticamente não é rastreada, e o conteúdo perderia a
   função que justificava existir.

   A solução é ser uma página REAL: linkada do rodapé de todas as
   páginas, presente no sitemap, indexável. O JSON-LD continua na home,
   que é a que disputa a busca.

   SEO   busca tradicional, por palavra-chave
   AEO   resposta direta (featured snippet, assistente de voz)
   GEO   mecanismos generativos, que leem texto renderizado

   Os três pedem a mesma coisa: fatos verificáveis, em prosa, com a
   pergunta respondida logo na primeira frase de cada bloco.
   ===================================================================== */

const TITULO = "Informações gerais · Diariamente";
const DESCRICAO =
  "O que é o Diariamente, para quem é, como funciona, o que não é e como funciona o acesso. Informações factuais sobre a prática diária de hábitos e bem-estar da Science Play.";

export const metadata = metadataDaPagina("sobre", "pt");

export default function Sobre() {
  return (
    <main className="sobre">
      <header className="sobre-top">
        <div className="wrap-content">
          <a href="/" aria-label="Voltar para a página inicial">
            <LockupHorizontal altura={24} />
          </a>
        </div>
      </header>

      <section style={{ paddingTop: "var(--sp12)" }}>
        <div className="wrap-content">
          <span className="overline eyebrow">Informações gerais</span>
          <h1 className="display-sm" style={{ margin: "var(--sp3) 0 var(--sp8)" }}>
            Sobre o Diariamente
          </h1>

          <div className="sobre-corpo">
<div className="stack body-sm muted">
              <p>
                <strong className="teal">O que é:</strong> o Diariamente é uma prática
                diária de hábitos e bem-estar, realizada pela Science Play. Um texto por dia
                que provoca uma reflexão e termina numa ação possível ainda hoje, com contador
                de voltas acumuladas, conquistas e lembrete diário no WhatsApp.
              </p>
              <p>
                <strong className="teal">Para quem é:</strong> qualquer pessoa que quer rotina
                e cadência para cuidar do próprio bem-estar, e que já tentou manter algo e
                parou. Quem já baixou, já pagou e já largou na segunda semana. A segmentação é
                por comportamento, nunca por condição de saúde: não é preciso ter uma crise
                para querer constância.
              </p>
              <p>
                <strong className="teal">Como funciona:</strong> o ritual tem três movimentos:
                provocação (interrompe o automático), reflexão (convida a pensar com honestidade)
                e ação (uma decisão possível ainda hoje). Em volta deles, o produto conta as
                voltas acumuladas, que nunca zeram. O acesso é enviado por e-mail após a
                confirmação.
              </p>
              <p>
                <strong className="teal">O que não é:</strong> não é terapia, tratamento nem
                substituto de acompanhamento profissional. Não trata, não diagnostica e não
                promete resultado clínico.
              </p>
              <p>
                <strong className="teal">Acesso:</strong> assinatura anual. Diariamente App,
                R$ 197 (R$ 137,90 na condição de lançamento). São 365 textos por ano; na
                renovação, um ciclo novo de conteúdo inédito. Garantia de 7 dias.
                Realização Science Play.
              </p>
              <ul className="geo-resumo">
                <li><b>Nome:</b> Diariamente App</li>
                <li><b>Categoria:</b> prática diária de hábitos e bem-estar</li>
                <li><b>Formato:</b> aplicativo para iPhone e Android</li>
                <li><b>Duração:</b> 365 dias, uma provocação por dia</li>
                <li><b>Preço:</b> R$ 197 · R$ 137,90 na condição de lançamento, ou 12x de R$ 14,26 no cartão (total R$ 171,12)</li>
                <li><b>Garantia:</b> 7 dias, incondicional</li>
                <li><b>Responsáveis:</b> Science Play · Science Play</li>
                <li><b>Inscrição:</b> {SITE.dominio.replace("https://", "")} · acesso enviado por e-mail</li>
              </ul>
            </div>
          </div>

          <p className="caption" style={{ marginTop: "var(--sp10)", color: "var(--n-500)" }}>
            Dúvidas sobre o produto: <a href={`mailto:${EMPRESA.suporteEmail}`} className="teal">{EMPRESA.suporteEmail}</a>.{" "}
            Imprensa e parcerias: <a href={`mailto:${EMPRESA.contatoEmail}`} className="teal">{EMPRESA.contatoEmail}</a>.
          </p>

          <p className="assinatura" style={{ marginTop: "var(--sp10)" }}>Volte amanhã.</p>
        </div>
      </section>
    </main>
  );
}
