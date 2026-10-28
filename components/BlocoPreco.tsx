import { ESTUDANTE, GARANTIA, PLANO_APP, estudanteAberto, canaisDoLink } from "@/config";
import {
  formatar, mensal, precoFinal, precoEstudante, porMesEstudante, regraDoLancamento, regraDoEstudante,
  periodoDoEstudante, MERCADOS,
} from "@/config/pricing";

/**
 * BlocoPreco — pitch de venda da condição de estudante.
 *
 * A página tinha o formulário mas não tinha a venda: nenhum valor,
 * nenhuma comparação, nenhuma razão para agir. Esta peça é o argumento
 * comercial, na ordem em que ele convence:
 *
 *   1. O preço, com a âncora do que qualquer pessoa paga.
 *   2. A economia em reais, que é mais concreta que percentual.
 *   3. O que está incluso.
 *   4. A garantia, ao lado da decisão e não no rodapé.
 *   5. O comparativo lado a lado, que fecha a conta.
 *
 * TODOS os números são CALCULADOS a partir de config/pricing.ts. Nenhum
 * percentual, economia ou valor de desconto é digitado à mão. A âncora é o
 * que qualquer pessoa paga HOJE pelo site (o preço de lançamento, se ele
 * estiver valendo), para o desconto exibido ser sempre verdadeiro. O
 * percentual é arredondado PARA BAIXO (46,7% vira 46%), como o selo do
 * card: nunca mais do que é.
 * A página /estudante é dinâmica: o preço e a fase saem da hora de cada
 * visita (app/estudante/page.tsx).
 *
 * PREÇO EM DUAS FASES (decisão do dono, 28/10/2026), com a mesma virada
 * do card (config/pricing.ts, faseDoEstudante): R$ 59,90 por ano nos 3
 * primeiros anos para quem assinar até 16/11; depois, R$ 79,90 por ano
 * nos 3 primeiros anos. Nas duas, R$ 149,90 por ano depois dos 3 anos. A
 * regra inteira (regraDoEstudante) fica colada ao preço de estudante: é a
 * oferta da Hotmart que a cumpre ("Apenas nas três primeiras
 * recorrências"). Durante o lançamento, a coluna "Quem entra hoje pelo
 * site" mostra a regra do LANÇAMENTO, que também é de 3 anos: as duas
 * colunas comparam o mesmo período, e "Você economiza" é por ano, nos 3
 * primeiros anos.
 *
 * Fechado (estudanteAberto(agora) falso): o card fica SEM número (a
 * versão de ESTUDANTE.mostrarPreco = false), avisa que a solicitação
 * abre em breve e diz que o preço aparece quando abrir. Nada de selo OFF,
 * preço riscado, data ("para quem assinar até 16 de novembro"), "Cancele
 * quando quiser" nem comparativo: seria uma oferta com prazo que ninguém
 * consegue aceitar enquanto está fechada (CDC, art. 37).
 *
 * ESTUDANTE.mostrarPreco = false devolve a versão sem número.
 */

function Check({ s = 20 }: { s?: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" opacity=".35" />
      <path d="M8 12.4l2.6 2.6L16.2 9.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const brl = (n: number) => formatar("br", n);

const INCLUI = [
  "As 365 provocações, uma liberada por dia",
  "Calendário de constância pra acompanhar sua jornada",
  "Menu Ações: a reflexão do dia vira tarefa concreta",
  "Contador de voltas: cada volta conta, e nenhuma zera",
  "Lembrete diário no WhatsApp, no horário que você escolher",
  "App no iPhone e no Android, com o mesmo acesso",
];

function Inclui() {
  return (
    <div>
      <h3 className="ed-incl-t">O que entra no seu acesso</h3>
      <ul className="ed-inclui">
        {INCLUI.map((item) => (
          <li key={item}>
            <Check />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <div className="ed-gar">
        <div className="ed-gar-ic" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2l8 3.5v5.8c0 5-3.4 9.3-8 10.7-4.6-1.4-8-5.7-8-10.7V5.5L12 2z" />
            <path d="M9 12l2 2 4-4" />
          </svg>
        </div>
        <div>
          <div className="ed-gar-t">Garantia de {GARANTIA.dias} dias</div>
          <p className="ed-gar-d">{GARANTIA.texto}</p>
        </div>
      </div>
    </div>
  );
}

/** O que o card diz sobre a entrega do link: aberto, como funciona;
    fechado, que abre em breve. */
function Entrega({ aberto }: { aberto: boolean }) {
  if (!aberto) {
    return (
      <div className="ed-price-hint">
        <b>A solicitação da condição de estudante abre em breve.</b> Deixe seu contato no
        formulário abaixo e avisamos pelo WhatsApp e pelo e-mail no dia em que abrir.{" "}
        {ESTUDANTE.regra}
      </div>
    );
  }
  return (
    <div className="ed-price-hint">
      <b>O link da sua inscrição vai {canaisDoLink()}.</b> O botão abre o pagamento com a
      condição de estudante já aplicada. {ESTUDANTE.regra}
    </div>
  );
}

export function BlocoPreco() {
  // Preço público de hoje e fase do estudante (server component: hora do render).
  const agora = Date.now();
  const aberto = estudanteAberto(agora);
  const de = precoFinal("br", agora);
  const por = precoEstudante(agora);
  const offReais = Math.round((de - por) * 100) / 100;
  // Para baixo, como o selo do card (percentualDoLancamento): nunca mais do que é.
  const offPct = de > 0 ? Math.floor(Math.round((1 - por / de) * 10000) / 100) : 0;
  const mes = MERCADOS.br.textos.mes;
  // "nos 3 primeiros anos. Depois, R$ 149,90 por ano." enquanto o
  // lançamento vale; null depois. Sem o "33% a menos que o preço
  // oficial" do bloco de oferta da home: aqui as diferenças mostradas são
  // as do estudante, e um percentual sobre outra base confundiria.
  const regraPublica = regraDoLancamento("br", agora, { semPercentual: true });
  const regra = regraDoEstudante(agora);
  const depois = `Depois, ${brl(MERCADOS.br.anual)} por ano.`;

  if (!ESTUDANTE.mostrarPreco || !aberto) {
    return (
      <div className="ed-offer">
        <div className="ed-price">
          <span className="ed-price-selo">{ESTUDANTE.selo}</span>
          <div className="ed-price-nome">{PLANO_APP.nome} · acesso anual</div>
          <div className="ed-price-row">
            <span className="ed-price-v" style={{ fontSize: "clamp(30px, 4.6vw, 42px)" }}>
              Valor reduzido
            </span>
          </div>
          <p className="ed-price-nota">
            {aberto ? (
              <>
                O valor da condição de estudante aparece no pagamento, pelo link que enviamos{" "}
                {canaisDoLink()}. Solicitar não gera nenhum compromisso.
              </>
            ) : (
              "O preço da condição de estudante aparece aqui quando a inscrição abrir."
            )}
          </p>
          <Entrega aberto={aberto} />
        </div>
        <Inclui />
      </div>
    );
  }

  return (
    <>
      <div className="ed-offer">
        {/* ---------------- card de preço ---------------- */}
        <div className="ed-price">
          <span className="ed-price-selo">{brl(offReais)} OFF</span>

          <div className="ed-price-nome">{PLANO_APP.nome} · acesso anual</div>

          <div className="ed-price-row">
            <span className="ed-price-de">{brl(de)}</span>
            <span className="ed-price-v">
              <small>{MERCADOS.br.formato.simbolo}</small>
              {formatar("br", por).replace(/^R\$\s/, "")}
            </span>
          </div>

          {/* A regra inteira do estudante, colada ao preço dele: quanto,
              por quanto tempo e o que vem depois (é o que a oferta da
              Hotmart cumpre). E como ele paga: à vista ou parcelado com
              acréscimo, sem valor de parcela. */}
          <p className="ed-price-nota">
            {offPct}% a menos que o valor que qualquer pessoa paga hoje.{" "}
            Para você, estudante: {regra}{" "}
            {brl(por)} {ESTUDANTE.pagamento}. Cancele quando quiser.
          </p>

          <Entrega aberto={aberto} />
        </div>

        <Inclui />
      </div>

      {/* ---------------- comparativo: transforma preço em conta ---------------- */}
      <div className="ed-econ">
        <div className="ed-econ-col">
          <span className="ed-econ-k">Quem entra hoje pelo site</span>
          <span className="ed-econ-v">{brl(de)}</span>
          <span className="ed-econ-d">{brl(mensal(de))}{mes}</span>
          {regraPublica && <span className="ed-econ-d">Por ano {regraPublica}</span>}
        </div>

        <div className="ed-econ-col is-on">
          <span className="ed-econ-k">Sua condição de estudante</span>
          <span className="ed-econ-v">{brl(por)}</span>
          <span className="ed-econ-d">{brl(porMesEstudante(agora))}{mes} · {periodoDoEstudante()}</span>
          <span className="ed-econ-d">{depois}</span>
        </div>

        <div className="ed-econ-col is-eco">
          <span className="ed-econ-k">Você economiza</span>
          <span className="ed-econ-v">{brl(offReais)}</span>
          <span className="ed-econ-d">por ano, {periodoDoEstudante()}</span>
          <span className="ed-econ-d">{offPct}% de diferença</span>
        </div>
      </div>
    </>
  );
}
