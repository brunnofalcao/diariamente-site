import { ESTUDANTE, GARANTIA, PLANO_APP } from "@/config";

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
 * TODOS os números são CALCULADOS a partir do config. Nenhum percentual,
 * economia ou valor de desconto é digitado à mão. Se o preço mudar, a
 * página acompanha em vez de mentir.
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

function brl(n: number) {
  return n.toFixed(2).replace(".", ",");
}

const INCLUI = [
  "As 365 provocações, uma liberada por dia",
  "Calendário de constância pra acompanhar sua jornada",
  "Menu Ações: a reflexão do dia vira tarefa concreta",
  "Ofensiva, conquistas e ranking pra sustentar a sequência",
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

export function BlocoPreco() {
  const de = ESTUDANTE.precoDeNumero;
  const por = ESTUDANTE.precoNumero;
  const offReais = de - por;
  const offPct = de > 0 ? Math.round((1 - por / de) * 100) : 0;

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
          <div className="ed-price-hint">
            <b>O código chega só no WhatsApp.</b> Ele é pessoal, vale por{" "}
            {ESTUDANTE.validadeHoras} horas e é aplicado no campo de cupom da tela de
            pagamento. {ESTUDANTE.regra}
          </div>
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
          <span className="ed-price-selo">R$ {brl(offReais)} OFF</span>

          <div className="ed-price-nome">{PLANO_APP.nome} · acesso de 1 ano</div>

          <div className="ed-price-row">
            <span className="ed-price-de">R$ {ESTUDANTE.precoDe}</span>
            <span className="ed-price-v">
              <small>R$</small>
              {ESTUDANTE.preco}
            </span>
          </div>

          <p className="ed-price-nota">
            {offPct}% a menos que o valor que qualquer pessoa paga hoje.{" "}
            {ESTUDANTE.perDia}, por um ano inteiro de provocação diária.
          </p>

          <div className="ed-price-hint">
            <b>O código chega só no WhatsApp.</b> Ele é pessoal, vale por{" "}
            {ESTUDANTE.validadeHoras} horas e é aplicado no campo de cupom da tela de
            pagamento. {ESTUDANTE.regra}
          </div>
        </div>

        <Inclui />
      </div>

      {/* ---------------- comparativo: transforma preço em conta ---------------- */}
      <div className="ed-econ">
        <div className="ed-econ-col">
          <span className="ed-econ-k">Quem entra hoje pelo site</span>
          <span className="ed-econ-v">R$ {ESTUDANTE.precoDe}</span>
          <span className="ed-econ-d">{PLANO_APP.perDia}</span>
        </div>

        <div className="ed-econ-col is-on">
          <span className="ed-econ-k">Sua condição de estudante</span>
          <span className="ed-econ-v">R$ {ESTUDANTE.preco}</span>
          <span className="ed-econ-d">{ESTUDANTE.perDia}</span>
        </div>

        <div className="ed-econ-col is-eco">
          <span className="ed-econ-k">Você economiza</span>
          <span className="ed-econ-v">R$ {brl(offReais)}</span>
          <span className="ed-econ-d">{offPct}% de diferença</span>
        </div>
      </div>
    </>
  );
}
