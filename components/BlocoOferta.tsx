"use client";

import {
  MERCADOS, precoFinal, porMes, formatar, linkCheckout, precoCheio, lancamentoVigente,
  dataDoLancamento, pendente, precoEstudante, porMesEstudante,
  type Mercado,
} from "@/config/pricing";
import { caminho } from "@/lib/rotas";
import { registrarInicioDeCheckout } from "@/lib/medicao";
import { ListaEsperaForm } from "@/components/ListaEsperaForm";

/* =====================================================================
   BLOCO DE OFERTA · cinco variantes
   ---------------------------------------------------------------------
   Handoff, seção 2. Nenhum preço escrito aqui: tudo vem de
   config/pricing.ts. Trocar valor, moeda, cupom ou link é editar
   aquele arquivo, e o bloco acompanha nos cinco mercados.

   O que o visitante vê, em qualquer mercado com venda aberta:
     manchete no equivalente mensal
     total anual logo abaixo
     UM botão

   Nunca: duas moedas, duas opções de plano, campo de cupom, contador,
   conversão na tela, valor de parcela.

   Mercado com vendaAberta: false (hoje pt, la e es): o bloco vira a
   lista de espera daquele mercado, sem preço nenhum. Exceção: `previa`
   (só nas prévias internas /pt-pt/embreve e /es-es/embreve), que mostra
   o bloco de venda para revisão, com o botão desabilitado.

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

export function BlocoOferta({ mercado, momento, previa = false }: { mercado: Mercado; momento: number; previa?: boolean }) {
  const o = MERCADOS[mercado];
  const t = o.textos;

  /* ------------------------- LISTA DE ESPERA ------------------------- */
  if (!o.vendaAberta && !previa) {
    return (
      <div style={moldura}>
        <Cabecalho titulo={t.titulo} selo={o.espera.selo} />
        <div style={miolo}>
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.55, color: C.n300 }}>{t.proposta}</p>
          <p style={{ margin: "14px 0 0", fontSize: 15.5, lineHeight: 1.6, color: C.n200 }}>{o.espera.texto}</p>
          <ListaEsperaForm mercado={mercado} origem="oferta" embutido botao={o.espera.botao} />
        </div>
      </div>
    );
  }

  /* ------------------------------ VENDA ------------------------------ */
  const vigente = lancamentoVigente(mercado, momento);
  const cheio = precoCheio(mercado, momento);
  const link = linkCheckout(mercado, momento);
  // Só chega aqui com a venda fechada na prévia interna.
  const fechado = !o.vendaAberta;
  // Link pendente só acontece em build de teste: em produção a trava não
  // deixa o build sair sem o link (scripts/checar-precos.js).
  const semLink = pendente(link) || fechado;
  const valor = precoFinal(mercado, momento);
  const mensal = formatar(mercado, porMes(mercado, momento));
  const anual = formatar(mercado, valor);
  const renovacao = o.renovaMesmoValor && t.renovacaoMesmoValor ? t.renovacaoMesmoValor : t.renovacao;
  const prazo = vigente ? dataDoLancamento(mercado) : null;

  return (
    <div style={moldura}>
      {/* O selo só aparece com o cupom valendo, com o percentual do config. */}
      <Cabecalho titulo={t.titulo} selo={vigente && o.lancamento ? `${o.lancamento.percentual}% OFF` : undefined} />

      <div style={miolo}>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.55, color: C.n300 }}>{t.proposta}</p>

        {/* MANCHETE: equivalente mensal. Só equivalência, nunca um plano
            mensal: o handoff proíbe vender mensalidade. */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 18, flexWrap: "wrap" }}>
          <span style={{ fontFamily: C.serif, fontSize: "clamp(42px,5vw,54px)", lineHeight: 1, letterSpacing: "-.02em", color: "#fff" }}>
            {mensal}
          </span>
          <span style={{ fontFamily: C.serif, fontSize: 24, lineHeight: 1, color: C.n300 }}>{t.mes}</span>
          {vigente && t.mesLancamento && (
            <span style={{ fontSize: 14, color: C.n300 }}>{t.mesLancamento}</span>
          )}
        </div>

        {/* TOTAL ANUAL. Com o cupom valendo, diz que ele já vem no botão e
            mostra o preço cheio: nada de código para digitar. */}
        <p style={{ margin: "10px 0 0", fontSize: 15, lineHeight: 1.6, color: C.n200 }}>
          <strong style={{ color: "#fff", fontWeight: 600 }}>{anual}</strong> {t.totalSufixo}
          {vigente && t.cupomAplicado ? `, ${t.cupomAplicado}.` : ""}
        </p>
        {cheio && t.precoCheio && (
          <p style={{ margin: "2px 0 0", fontSize: 14, lineHeight: 1.5, color: C.n400 }}>
            {t.precoCheio} <s>{cheio}</s>
          </p>
        )}

        <div style={{ marginTop: 12, display: "inline-flex", alignItems: "center", gap: 8, minHeight: 30, padding: "4px 12px", borderRadius: 999, background: C.s0, border: "1px solid rgba(255,255,255,.1)", fontSize: 13, fontWeight: 600, color: C.n200 }}>
          <Relogio />
          {t.pagamento}
        </div>

        {/* Prazo do lançamento em TEXTO. Sem contador: urgência artificial
            é vetada, e a data é verdadeira. */}
        {prazo && t.prazo && (
          <p style={{ margin: "12px 0 0", fontSize: 13.5, color: C.ret }}>
            {t.prazo} {prazo}.
          </p>
        )}

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
            height: 54, marginTop: 22, width: "100%", borderRadius: 999,
            background: semLink ? "rgba(39,189,190,.35)" : C.p500,
            color: C.n900, fontSize: 16, fontWeight: 700, textDecoration: "none",
            cursor: semLink ? "not-allowed" : "pointer",
          }}
        >
          {t.botao}
        </a>

        <p style={{ margin: "12px 0 0", textAlign: "center", fontSize: 13, lineHeight: 1.45, color: C.n400 }}>
          {renovacao}
        </p>

        {o.imposto === "fora" && t.impostoNota && (
          <p style={{ margin: "8px 0 0", textAlign: "center", fontSize: 12.5, lineHeight: 1.45, color: C.n400 }}>
            {t.impostoNota}
          </p>
        )}

        {/* Estudante só existe no Brasil: a validação usa CPF e o cobro é
            em real (handoff, seção 12, item P2). */}
        {mercado === "br" && t.estudante && (
          <p style={{ margin: "14px 0 0", textAlign: "center", fontSize: 13.5, lineHeight: 1.5 }}>
            <a href={caminho("estudante", "pt")} style={{ color: C.p300, textDecoration: "none" }}>
              {t.estudante}: {formatar("br", porMesEstudante())}{t.mes} · {formatar("br", precoEstudante())} {t.totalSufixo}
            </a>
          </p>
        )}

        <ul style={{ listStyle: "none", margin: "18px 0 0", padding: "18px 0 0", borderTop: `1px solid ${C.line}`, display: "grid", gap: 10, fontSize: 14, color: C.n200 }}>
          {o.confianca.map((x) => (
            <li key={x} style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <Escudo />
              {x}
            </li>
          ))}
        </ul>

        {fechado ? (
          <p style={{ margin: "14px 0 0", textAlign: "center", fontSize: 12, color: C.ret }}>
            Prévia interna: a venda deste mercado ainda está fechada e o botão não abre o pagamento.
          </p>
        ) : semLink && (
          <p style={{ margin: "14px 0 0", textAlign: "center", fontSize: 12, color: C.ret }}>
            Build de teste: link de checkout pendente em config/pricing.ts
          </p>
        )}
      </div>
    </div>
  );
}
