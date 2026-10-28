"use client";

import {
  MERCADOS, precoFinal, porMes, formatar, linkCheckout, lancamentoVigente,
  dataDoLancamento, pendente, precoEstudante, porMesEstudante, pagamentoAgora,
  percentualDoLancamento, regraDoLancamento, precoCheio,
  regraDoLancamentoEmPartes, linhaDeValor, quadroDoLancamento,
  type Mercado, type Parte,
} from "@/config/pricing";
import { ESTUDANTE, periodoEstudante } from "@/config";
import { caminho } from "@/lib/rotas";
import { registrarInicioDeCheckout } from "@/lib/medicao";
import { ListaEsperaForm } from "@/components/ListaEsperaForm";

/* =====================================================================
   BLOCO DE OFERTA · cinco variantes
   ---------------------------------------------------------------------
   Handoff, seção 2. Nenhum preço escrito aqui: tudo vem de
   config/pricing.ts. Trocar valor, moeda, oferta ou link é editar
   aquele arquivo, e o bloco acompanha nos cinco mercados.

   Nunca: duas moedas, duas opções de plano, campo de cupom, contador,
   conversão na tela, valor de parcela. Sempre UM botão.

   DOIS CARDS DE VENDA
     novo      o mercado com `textos.linhaValor` em config/pricing.ts
               (hoje só o Brasil). Pedido do dono, 27/10/2026: "o card de
               venda, de oferta, ele pode ser melhor trabalhado, essa
               copy". Copy escrita, julgada (conversão, verdade e lei com
               veto, design) e sintetizada; detalhes e o que ficou de fora
               em docs/LANCAMENTO.md ("Card de oferta do Brasil").
     de sempre os outros (la, es, pt, rw): frase de proposta, manchete no
               equivalente mensal, total anual, pílula de pagamento. Não
               mudou.

   CARD NOVO no lançamento (até FIM_DO_LANCAMENTO, ativo: true), de cima
   para baixo:
     SEU DIARIAMENTE                                    33% OFF
     Preço oficial: R$ 149,90 por ano      (só o valor riscado)
     R$ 99,98 por ano                      (manchete: o que é cobrado)
     33% a menos, travado nos 3 primeiros anos. Depois, R$ 149,90 por ano.
     Equivale a R$ 8,33 por mês. Por dia, cerca de R$ 0,27 e três minutos.
     [3 anos no preço oficial  R$ 449,70]  (sem riscado: não há plano
     [3 anos no lançamento     R$ 299,94]   de 3 anos)
     [Em 3 anos, você deixa de pagar  R$ 149,76]
     [Quase o preço oficial de um ano inteiro.]  (só com quaseUmAnoInteiro)
     Preço de lançamento, à vista, para quem assinar até 16 de novembro.
     [Começar meu ano]
   Depois da data, ou com ativo: false, o mesmo esqueleto sem âncora,
   selo, regra e quadro: "SEU DIARIAMENTE POR UM ANO", "R$ 149,90 por
   ano", o equivalente por mês e por dia do preço oficial e, no lugar do
   prazo, "À vista, ou em até 12x no cartão com acréscimo." (nunca valor
   de parcela: a Hotmart calcula). Todo número e todo texto saem de
   config/pricing.ts (percentualDoLancamento, porMes, porDia,
   quadroDoLancamento...), nunca escritos aqui.

   Mercado com vendaAberta: false (hoje la, es, pt e rw): o bloco vira a
   lista de espera daquele mercado, sem preço nenhum. Exceções:
     `vitrine`  o site de vendas em standby (/vendas, /es/vendas,
                /es-es/vendas, /pt-pt/vendas, /mundo/vendas). Todo
                mercado aparece como vai ao ar quando a venda dele abrir:
                o bloco de venda, com o botão abrindo o checkout de
                verdade da Hotmart (o link do mercado em
                config/pricing.ts). Decisão do dono, 27/10/2026: "Já pode
                colocar o link do checkout. Quero testar a jornada
                inteira." Até então o botão da vitrine levava ao próprio
                bloco até DM_WEBHOOK_V2_OK=1 (DM_VENDA_LIBERADA); essa
                trava saiu. A do lançamento público continua
                (scripts/checar-precos.js).
     `previa`   só nas prévias internas /pt-pt/embreve e /es-es/embreve
                (chave ligada), que mostram o bloco de venda para
                revisão, com o botão desabilitado.

   `momento` vem do servidor: a data de término do lançamento é conferida
   contra a mesma hora no HTML e na hidratação. Depois da hidratação, o
   components/Home.tsx confere de novo com o relógio do navegador e
   troca o `momento` se o lançamento já acabou.

   ===================================================================== */

const C = {
  p500: "#27BDBE", p300: "#5DD8D8", s0: "#0A0E0E", s2: "#181D1D",
  n200: "#CDD2D2", n300: "#AAB2B2", n400: "#8A9494", ret: "#F5B731",
  n900: "#131918",
  line: "rgba(255,255,255,.07)",
  serif: "var(--font-serif)",
};

function Relogio() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.p500} strokeWidth={2.2} strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" /><path d="M12 7v5.2l3.2 1.9" />
    </svg>
  );
}

/** Prazo do lançamento (card novo): a data é o que importa, não um relógio. */
function Calendario() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.ret} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flex: "0 0 auto", marginTop: 3 }}>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" /><path d="M3.5 10h17M8 3v4M16 3v4" />
    </svg>
  );
}

/** Forma de pagamento do preço oficial (card novo, depois do lançamento). */
function Cartao() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.n300} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flex: "0 0 auto", marginTop: 3 }}>
      <rect x="2.5" y="5.5" width="19" height="13" rx="2.5" /><path d="M2.5 10h19M6.5 15h4" />
    </svg>
  );
}

/** Texto em partes (config/pricing.ts, emPartes): o destaque em branco,
    peso 600. Nenhum texto escrito aqui. */
function Partes({ partes }: { partes: Parte[] }) {
  return (
    <>
      {partes.map((p, i) =>
        p.destaque ? <strong key={i} style={{ color: "#fff", fontWeight: 600 }}>{p.texto}</strong> : p.texto,
      )}
    </>
  );
}

function Escudo() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.p500} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flex: "0 0 auto" }}>
      <path d="M12 2.5l7.5 3.2v5.4c0 4.7-3.2 8.7-7.5 10-4.3-1.3-7.5-5.3-7.5-10V5.7L12 2.5z" />
      <path d="M9.3 12l2 2 3.6-3.7" />
    </svg>
  );
}

function Cabecalho({ titulo, selo }: { titulo: string; selo?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "12px clamp(20px,3vw,28px)", background: "rgba(39,189,190,.08)", borderBottom: "1px solid rgba(39,189,190,.2)" }}>
      <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: C.p500 }}>
        {titulo}
      </span>
      {selo && (
        <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 999, background: "rgba(245,183,49,.12)", border: "1px solid rgba(245,183,49,.3)", color: C.ret, fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>
          {selo}
        </span>
      )}
    </div>
  );
}

const moldura: React.CSSProperties = { background: C.s2, border: "1px solid rgba(39,189,190,.32)", borderRadius: 16, overflow: "hidden" };
const miolo: React.CSSProperties = { padding: "clamp(20px,3vw,28px)" };

export function BlocoOferta({ mercado, momento, previa = false, vitrine = false }: { mercado: Mercado; momento: number; previa?: boolean; vitrine?: boolean }) {
  const o = MERCADOS[mercado];
  const t = o.textos;

  // Na vitrine, a venda de todo mercado aparece aberta (ver o topo).
  const vendaVisivel = o.vendaAberta || vitrine;

  /* ------------------------- LISTA DE ESPERA ------------------------- */
  if (!vendaVisivel && !previa) {
    return (
      <div style={moldura}>
        <Cabecalho titulo={t.titulo} selo={o.espera.selo} />
        <div style={miolo}>
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.55, color: C.n300 }}>{t.proposta}</p>
          <p style={{ margin: "14px 0 0", fontSize: 15.5, lineHeight: 1.6, color: C.n200 }}>{o.espera.texto}</p>
          <ListaEsperaForm mercado={mercado} origem="oferta" embutido botao={o.espera.botao} vitrine={vitrine} />
        </div>
      </div>
    );
  }

  /* ------------------------------ VENDA ------------------------------ */
  const vigente = lancamentoVigente(mercado, momento);
  const regra = regraDoLancamento(mercado, momento);
  const pct = percentualDoLancamento(mercado, momento);
  const link = linkCheckout(mercado, momento);
  // Só chega aqui com a venda fechada na prévia interna.
  const fechado = !vendaVisivel;
  // Link pendente só acontece em build de teste: em produção a trava não
  // deixa o build sair sem o link (scripts/checar-precos.js).
  const semLink = pendente(link) || fechado;
  // Preço oficial riscado, só com o lançamento valendo (null fora dele).
  const cheio = precoCheio(mercado, momento);
  const ancora = cheio && t.ancora ? cheio : null;
  const valor = precoFinal(mercado, momento);
  const mensal = formatar(mercado, porMes(mercado, momento));
  const anual = formatar(mercado, valor);
  const renovacao = o.renovaMesmoValor && t.renovacaoMesmoValor ? t.renovacaoMesmoValor : t.renovacao;
  const prazo = vigente ? dataDoLancamento(mercado) : null;
  // O selo só aparece com o lançamento valendo: o desconto da oferta de
  // lançamento sobre o preço cheio, arredondado para baixo.
  const selo = vigente && pct ? `${pct}% OFF` : undefined;

  /* Peças iguais nos dois cards (o de sempre e o novo do Brasil). */
  const botao = (marginTop: number) => (
    <a
      href={semLink ? undefined : link}
      target="_blank"
      rel="noopener noreferrer"
      aria-disabled={semLink || undefined}
      onClick={(e) => {
        if (semLink) { e.preventDefault(); return; }
        registrarInicioDeCheckout({ id: `anual-${mercado}`, nome: `Diariamente Anual · ${mercado.toUpperCase()}`, valor, moeda: o.moeda });
      }}
      style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        height: 54, marginTop, width: "100%", borderRadius: 999,
        background: semLink ? "rgba(39,189,190,.35)" : C.p500,
        color: C.n900, fontSize: 16, fontWeight: 700, textDecoration: "none",
        cursor: semLink ? "not-allowed" : "pointer",
      }}
    >
      {t.botao}
    </a>
  );

  const depoisDoBotao = (
    <>
      <p style={{ margin: "12px 0 0", textAlign: "center", fontSize: 13, lineHeight: 1.45, color: C.n400 }}>
        {renovacao}
      </p>

      {o.imposto === "fora" && t.impostoNota && (
        <p style={{ margin: "8px 0 0", textAlign: "center", fontSize: 12.5, lineHeight: 1.45, color: C.n400 }}>
          {t.impostoNota}
        </p>
      )}

      {/* Estudante só existe no Brasil: a validação usa CPF e o cobro é
          em real (handoff, seção 12, item P2). Só aparece com o fluxo
          do cupom pessoal ABERTO neste build (ESTUDANTE.aberto, config.ts):
          fechado, a home não leva a uma página que ainda não entrega o
          código. O preço segue ESTUDANTE.mostrarPreco, como na
          /estudante, e o período é o de ESTUDANTE.periodo ("por ano ·
          cobrança anual"): se o cupom vale nas renovações não se sabe, e
          o dono decidiu (12/10/2026) dizer só que a cobrança é anual. */}
      {mercado === "br" && t.estudante && ESTUDANTE.aberto && (
        <p style={{ margin: "14px 0 0", textAlign: "center", fontSize: 13.5, lineHeight: 1.5 }}>
          <a href={caminho("estudante", "pt")} style={{ color: C.p300, textDecoration: "none" }}>
            {ESTUDANTE.mostrarPreco
              ? `${t.estudante}: ${formatar("br", porMesEstudante())}${t.mes} · ${formatar("br", precoEstudante())} ${periodoEstudante()}`
              : `${t.estudante}: ver a condição`}
          </a>
        </p>
      )}
    </>
  );

  // No card novo, a primeira linha (a garantia) vem em branco: é a linha
  // de destaque. No de sempre, as três iguais.
  const listaDeConfianca: React.CSSProperties = { listStyle: "none", margin: "18px 0 0", padding: "18px 0 0", borderTop: `1px solid ${C.line}`, display: "grid", gap: 10, fontSize: 14, color: C.n200 };
  const confianca = (primeiraEmDestaque: boolean) => (
    // balance, e não pretty: com pretty sobravam duas palavras na segunda
    // linha ("Pix / ou cartão", "o mesmo acesso / nos dois") a 390 px.
    <ul style={primeiraEmDestaque ? { ...listaDeConfianca, textWrap: "balance" as never } : listaDeConfianca}>
      {o.confianca.map((x, i) => (
        <li key={x} style={primeiraEmDestaque && i === 0 ? { display: "flex", gap: 10, alignItems: "center", color: "#fff" } : { display: "flex", gap: 10, alignItems: "center" }}>
          <Escudo />
          {x}
        </li>
      ))}
    </ul>
  );

  const notaDeTeste = fechado ? (
    <p style={{ margin: "14px 0 0", textAlign: "center", fontSize: 12, color: C.ret }}>
      Prévia interna: a venda deste mercado ainda está fechada e o botão não abre o pagamento.
    </p>
  ) : semLink && (
    <p style={{ margin: "14px 0 0", textAlign: "center", fontSize: 12, color: C.ret }}>
      Build de teste: link de checkout pendente em config/pricing.ts
    </p>
  );

  /* --------------------- CARD NOVO (hoje, só o Brasil) --------------------- */
  if (t.linhaValor) {
    const regraEmPartes = regraDoLancamentoEmPartes(mercado, momento);
    const valorEmPartes = linhaDeValor(mercado, momento);
    const quadro = quadroDoLancamento(mercado, momento);
    const linhaDoQuadro: React.CSSProperties = { display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 };
    // Rótulo do quadro em duas linhas do mesmo tamanho quando não cabe em
    // uma. "Em 3 anos, você deixa de pagar" (revisão de 28/10/2026) pede
    // 314 px com o valor ao lado e só cabe numa linha de 430 px de tela
    // para cima: no celular quebra em "Em 3 anos, você / deixa de pagar",
    // nunca com "de pagar" sozinho embaixo. A 320 px os outros dois
    // rótulos também quebram, e do mesmo jeito.
    const rotuloDoQuadro = { textWrap: "balance" } as React.CSSProperties;
    // Nenhuma palavra sozinha na última linha ("na mão." a 1440 px).
    const semViuva = { textWrap: "pretty" } as React.CSSProperties;
    return (
      <div style={moldura}>
        <Cabecalho titulo={vigente && t.tituloLancamento ? t.tituloLancamento : t.titulo} selo={selo} />

        <div style={miolo}>
          {/* ÂNCORA: o preço oficial, riscado, na mesma unidade da
              manchete. O rótulo não é riscado e é o que o leitor de tela
              anuncia antes do valor (<s> não é anunciado). É o único
              riscado do card. */}
          {ancora && (
            <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.4, color: C.n400 }}>
              {t.ancora}:{" "}
              <s style={{ textDecorationThickness: "1.5px", textDecorationColor: C.n300 }}>{ancora} {t.totalSufixo}</s>
            </p>
          )}

          {/* MANCHETE: o preço cobrado agora, por ano (à vista). A âncora
              logo acima está na mesma unidade: 149,90 contra 99,98. */}
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: ancora ? 6 : 0, flexWrap: "wrap" }}>
            <span style={{ fontFamily: C.serif, fontSize: "clamp(42px,5vw,54px)", lineHeight: 1, letterSpacing: "-.02em", color: "#fff" }}>
              {anual}
            </span>
            <span style={{ fontSize: 16, lineHeight: 1, color: C.n300 }}>{t.totalSufixo}</span>
          </div>

          {/* REGRA: o desconto travado nos 3 primeiros anos e a renovação
              ao preço oficial, às claras. */}
          {regraEmPartes && (
            <p style={{ margin: "10px 0 0", fontSize: 15, lineHeight: 1.55, color: C.n200, ...semViuva }}>
              <Partes partes={regraEmPartes} />
            </p>
          )}

          {/* VALOR: por mês e por dia, sempre "equivale" (nunca mensalidade). */}
          {valorEmPartes && (
            <p style={{ margin: `${regraEmPartes ? 8 : 10}px 0 0`, fontSize: 15, lineHeight: 1.55, color: C.n200, ...semViuva }}>
              <Partes partes={valorEmPartes} />
            </p>
          )}

          {/* QUADRO dos 3 anos: dois totais um sobre o outro e o que a
              pessoa deixa de pagar. O total no preço oficial NÃO é
              riscado (não existe plano de 3 anos). Lista de definição:
              o leitor de tela lê rótulo e valor juntos. */}
          {quadro && (
            <div style={{ marginTop: 16, padding: 14, borderRadius: 12, background: "rgba(39,189,190,.07)", border: "1px solid rgba(39,189,190,.2)" }}>
              <dl style={{ margin: 0, display: "grid", gap: 4, fontSize: 14, lineHeight: 1.45, fontVariantNumeric: "tabular-nums" }}>
                <div style={linhaDoQuadro}>
                  <dt style={{ color: C.n300, ...rotuloDoQuadro }}>{quadro.oficial.rotulo}</dt>
                  <dd style={{ margin: 0, color: C.n400, whiteSpace: "nowrap" }}>{quadro.oficial.valor}</dd>
                </div>
                <div style={linhaDoQuadro}>
                  <dt style={{ color: C.n300, ...rotuloDoQuadro }}>{quadro.lancamento.rotulo}</dt>
                  <dd style={{ margin: 0, color: "#fff", fontWeight: 600, whiteSpace: "nowrap" }}>{quadro.lancamento.valor}</dd>
                </div>
                <div style={{ ...linhaDoQuadro, marginTop: 6, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,.1)", fontSize: 15 }}>
                  <dt style={{ color: "#fff", ...rotuloDoQuadro }}>{quadro.economia.rotulo}</dt>
                  <dd style={{ margin: 0, color: C.p500, fontWeight: 700, whiteSpace: "nowrap" }}>{quadro.economia.valor}</dd>
                </div>
              </dl>
              {quadro.legenda && (
                <p style={{ margin: "6px 0 0", fontSize: 13.5, lineHeight: 1.45, color: C.n200 }}>{quadro.legenda}</p>
              )}
            </div>
          )}

          {/* PRAZO em texto, com o "à vista" do lançamento, logo acima do
              botão. Sem contador: urgência artificial é vetada, e a data
              é verdadeira. Depois do lançamento, no mesmo lugar, a forma
              de pagamento do preço oficial (nunca valor de parcela). */}
          {prazo && t.prazo ? (
            <p style={{ display: "flex", alignItems: "flex-start", gap: 8, margin: "16px 0 0", fontSize: 13.5, lineHeight: 1.45, color: C.ret, ...semViuva }}>
              <Calendario />
              {/* A data não se parte ("16 / de novembro"). */}
              <span>{t.prazo} <span style={{ whiteSpace: "nowrap" }}>{prazo}</span>.</span>
            </p>
          ) : (
            <p style={{ display: "flex", alignItems: "flex-start", gap: 8, margin: "16px 0 0", fontSize: 13.5, lineHeight: 1.45, color: C.n200, ...semViuva }}>
              <Cartao />
              <span>{pagamentoAgora(mercado, momento)}.</span>
            </p>
          )}

          {botao(18)}
          {depoisDoBotao}
          {confianca(true)}
          {notaDeTeste}
        </div>
      </div>
    );
  }

  /* ----------------- CARD DE SEMPRE (la, es, pt, rw) ----------------- */
  return (
    <div style={moldura}>
      <Cabecalho titulo={t.titulo} selo={selo} />

      <div style={miolo}>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.55, color: C.n300 }}>{t.proposta}</p>

        {/* PREÇO OFICIAL riscado, logo acima da manchete, na mesma
            unidade do preço oficial (por ano). O rótulo é o que o leitor
            de tela lê antes do valor riscado (<s> não é anunciado). */}
        {ancora && (
          <p style={{ margin: "18px 0 0", fontSize: 14.5, lineHeight: 1.4, color: C.n400 }}>
            {t.ancora}:{" "}
            <s style={{ textDecorationThickness: "1.5px", textDecorationColor: C.n300 }}>{ancora} {t.totalSufixo}</s>
          </p>
        )}

        {/* MANCHETE: equivalente mensal. Só equivalência, nunca um plano
            mensal: o handoff proíbe vender mensalidade. */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: ancora ? 6 : 18, flexWrap: "wrap" }}>
          <span style={{ fontFamily: C.serif, fontSize: "clamp(42px,5vw,54px)", lineHeight: 1, letterSpacing: "-.02em", color: "#fff" }}>
            {mensal}
          </span>
          <span style={{ fontFamily: C.serif, fontSize: 24, lineHeight: 1, color: C.n300 }}>{t.mes}</span>
          {vigente && t.mesLancamento && (
            <span style={{ fontSize: 14, color: C.n300 }}>{t.mesLancamento}</span>
          )}
        </div>

        {/* TOTAL ANUAL, e a regra do lançamento quando o mercado tiver um. */}
        <p style={{ margin: "10px 0 0", fontSize: 15, lineHeight: 1.6, color: C.n200 }}>
          <strong style={{ color: "#fff", fontWeight: 600 }}>{anual}</strong> {t.totalSufixo}
          {regra ? ` ${regra}` : ""}
        </p>

        <div style={{ marginTop: 12, display: "inline-flex", alignItems: "center", gap: 8, minHeight: 30, padding: "4px 12px", borderRadius: 999, background: C.s0, border: "1px solid rgba(255,255,255,.1)", fontSize: 13, fontWeight: 600, color: C.n200 }}>
          <Relogio />
          {pagamentoAgora(mercado, momento)}
        </div>

        {/* Prazo do lançamento em TEXTO. Sem contador: urgência artificial
            é vetada, e a data é verdadeira. */}
        {prazo && t.prazo && (
          <p style={{ margin: "12px 0 0", fontSize: 13.5, color: C.ret }}>
            {t.prazo} {prazo}.
          </p>
        )}

        {botao(22)}
        {depoisDoBotao}
        {confianca(false)}
        {notaDeTeste}
      </div>
    </div>
  );
}
