import { ESTUDANTE, ESTUDANTE_ATUAL, GARANTIA, PLANO_APP } from "@/config";

/**
 * BlocoPrecoAtual: o bloco de preço da /estudante da PRODUÇÃO (main,
 * 0a25ffa, components/BlocoPreco.tsx), servido só em STANDBY (chave de
 * lançamento desligada, config/lancamento.ts). R$ 77,00 sobre R$ 137,90,
 * como a produção mostra hoje. Com a chave ligada, a /estudante usa
 * components/BlocoPreco.tsx (config/pricing.ts).
 *
 * Igual ao da main, com os números de ESTUDANTE_ATUAL (config.ts) no
 * lugar dos de ESTUDANTE e PLANO_APP, que agora são os do lançamento.
 * TODOS os números continuam calculados, nenhum percentual ou economia
 * escrito à mão.
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

export function BlocoPrecoAtual() {
  const de = ESTUDANTE_ATUAL.precoDeNumero;
  const por = ESTUDANTE_ATUAL.precoNumero;
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
            {ESTUDANTE_ATUAL.validadeHoras} horas e é aplicado no campo de cupom da tela de
            pagamento. {ESTUDANTE_ATUAL.regra}
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
            <span className="ed-price-de">R$ {ESTUDANTE_ATUAL.precoDe}</span>
            <span className="ed-price-v">
              <small>R$</small>
              {ESTUDANTE_ATUAL.preco}
            </span>
          </div>

          <p className="ed-price-nota">
            {offPct}% a menos que o valor que qualquer pessoa paga hoje.{" "}
            {ESTUDANTE_ATUAL.perDia}, por um ano inteiro de provocação diária.
          </p>

          <div className="ed-price-hint">
            <b>O código chega só no WhatsApp.</b> Ele é pessoal, vale por{" "}
            {ESTUDANTE_ATUAL.validadeHoras} horas e é aplicado no campo de cupom da tela de
            pagamento. {ESTUDANTE_ATUAL.regra}
          </div>
        </div>

        <Inclui />
      </div>

      {/* ---------------- comparativo: transforma preço em conta ---------------- */}
      <div className="ed-econ">
        <div className="ed-econ-col">
          <span className="ed-econ-k">Quem entra hoje pelo site</span>
          <span className="ed-econ-v">R$ {ESTUDANTE_ATUAL.precoDe}</span>
          <span className="ed-econ-d">{ESTUDANTE_ATUAL.planoPerDia}</span>
        </div>

        <div className="ed-econ-col is-on">
          <span className="ed-econ-k">Sua condição de estudante</span>
          <span className="ed-econ-v">R$ {ESTUDANTE_ATUAL.preco}</span>
          <span className="ed-econ-d">{ESTUDANTE_ATUAL.perDia}</span>
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
