"use client";

import { PLANOS, GARANTIA, ESCASSEZ, LANCAMENTO, LIVRO_AVULSO, PROVA, type Plano, ESTUDANTE } from "@/config";
import { StoreBadges } from "@/components/StoreBadges";

/* =====================================================================
   OFERTA — layout de desktop
   ---------------------------------------------------------------------
   O que mudou e por quê:

   1. Container. A seção usava .wrap-narrow (560px), o container MAIS
      ESTREITO da página inteira, enquanto o resto respira em .wrap
      (1120px). A página afinava justamente no momento do dinheiro.
      Agora usa .wrap e um grid de duas colunas no desktop.

   2. Hierarquia comercial. A proposta de valor estava DENTRO do card de
      preço, como lista de checks de 13px. Regra de venda: o valor tem de
      ocupar mais espaço que o preço. A lista saiu do card e virou uma
      grade de seis blocos com ícone e microcopy na coluna da esquerda.

   3. Card de preço fixo (sticky). Enquanto a pessoa lê o valor, o preço e
      o botão continuam na tela. Padrão de produto digital: quem rola não
      perde o CTA de vista.

   4. Prova junto do valor, não escondida no rodapé do card.

   Mobile: o grid colapsa para uma coluna e a ordem do DOM entrega
   VALOR antes de PREÇO, que é a ordem correta de argumentação.

   Preservado: buildCheckoutUrl, trackCheckout, ESCASSEZ, LANCAMENTO,
   total do parcelado (CDC art. 52), chip e card de estudante, livro
   avulso, garantia. Nada de tracking foi removido.
   ===================================================================== */

// Anexa as UTMs da URL atual ao link de checkout (preserva origem do tráfego).
function buildCheckoutUrl(base: string): string {
  if (typeof window === "undefined") return base;
  const here = new URLSearchParams(window.location.search);
  const utms = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
  const carry = utms.filter((k) => here.get(k)).map((k) => `${k}=${encodeURIComponent(here.get(k)!)}`);
  if (!carry.length) return base;
  return base + (base.includes("?") ? "&" : "?") + carry.join("&");
}

function trackCheckout(plano: Plano) {
  (window as any).dataLayer?.push({ event: "InitiateCheckout", plano: plano.id });
  (window as any).gtag?.("event", "begin_checkout", {
    currency: "BRL",
    value: plano.precoNumero,
    items: [{ item_name: plano.nome, price: plano.precoNumero }],
  });
  (window as any).fbq?.("track", "InitiateCheckout", {
    currency: "BRL",
    value: plano.precoNumero,
    content_name: plano.nome,
  });
}

/* ---------------------------------------------------------------------
   Camada de apresentação dos entregáveis.
   Os TÍTULOS continuam vindo de config.PLANO_APP.inclui (fonte da
   verdade). Aqui entram só ícone e linha de apoio, casados por índice.
   Se um item novo entrar no config sem par aqui, ele renderiza sem a
   linha de apoio em vez de quebrar.
   --------------------------------------------------------------------- */
const ICONES = [
  <svg key="a" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>,
  <svg key="b" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4.5" width="18" height="17" rx="3" /><path d="M3 9.5h18M8 2.5v4M16 2.5v4M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" /></svg>,
  <svg key="c" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /></svg>,
  <svg key="d" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c4 0 7-2.7 7-6.6 0-3.8-2.6-5.6-4-8.4-.7 1.6-1.7 2.4-2.7 3.2C10.6 5.9 12 3.4 9.5 2c.3 3-1.4 4.2-2.8 5.9C5.5 9.4 5 11 5 12.9 5 17.2 8 22 12 22z" /></svg>,
  <svg key="e" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.4 8.4 0 01-9 8.4 8.5 8.5 0 01-4-1L3 21l2.1-5a8.4 8.4 0 01-1-4 8.5 8.5 0 018.4-9 8.5 8.5 0 018.5 8.5z" /></svg>,
  <svg key="f" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="2.5" y="4.5" width="19" height="15" rx="3" /><path d="M3 7l9 6 9-6" /></svg>,
];

const APOIO = [
  "Uma por dia, sem antecipar e sem acumular. Dois minutos e você já cumpriu o dia.",
  "A sequência fica visível. Você para de achar que está indo bem e passa a saber.",
  "Refletir sem agir não muda nada. A provocação vira tarefa com prazo.",
  "O que sustenta hábito não é vontade, é fricção baixa e sinal de progresso.",
  "O app não espera você lembrar dele. Ele chega no horário que você escolher.",
  "Confirmou o pagamento, recebeu o acesso. Começa hoje, não amanhã.",
];

/* ------------------------------ card de preço ------------------------------ */
function CartCard({ plano }: { plano: Plano }) {
  const onCheckout = () => {
    trackCheckout(plano);
    const url = plano.checkoutUrl;
    if (url.startsWith("[")) {
      alert("Checkout em configuração. Em breve disponível.");
      return;
    }
    window.location.href = buildCheckoutUrl(url);
  };

  // "137,90" -> ["137", "90"]
  const [reais, centavos] = plano.preco.split(",");

  return (
    <div className={`cart-card${plano.destaque ? "" : " cart-card-alt"}`}>
      {plano.destaque && <div className="cart-glow" aria-hidden="true" />}

      <div className="cart-inner">
        {plano.destaque && ESCASSEZ.ativa && (
          <span className="badge badge-gold cart-selo">{ESCASSEZ.selo}</span>
        )}

        <div className="cart-head">
          <span className="overline teal">{plano.selo ?? "Acesso anual"}</span>
          <h3 className="cart-nome">{plano.nome}</h3>
        </div>

        {/* preço — âncora riscada + valor de lançamento */}
        <div className="cart-preco">
          {LANCAMENTO.ativa && plano.precoDe && (
            <div className="body-sm muted" style={{ marginBottom: 2 }}>
              <s>de R$ {plano.precoDe}</s>{" "}
              <span className="badge badge-gold" style={{ marginLeft: 6, verticalAlign: "middle" }}>
                {LANCAMENTO.selo}
              </span>
            </div>
          )}
          <div className="cart-parcela">
            <span className="cart-valor">R$ {reais}</span>
            {centavos && <span className="cart-cents">,{centavos}</span>}
          </div>
          <div className="cart-vista">
            à vista
            {plano.parcela && plano.parcelas
              ? ` · ou ${plano.parcelas}x de R$ ${plano.parcela} no cartão`
              : " · ou parcelado no checkout"}
          </div>
          <div className="cart-perdia">{plano.perDia}</div>
          {/* CDC art. 52 e Decreto 5.903: havendo acréscimo no parcelado, o
              total pago tem de estar visível junto da parcela. */}
          {plano.parcelaTotal && (
            <div className="caption muted" style={{ marginTop: 4 }}>
              Parcelado: total de R$ {plano.parcelaTotal} com acréscimo.
            </div>
          )}
          {LANCAMENTO.ativa && plano.precoDe && (
            <div className="caption muted" style={{ marginTop: 4 }}>
              Condição {LANCAMENTO.prazoTexto}.
            </div>
          )}
        </div>

        <button className="btn btn-primary btn-block cart-cta" onClick={onCheckout}>
          {plano.ctaLabel}
        </button>

        {plano.nota && (
          <p className="caption center" style={{ marginTop: "var(--sp3)", color: "var(--n-400)" }}>
            {plano.nota}
          </p>
        )}

        <div className="cart-trust">
          <span>🔒 Pagamento seguro</span>
          <span>·</span>
          <span>Acesso por e-mail</span>
          <span>·</span>
          <span>Garantia {GARANTIA.dias} dias</span>
        </div>
      </div>

      <div className="cart-rodape">{plano.rodape}</div>
    </div>
  );
}

/* ------------------------------ seção ------------------------------ */
export function Oferta() {
  const plano = PLANOS[0];

  return (
    <section id="oferta">
      <div className="wrap">
        <div className="center sec-head of-head">
          <h2 className="display-md">Comece sua constância hoje</h2>
          <p className="lead sec-intro" style={{ maxWidth: "48ch", margin: "var(--sp4) auto 0" }}>
            Um ano inteiro de provocação diária, com o sistema que te traz de volta
            todo dia. Não é mais um conteúdo. É o que faz o conteúdo virar constância.
          </p>
        </div>

        {/* ---------- CHIP ESTUDANTE (intercepta ANTES do preço cheio) ----------
             Sem isto, o estudante lê R$ 137,90, conclui que não cabe e sai da
             página antes de descobrir que existe condição própria pra ele. */}
        <a
          href="/estudante"
          className="cart-est-chip of-chip"
          onClick={() => {
            (window as any).gtag?.("event", "cta_estudante_click", { location: "chip_topo" });
            (window as any).dataLayer?.push({ event: "cta_estudante_click", location: "chip_topo" });
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M22 9L12 4 2 9l10 5 10-5z" />
            <path d="M6 11.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.5" />
          </svg>
          <span>
            Você ainda está na graduação? <b>Tem uma condição própria pra você.</b>
          </span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14M13 5l7 7-7 7" />
          </svg>
        </a>

        {/* ================= GRID PRINCIPAL: valor | compra ================= */}
        <div className="of-grid">
          {/* ---------- COLUNA ESQUERDA: o valor ---------- */}
          <div className="of-valor">
            <span className="overline teal">O que entra no seu acesso</span>
            <h3 className="of-h3">Um sistema, não um arquivo que você baixa e esquece.</h3>

            <div className="of-feats">
              {plano.inclui.map((titulo, i) => (
                <div className="of-feat" key={titulo}>
                  <div className="of-feat-ic" aria-hidden="true">{ICONES[i]}</div>
                  <div>
                    <div className="of-feat-t">{titulo}</div>
                    {APOIO[i] && <p className="of-feat-d">{APOIO[i]}</p>}
                  </div>
                </div>
              ))}
            </div>

            <div className="of-garantia">
              <div className="of-garantia-ic" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2l8 3.5v5.8c0 5-3.4 9.3-8 10.7-4.6-1.4-8-5.7-8-10.7V5.5L12 2z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
              </div>
              <div>
                <div className="of-garantia-t">Garantia de {GARANTIA.dias} dias</div>
                <p className="of-garantia-d">{GARANTIA.texto}</p>
              </div>
            </div>

            <div className="of-prova">
              <span className="of-prova-n">{PROVA.leitores}</span>
              <span className="of-prova-l">já leram o Diariamente</span>
              <StoreBadges variant="prova" />
            </div>
          </div>

          {/* ---------- COLUNA DIREITA: a compra (fixa no desktop) ---------- */}
          <aside className="of-compra">
            <CartCard plano={plano} />

            {/* livro impresso avulso (discreto; nao dispersa do CTA principal) */}
            <p className="caption center of-livro">
              Quer só o livro impresso?{" "}
              <a
                href={LIVRO_AVULSO}
                target="_blank"
                rel="noopener noreferrer"
                className="teal"
                onClick={() => {
                  (window as any).gtag?.("event", "click_livro_avulso", { location: "oferta" });
                  (window as any).dataLayer?.push({ event: "click_livro_avulso", location: "oferta" });
                }}
              >
                Ele está disponível aqui
              </a>
              .
            </p>
          </aside>
        </div>

        {/* ---------- FAIXA ESTUDANTE, LARGURA TOTAL ---------- */}
        <div className="cart-est of-est">
          <span className="cart-est-selo">{ESTUDANTE.selo}</span>

          <div className="cart-est-row">
            <div>
              <h3 className="cart-est-h">Ainda está na graduação?</h3>
              <p className="cart-est-d">
                {ESTUDANTE.mostrarPreco
                  ? `O mesmo acesso de um ano por R$ ${ESTUDANTE.preco}, enquanto você ainda estuda. Solicitar não gera compromisso.`
                  : "Existe uma condição de estudante, com valor reduzido, enquanto você ainda estuda. Solicitar não gera compromisso."}
              </p>

              <ul className="cart-est-bul">
                {["Leva cerca de um minuto", "Código chega no WhatsApp", "Sem comprovante de matrícula"].map((b) => (
                  <li key={b}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    {b}
                  </li>
                ))}
              </ul>
            </div>

            <a
              href="/estudante"
              className="cart-est-acao"
              onClick={() => {
                (window as any).gtag?.("event", "cta_estudante_click", { location: "card_oferta" });
                (window as any).dataLayer?.push({ event: "cta_estudante_click", location: "card_oferta" });
              }}
            >
              Ver minha condição
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
