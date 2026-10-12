/* =====================================================================
   CARREGAR UM .ts FORA DO NEXT
   ---------------------------------------------------------------------
   A trava de preços (scripts/checar-precos.js) roda no next.config.js,
   antes de existir qualquer TypeScript compilado, e os testes rodam com
   `node --test`. Os dois precisam ler o config/pricing.ts de verdade, e
   não uma cópia dos valores: cópia diverge.

   O TypeScript já está no projeto (devDependencies; o próprio Next o
   exige), então não há dependência nova. O arquivo é só transpilado
   (sem checagem de tipo) para CommonJS e executado isolado. Import de
   tipo some na transpilação; import de verdade precisa vir em `modulos`.
   ===================================================================== */

const fs = require("fs");
const path = require("path");

function carregarTs(arquivo, modulos = {}) {
  const ts = require("typescript");
  const fonte = fs.readFileSync(arquivo, "utf8");
  const { outputText } = ts.transpileModule(fonte, {
    fileName: path.basename(arquivo),
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2019,
      esModuleInterop: true,
    },
  });
  const modulo = { exports: {} };
  const exigir = (nome) => {
    if (Object.prototype.hasOwnProperty.call(modulos, nome)) return modulos[nome];
    throw new Error(`${path.basename(arquivo)} importa "${nome}", que não foi entregue ao carregador.`);
  };
  // eslint-disable-next-line no-new-func
  new Function("exports", "require", "module", "__filename", "__dirname", outputText)(
    modulo.exports, exigir, modulo, arquivo, path.dirname(arquivo)
  );
  return modulo.exports;
}

module.exports = { carregarTs };
