import { ESTUDANTE, GARANTIA } from "@/config";

/**
 * BlocoPreco — card da condição de estudante.
 *
 * Controlado por ESTUDANTE.mostrarPreco (config.ts):
 *   false -> versão sem número (nada inventado, nada prometido)
 *   true  -> versão com preço, âncora riscada e % de desconto calculado
 *
 * O percentual NUNCA é digitado à mão: é derivado de precoDe x preco.
 * Assim o número exibido nunca fica mentindo quando o preço mudar.
 */

function Check() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" opacity=".35" />
      <path d="M8 12.4l2.6 2.6L16.2 9.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const INCLUI = [
  "As 365 provocações, uma liberada por dia",
  "Menu Ações: a reflexão do dia vira tarefa concreta",
  "Ofensiva, conquistas e ranking pra sustentar a sequência",
  "Lembrete diário no WhatsApp, no horário que você escolher",
  "App no iPhone e no Android, com o mesmo acesso",
  `Garantia de ${GARANTIA.dias} dias`,
];

export function BlocoPreco() {
  const off =
    ESTUDANTE.precoDeNumero > 0
      ? Math.round((1 - ESTUDANTE.precoNumero / ESTUDANTE.precoDeNumero) * 100)
      : 0;

  return (
    <div className="ed-offer">
      <div className="ed-price">
        <span className="ed-price-selo">
          {ESTUDANTE.mostrarPreco && off > 0 ? `${off}% OFF estudante` : ESTUDANTE.selo}
        </span>

        <div className="ed-price-nome">Diariamente Club · acesso de 1 ano</div>

        {ESTUDANTE.mostrarPreco ? (
          <>
            <div className="ed-price-row">
              <span className="ed-price-de">R$ {ESTUDANTE.precoDe}</span>
              <span className="ed-price-v">
                <small>R$</small>
                {ESTUDANTE.preco}
              </span>
            </div>
            <p className="ed-price-nota">
              {ESTUDANTE.parcela ? `${ESTUDANTE.parcela} ou ` : ""}à vista.{" "}
              {ESTUDANTE.perDia} por um ano inteiro de provocação diária.
            </p>
          </>
        ) : (
          <>
            <div className="ed-price-row">
              <span className="ed-price-v" style={{ fontSize: "clamp(30px, 4.6vw, 42px)" }}>
                Valor reduzido
              </span>
            </div>
            <p className="ed-price-nota">
              O valor da condição de estudante é enviado junto com o seu código, no
              WhatsApp. Solicitar não gera nenhum compromisso.
            </p>
          </>
        )}

        <div className="ed-price-hint">
          <b>O código chega só no WhatsApp.</b> Ele é pessoal, vale por{" "}
          {ESTUDANTE.validadeHoras} horas e é aplicado no campo de cupom da tela de
          pagamento. {ESTUDANTE.regra}
        </div>
      </div>

      <div>
        <h3 className="ed-rail-t" style={{ fontSize: 15, marginBottom: 18 }}>
          O que entra no seu acesso
        </h3>
        <ul className="ed-inclui">
          {INCLUI.map((item) => (
            <li key={item}>
              <Check />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
