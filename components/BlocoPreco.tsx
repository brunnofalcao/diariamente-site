import { ESTUDANTE, GARANTIA, PLANO_APP, periodoEstudante } from "@/config";
import {
  formatar, mensal, precoFinal, precoEstudante, porMesEstudante, lancamentoVigente, regraDoLancamento, MERCADOS,
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
 * estiver valendo), para o desconto exibido ser sempre verdadeiro.
 * A página /estudante se refaz a cada hora, como as homes.
 *
 * O cupom do estudante é pessoal, sobre a oferta oficial (R$ 149,90). Se
 * ele vale também nas renovações ainda não está confirmado: a página não
 * promete duração (ESTUDANTE.renovaMesmoValor, em config.ts).
 *
 * DURANTE O LANÇAMENTO a âncora é R$ 99,98, que vale nos 3 primeiros
 * anos, e o cupom tem duração desconhecida. Comparar só o primeiro ano
 * sem dizer isso levaria o estudante à opção que pode sair mais cara em
 * 3 anos (89,94 + 149,90 + 149,90 contra 3 x 99,98), uma omissão de
 * informação essencial (CDC, art. 37, § 3º). Por isso, enquanto o
 * lançamento valer OU a renovação não estiver confirmada, toda economia
 * é dita "no primeiro ano", e a coluna "Quem entra hoje pelo site"
 * mostra a regra do lançamento (regraDoLancamento). Nada aqui promete
 * duração do cupom.
 *
 * ESTUDANTE.aberto = false (fluxo fechado neste build): o card avisa que
 * a solicitação do código abre em breve, em vez de dizer que o código
 * chega e o botão abre o pagamento.
 *
 * ESTUDANTE.mostrarPreco = false devolve a versão sem número, para o caso
 * de a condição ainda não existir na Hotmart.
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

/** O que o card diz sobre a entrega do código: aberto, como funciona;
    fechado, que abre em breve. */
function Entrega() {
  if (!ESTUDANTE.aberto) {
    return (
      <div className="ed-price-hint">
        <b>A solicitação do código abre em breve.</b> Deixe seu contato no formulário
        abaixo e avisamos pelo WhatsApp e pelo e-mail no dia em que abrir. {ESTUDANTE.regra}
      </div>
    );
  }
  return (
    <div className="ed-price-hint">
      <b>O código chega só no WhatsApp.</b> Ele é pessoal, vale por{" "}
      {ESTUDANTE.validadeHoras} horas, e o botão da mensagem abre o pagamento com o
      desconto já aplicado. {ESTUDANTE.regra}
    </div>
  );
}

export function BlocoPreco() {
  // Preço público de hoje (server component: hora do render).
  const agora = Date.now();
  const de = precoFinal("br", agora);
  const por = precoEstudante();
  const offReais = Math.round((de - por) * 100) / 100;
  const offPct = de > 0 ? Math.round((1 - por / de) * 100) : 0;
  const mes = MERCADOS.br.textos.mes;
  // "nos 3 primeiros anos. Depois, R$ 149,90 por ano." enquanto o
  // lançamento vale; null depois.
  const vigente = lancamentoVigente("br", agora);
  const regra = regraDoLancamento("br", agora);
  // A economia só é "por ano" quando a renovação do cupom estiver
  // confirmada e não houver preço de lançamento de 3 anos ao lado.
  const soPrimeiroAno = vigente || !ESTUDANTE.renovaMesmoValor;
  const quando = soPrimeiroAno ? "no primeiro ano" : "por ano";

  if (!ESTUDANTE.mostrarPreco) {
    return (
      <div className="ed-offer">
        <div className="ed-price">
          <span className="ed-price-selo">{ESTUDANTE.selo}</span>
          <div className="ed-price-nome">{PLANO_APP.nome} · acesso de 1 ano</div>
          <div className="ed-price-row">
            <span className="ed-price-v" style={{ fontSize: "clamp(30px, 4.6vw, 42px)" }}>
              Valor reduzido
            </span>
          </div>
          <p className="ed-price-nota">
            O valor da condição de estudante é enviado junto com o seu código, no
            WhatsApp. Solicitar não gera nenhum compromisso.
          </p>
          <Entrega />
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
          <span className="ed-price-selo">{brl(offReais)} OFF {quando}</span>

          <div className="ed-price-nome">{PLANO_APP.nome} · acesso de 1 ano</div>

          <div className="ed-price-row">
            <span className="ed-price-de">{brl(de)}</span>
            <span className="ed-price-v">
              <small>{MERCADOS.br.formato.simbolo}</small>
              {ESTUDANTE.preco}
            </span>
          </div>

          <p className="ed-price-nota">
            {offPct}% a menos {quando} que o valor que qualquer pessoa paga hoje.{" "}
            {regra ? `Hoje, pelo site, o preço de lançamento é ${brl(de)} por ano ${regra} ` : ""}
            {brl(porMesEstudante())}{mes}, por um ano inteiro de provocação diária.{" "}
            {ESTUDANTE.renovaMesmoValor ? ESTUDANTE.renovacaoMesmoValor : ESTUDANTE.renovacao}
          </p>

          <Entrega />
        </div>

        <Inclui />
      </div>

      {/* ---------------- comparativo: transforma preço em conta ---------------- */}
      <div className="ed-econ">
        <div className="ed-econ-col">
          <span className="ed-econ-k">Quem entra hoje pelo site</span>
          <span className="ed-econ-v">{brl(de)}</span>
          <span className="ed-econ-d">{brl(mensal(de))}{mes}</span>
          {regra && <span className="ed-econ-d">Por ano {regra}</span>}
        </div>

        <div className="ed-econ-col is-on">
          <span className="ed-econ-k">Sua condição de estudante</span>
          <span className="ed-econ-v">{brl(por)}</span>
          <span className="ed-econ-d">{brl(porMesEstudante())}{mes} {periodoEstudante()}</span>
        </div>

        <div className="ed-econ-col is-eco">
          <span className="ed-econ-k">Você economiza {quando}</span>
          <span className="ed-econ-v">{brl(offReais)}</span>
          <span className="ed-econ-d">{offPct}% de diferença {quando}</span>
        </div>
      </div>
    </>
  );
}
