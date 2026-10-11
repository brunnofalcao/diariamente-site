"use client";

import {
  MERCADOS, precoFinal, porMes, formatar, linkCheckout, precoCheio,
  type Mercado,
} from "@/config/pricing";
import { caminho } from "@/lib/rotas";

/* =====================================================================
   BLOCO DE OFERTA · cinco variantes
   ---------------------------------------------------------------------
   Handoff, seção 2. Nenhum preço escrito aqui: tudo vem de
   config/pricing.ts. Trocar valor, moeda, cupom ou link é editar
   aquele arquivo, e o bloco acompanha nos cinco mercados.

   O que o visitante vê, em qualquer mercado:
     manchete no equivalente mensal
     total anual logo abaixo
     UM botão

   Nunca: duas moedas, duas opções de plano, campo de cupom, contador,
   conversão na tela.
   ===================================================================== */

const C = {
  p500: "#27BDBE", p300: "#5DD8D8", s0: "#0A0E0E", s2: "#181D1D",
  n200: "#CDD2D2", n300: "#AAB2B2", n400: "#8A9494", ret: "#F5B731",
  line: "rgba(255,255,255,.07)",
  serif: "'Literata', Georgia, serif",
};

function Relogio() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.p500} strokeWidth={2.2} strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" /><path d="M12 7v5.2l3.2 1.9" />
    </svg>
  );
}

export function BlocoOferta({ mercado }: { mercado: Mercado }) {
  const o = MERCADOS[mercado];
  const t = o.textos;
  const cheio = precoCheio(mercado);
  const link = linkCheckout(mercado);
  const semLink = link.startsWith("[");

  // Manchete: equivalente mensal. É só equivalência, nunca um plano
  // mensal: o handoff proíbe vender mensalidade.
  const mensal = formatar(mercado, porMes(mercado));
  const anual = formatar(mercado, precoFinal(mercado));

  return (
    <div style={{ background: C.s2, border: "1px solid rgba(39,189,190,.32)", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "12px clamp(20px,3vw,28px)", background: "rgba(39,189,190,.08)", borderBottom: "1px solid rgba(39,189,190,.2)" }}>
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: C.p500 }}>
          {t.titulo}
        </span>
        {/* O selo só aparece com cupom ativo, e mostra o percentual real
            do config: nunca um número digitado. */}
        {o.lancamento?.ativo && (
          <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 999, background: "rgba(245,183,49,.12)", border: "1px solid rgba(245,183,49,.3)", color: C.ret, fontSize: 12, fontWeight: 700 }}>
            {o.lancamento.percentual}% OFF
          </span>
        )}
      </div>

      <div style={{ padding: "clamp(20px,3vw,28px)" }}>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.55, color: C.n300 }}>{t.proposta}</p>

        {/* MANCHETE: equivalente mensal */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 18, flexWrap: "wrap" }}>
          <span style={{ fontFamily: C.serif, fontSize: "clamp(42px,5vw,54px)", lineHeight: 1, letterSpacing: "-.02em", color: "#fff" }}>
            {mensal}
          </span>
          <span style={{ fontFamily: C.serif, fontSize: 24, lineHeight: 1, color: C.n300 }}>{t.mes}</span>
        </div>

        {/* TOTAL ANUAL, com o preço cheio riscado só onde há cupom */}
        <div style={{ marginTop: 10, fontSize: 15, lineHeight: 1.6, color: C.n200 }}>
          {cheio && (
            <span style={{ color: C.n400, marginRight: 8 }}>
              <s>{cheio}</s>
            </span>
          )}
          <strong style={{ color: "#fff", fontWeight: 600 }}>{anual}</strong> {t.totalSufixo}
          {o.imposto === "dentro" && t.impostoNota ? `, ${t.impostoNota}` : ""}
        </div>

        <div style={{ marginTop: 12, display: "inline-flex", alignItems: "center", gap: 8, height: 30, padding: "0 12px", borderRadius: 999, background: C.s0, border: "1px solid rgba(255,255,255,.1)", fontSize: 13, fontWeight: 600, color: C.n200 }}>
          <Relogio />
          {t.pagamento}
        </div>

        {/* Prazo do lançamento em TEXTO. Sem contador: urgência artificial
            é vetada, e a data é verdadeira. */}
        {o.lancamento?.ativo && (
          <p style={{ margin: "12px 0 0", fontSize: 13.5, color: C.ret }}>
            {t.prazo} {o.lancamento.terminaEm}
          </p>
        )}

        {o.vendaAberta ? (
          <a
            href={semLink ? undefined : link}
            target="_blank"
            rel="noopener noreferrer"
            aria-disabled={semLink}
            onClick={(e) => {
              if (semLink) { e.preventDefault(); return; }
              (window as any).fbq?.("track", "InitiateCheckout", { currency: o.moeda, value: precoFinal(mercado), content_name: `plano-${mercado}` });
              (window as any).gtag?.("event", "begin_checkout", { currency: o.moeda, value: precoFinal(mercado), items: [{ item_name: `Diariamente Anual ${mercado.toUpperCase()}` }] });
              (window as any).dataLayer?.push({ event: "InitiateCheckout", mercado, moeda: o.moeda });
            }}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              height: 54, marginTop: 22, width: "100%", borderRadius: 999,
              background: semLink ? "rgba(39,189,190,.35)" : C.p500,
              color: "#131918", fontSize: 16, fontWeight: 700, textDecoration: "none",
              cursor: semLink ? "not-allowed" : "pointer",
            }}
          >
            {t.botao}
          </a>
        ) : (
          // la e es ficam na lista de espera até o acervo em espanhol
          // estar revisado (handoff, seção 9).
          <a
            href={caminho("home", o.idioma)}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 54, marginTop: 22, width: "100%", borderRadius: 999, border: `1.5px solid ${C.p500}`, color: C.p500, fontSize: 16, fontWeight: 700, textDecoration: "none" }}
          >
            {o.idioma === "es" ? "Avísame cuando abra" : "Me avise quando abrir"}
          </a>
        )}

        <p style={{ margin: "12px 0 0", textAlign: "center", fontSize: 13, lineHeight: 1.45, color: C.n400 }}>
          {o.renovaMesmoValor
            ? t.renovacao
            : t.renovacao.replace(" pelo mesmo valor", "").replace(" por el mismo valor", "")}
        </p>

        {o.imposto === "fora" && t.impostoNota && (
          <p style={{ margin: "8px 0 0", textAlign: "center", fontSize: 12.5, lineHeight: 1.45, color: C.n400 }}>
            {t.impostoNota}
          </p>
        )}

        {/* Estudante só existe no Brasil: a validação usa CPF e o cobro é
            em real (handoff, seção 12, item P2). */}
        {mercado === "br" && t.estudante && (
          <p style={{ margin: "14px 0 0", textAlign: "center", fontSize: 13.5 }}>
            <a href={caminho("estudante", "pt")} style={{ color: C.p300, textDecoration: "none" }}>
              {t.estudante}
            </a>
          </p>
        )}

        {semLink && (
          <p style={{ margin: "14px 0 0", textAlign: "center", fontSize: 12, color: C.ret }}>
            Link de checkout pendente em config/pricing.ts
          </p>
        )}
      </div>
    </div>
  );
}
