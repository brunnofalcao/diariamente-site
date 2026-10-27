import type { Mercado } from "@/config/pricing";
import { VENDAS_DO_MERCADO } from "@/lib/mercado";

/* =====================================================================
   SELETOR DE MERCADO · rodapé
   ---------------------------------------------------------------------
   Brasil · Portugal · España · América Latina (handoff, seção 6).
   Cada link leva ?mercado=xx: o middleware grava o cookie dm_market
   (180 dias), que vence a geolocalização, e manda para a home daquele
   mercado. É a saída para quem mora fora do país que o IP indica.

   Resto do mundo não aparece: ele não tem página própria, é a "/" com o
   bloco em dólar, e chega pelo IP.

   Com `vitrine` (site de vendas em standby: /vendas, /es/vendas,
   /es-es/vendas, /pt-pt/vendas), cada link leva direto à vitrine daquele
   mercado (lib/mercado.ts, VENDAS_DO_MERCADO), sem cookie: quem revisa o
   site de vendas não sai dele.
   ===================================================================== */

const OPCOES: [Exclude<Mercado, "rw">, string][] = [
  ["br", "Brasil"],
  ["pt", "Portugal"],
  ["es", "España"],
  ["la", "América Latina"],
];

const P500 = "#27BDBE";
const N300 = "#AAB2B2";
const N400 = "#8A9494";

export function SeletorMercado({
  atual,
  titulo,
  linha = false,
  vitrine = false,
}: {
  atual: Mercado;
  titulo: string;
  /** true: em linha, separado por ponto (página "em breve"). */
  linha?: boolean;
  /** true: no site de vendas em standby (a vitrine). */
  vitrine?: boolean;
}) {
  return (
    <nav
      aria-label={titulo}
      style={
        linha
          ? { display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center", gap: "4px 14px", fontSize: 13 }
          : { display: "flex", flexDirection: "column", gap: 10, minWidth: 0 }
      }
    >
      {!linha && (
        <span style={{ fontWeight: 700, fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: P500, marginBottom: 4 }}>
          {titulo}
        </span>
      )}
      {OPCOES.map(([cod, nome]) => {
        const marcado = atual === cod;
        return (
          <a
            key={cod}
            href={vitrine ? VENDAS_DO_MERCADO[cod] : `/?mercado=${cod}`}
            aria-current={marcado ? "true" : undefined}
            style={{
              fontSize: linha ? 13 : 15,
              textDecoration: "none",
              minHeight: linha ? 32 : 28,
              display: "inline-flex",
              alignItems: "center",
              color: marcado ? P500 : linha ? N400 : N300,
              fontWeight: marcado ? 600 : 400,
            }}
          >
            {nome}
          </a>
        );
      })}
    </nav>
  );
}
