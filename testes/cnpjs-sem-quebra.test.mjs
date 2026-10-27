// Em 320px o navegador partia um CNPJ depois do hífen ("...0001-" numa
// linha, "29" na outra). components/CnpjsDoGrupo.tsx põe cada número num
// span com white-space: nowrap, sem trocar caractere nenhum.
// Este teste segura três coisas:
//   1. o texto que a pessoa lê continua IGUAL ao aprovado (e às funções
//      identificacaoDoGrupo e rodapeDoGrupo do config.ts);
//   2. cada CNPJ (e cada "(CNPJ ...)" da linha de identificação) sai
//      inteiro dentro do span que não quebra;
//   3. nenhuma página volta a exibir a versão em string, que quebra.
// Renderiza o componente de verdade: transpila o .tsx com o typescript do
// próprio projeto e usa o react-dom/server. Sem dependência nova.
// Roda com: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const raiz = fileURLToPath(new URL("..", import.meta.url));
const doProjeto = createRequire(join(raiz, "package.json"));

/** Carrega um .ts/.tsx do projeto como CommonJS, sem gravar arquivo. */
function carregar(arquivo, modulos = {}) {
  const { outputText } = ts.transpileModule(readFileSync(join(raiz, arquivo), "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
  });
  const modulo = { exports: {} };
  const exigir = (nome) => (nome in modulos ? modulos[nome] : doProjeto(nome));
  new Function("require", "module", "exports", outputText)(exigir, modulo, modulo.exports);
  return modulo.exports;
}

// O config.ts repassa os planos de config/pricing.ts (preço por mercado).
const config = carregar("config.ts", { "@/config/pricing": carregar("config/pricing.ts") });
const { CnpjsDoGrupo, RodapeDoGrupo, IdentificacaoDoGrupo } = carregar("components/CnpjsDoGrupo.tsx", {
  "@/config": config,
});
const { createElement } = doProjeto("react");
const { renderToStaticMarkup } = doProjeto("react-dom/server");

const html = (Componente, lang) => renderToStaticMarkup(createElement(Componente, { lang }));
const texto = (marcacao) => marcacao.replace(/<[^>]+>/g, "");
const NAO_QUEBRA = '<span style="white-space:nowrap">';

// Textos aprovados pelo dono (26/10/2026), copiados como foram aprovados.
const APROVADO = {
  identificacao: {
    pt: "O Diariamente é um produto Science Play®, operado pelas empresas do grupo Science Play: Science Play Audiobook LTDA (CNPJ 33.619.144/0001-80), Science Play Cursos LTDA (CNPJ 33.612.911/0001-29) e Falcão14 Organização de Feiras LTDA (CNPJ 33.616.206/0001-08).",
    es: "Diariamente es un producto Science Play®, operado por las empresas del grupo Science Play: Science Play Audiobook LTDA (CNPJ 33.619.144/0001-80), Science Play Cursos LTDA (CNPJ 33.612.911/0001-29) y Falcão14 Organização de Feiras LTDA (CNPJ 33.616.206/0001-08).",
  },
  rodape: {
    pt: "Science Play® · grupo Science Play · CNPJs 33.619.144/0001-80, 33.612.911/0001-29 e 33.616.206/0001-08",
    es: "Science Play® · grupo Science Play · CNPJs 33.619.144/0001-80, 33.612.911/0001-29 y 33.616.206/0001-08",
  },
};

for (const lang of ["pt", "es"]) {
  test(`linha de identificação (${lang}): texto visível igual ao aprovado`, () => {
    assert.equal(texto(html(IdentificacaoDoGrupo, lang)), APROVADO.identificacao[lang]);
    assert.equal(config.identificacaoDoGrupo(lang), APROVADO.identificacao[lang]);
  });

  test(`linha de identificação (${lang}): cada "(CNPJ ...)" inteiro num span que não quebra`, () => {
    const marcacao = html(IdentificacaoDoGrupo, lang);
    for (const { cnpj } of config.EMPRESA.grupo) {
      assert.ok(marcacao.includes(`${NAO_QUEBRA}(CNPJ ${cnpj})</span>`), cnpj);
    }
  });

  test(`rodapé curto (${lang}): texto visível igual ao aprovado`, () => {
    assert.equal(texto(html(RodapeDoGrupo, lang)), APROVADO.rodape[lang]);
    assert.equal(config.rodapeDoGrupo(lang), APROVADO.rodape[lang]);
  });

  test(`rodapé curto (${lang}): cada CNPJ inteiro num span que não quebra`, () => {
    const marcacao = html(CnpjsDoGrupo, lang);
    for (const { cnpj } of config.EMPRESA.grupo) {
      assert.ok(marcacao.includes(`${NAO_QUEBRA}${cnpj}</span>`), cnpj);
    }
  });
}

function arquivos(pasta) {
  const achados = [];
  for (const nome of readdirSync(pasta)) {
    const caminho = join(pasta, nome);
    if (statSync(caminho).isDirectory()) achados.push(...arquivos(caminho));
    else if (/\.(ts|tsx|js|mjs)$/.test(nome)) achados.push(caminho);
  }
  return achados;
}

test("nenhuma página ou componente exibe a versão em string (que parte o CNPJ)", () => {
  const fora = ["app", "components"]
    .flatMap((p) => arquivos(join(raiz, p)))
    .filter((a) => /\b(rodapeDoGrupo|identificacaoDoGrupo)\(/.test(readFileSync(a, "utf8")))
    .map((a) => relative(raiz, a));
  assert.deepEqual(fora, [], "use RodapeDoGrupo e IdentificacaoDoGrupo de components/CnpjsDoGrupo.tsx");
});
