// Gravação tolerante da lista de espera (lib/lista-espera.ts), com um
// dublê em memória no lugar do Supabase. Nada sai da máquina.
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("path");
const { carregarTs } = require("../scripts/carregar-ts");

const L = carregarTs(path.join(__dirname, "..", "lib", "lista-espera.ts"));
const LEAD = { nome: "Pessoa Teste", email: "pessoa@exemplo.test", whatsapp: "5500000000000" };

/** Banco falso: recusa as colunas que não "existem". */
function banco(colunas) {
  const linhas = [];
  const chamadas = [];
  const gravar = async (linha) => {
    chamadas.push(Object.keys(linha));
    const faltando = Object.keys(linha).find((k) => !colunas.includes(k));
    if (faltando) {
      return { data: null, error: { code: "PGRST204", message: `Could not find the '${faltando}' column of 'lista_espera' in the schema cache` } };
    }
    if (linhas.some((l) => l.email === linha.email)) return { data: [], error: null };
    linhas.push(linha);
    return { data: [{ id: "x" }], error: null };
  };
  return { linhas, chamadas, gravar };
}

const BASE = ["nome", "email", "whatsapp"];

test("com as colunas novas, grava mercado, idioma e país", async () => {
  const b = banco([...BASE, "mercado", "idioma", "pais"]);
  const r = await L.gravarTolerante(b.gravar, LEAD, { mercado: "pt", idioma: "pt", pais: "PT" });
  assert.deepEqual(r, { novo: true, semColunasNovas: false });
  assert.equal(b.linhas[0].mercado, "pt");
  assert.equal(b.linhas[0].pais, "PT");
});

test("sem as colunas novas, grava sem elas e não perde o lead", async () => {
  const b = banco(BASE);
  const r = await L.gravarTolerante(b.gravar, LEAD, { mercado: "la", idioma: "es", pais: "MX" });
  assert.deepEqual(r, { novo: true, semColunasNovas: true });
  assert.equal(b.linhas.length, 1);
  assert.equal("mercado" in b.linhas[0], false);
  assert.equal(b.chamadas.length, 2);
});

test("país vazio não vai como coluna", async () => {
  const b = banco([...BASE, "mercado", "idioma", "pais"]);
  await L.gravarTolerante(b.gravar, LEAD, { mercado: "br", idioma: "pt", pais: null });
  assert.equal("pais" in b.linhas[0], false);
});

test("e-mail repetido continua sem mudar nada (novo: false)", async () => {
  const b = banco([...BASE, "mercado", "idioma", "pais"]);
  await L.gravarTolerante(b.gravar, LEAD, { mercado: "br", idioma: "pt", pais: "BR" });
  const r = await L.gravarTolerante(b.gravar, { ...LEAD, nome: "Outro Nome" }, { mercado: "br", idioma: "pt", pais: "BR" });
  assert.equal(r.novo, false);
  assert.equal(b.linhas[0].nome, "Pessoa Teste");
});

test("outro erro do banco sobe (a rota cai na rede de segurança do RD)", async () => {
  const gravar = async () => ({ data: null, error: { code: "08006", message: "connection failure" } });
  await assert.rejects(() => L.gravarTolerante(gravar, LEAD, { mercado: "br" }));
});

test("reconhece o erro de coluna do PostgREST e do Postgres", () => {
  assert.equal(L.faltaColuna({ code: "PGRST204", message: "Could not find the 'pais' column" }), true);
  assert.equal(L.faltaColuna({ code: "42703", message: 'column "mercado" of relation "lista_espera" does not exist' }), true);
  assert.equal(L.faltaColuna({ code: "23505", message: "duplicate key" }), false);
  assert.equal(L.faltaColuna(null), false);
});
