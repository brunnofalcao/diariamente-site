/* =====================================================================
   TRAVA DO ENDEREÇO DA EMPRESA
   ---------------------------------------------------------------------
   O endereço físico da empresa é obrigatório em loja on-line (Decreto
   7.962/2013, art. 2º) e aparece na Política de Privacidade (pt e es), no
   rodapé da home e no rodapé das páginas legais. Ele mora num lugar só:
   a constante ENDERECO_DA_EMPRESA em config.ts.

   Enquanto essa constante tiver "[TROCAR" (em qualquer posição) ou estiver
   vazia, o `next build` FALHA de propósito (ver next.config.js). Assim
   ninguém publica o site com o marcador aparecendo para o cliente, nem sem
   endereço nenhum.

   Para testar o build na sua máquina sem o endereço real, existe a
   variável DM_ENDERECO_TESTE (por exemplo, DM_ENDERECO_TESTE="Rua de
   Teste, 123"). Ela substitui o endereço na página e é RECUSADA em build
   de produção da Vercel, para não ir ao ar por engano.

   Este arquivo é CommonJS puro, sem dependências: o next.config.js o
   carrega antes de existir qualquer TypeScript compilado, e o teste em
   test/checar-endereco.test.js roda com `node --test`.
   ===================================================================== */

const fs = require("fs");
const path = require("path");

const MARCADOR = "[TROCAR";
const CONSTANTE = "ENDERECO_DA_EMPRESA";

/** Lê o valor literal de ENDERECO_DA_EMPRESA no texto do config.ts. */
function lerEndereco(textoDoConfig) {
  const m = String(textoDoConfig).match(
    /const\s+ENDERECO_DA_EMPRESA\s*=\s*(["'`])([\s\S]*?)\1\s*;/
  );
  return m ? m[2].trim() : null;
}

/**
 * Decide se o build pode seguir.
 * Devolve { ok, mensagem, endereco, teste }.
 *   ok=false  build de produção precisa parar, com `mensagem`
 *   teste     true quando o endereço exibido é o fictício de DM_ENDERECO_TESTE
 */
function checarEndereco({ textoDoConfig, env = {} }) {
  const valor = lerEndereco(textoDoConfig);
  const teste = String(env.DM_ENDERECO_TESTE || "").trim();

  if (valor === null) {
    return {
      ok: false,
      teste: false,
      endereco: null,
      mensagem:
        `Não encontrei a constante ${CONSTANTE} em config.ts. Ela é a fonte única do ` +
        "endereço da empresa e precisa existir no formato " +
        `const ${CONSTANTE} = "Rua..., nº, bairro, cidade/UF, CEP";`,
    };
  }

  if (teste) {
    // Na Vercel, só preview pode usar o endereço fictício. Produção nunca.
    if (env.VERCEL && env.VERCEL_ENV !== "preview") {
      return {
        ok: false,
        teste: true,
        endereco: teste,
        mensagem:
          "DM_ENDERECO_TESTE existe neste build da Vercel, e ela serve só para teste. " +
          "Apague essa variável no projeto da Vercel e escreva o endereço real em " +
          `${CONSTANTE}, no config.ts.`,
      };
    }
    return {
      ok: true,
      teste: true,
      endereco: teste,
      mensagem:
        `Build com endereço FICTÍCIO (DM_ENDERECO_TESTE="${teste}"). ` +
        "Serve para testar; não publique este build.",
    };
  }

  // "[TROCAR" em QUALQUER posição bloqueia, não só no começo: quem preenche
  // a rua e deixa "CEP [TROCAR]" no fim também não pode publicar.
  if (!valor || valor.toUpperCase().includes(MARCADOR)) {
    return {
      ok: false,
      teste: false,
      endereco: valor,
      mensagem:
        "Falta o endereço da empresa, e o site não pode ir ao ar sem ele " +
        "(Decreto 7.962/2013, art. 2º). Abra config.ts, procure " +
        `${CONSTANTE} e troque o texto "[TROCAR..." pelo endereço completo do ` +
        "cartão CNPJ da Science Play Cursos LTDA. Ele aparece na Política de " +
        "Privacidade, no rodapé da home e no rodapé das páginas legais. " +
        "Para só testar o build na sua máquina, rode com " +
        'DM_ENDERECO_TESTE="Rua de Teste, 123".',
    };
  }

  return { ok: true, teste: false, endereco: valor, mensagem: "" };
}

/** Atalho usado pelo next.config.js: lê o config.ts da raiz do projeto. */
function checarEnderecoDoProjeto(env = process.env) {
  const arquivo = path.join(__dirname, "..", "config.ts");
  const textoDoConfig = fs.readFileSync(arquivo, "utf8");
  return checarEndereco({ textoDoConfig, env });
}

module.exports = { MARCADOR, CONSTANTE, lerEndereco, checarEndereco, checarEnderecoDoProjeto };
