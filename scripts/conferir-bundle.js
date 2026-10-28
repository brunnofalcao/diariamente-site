/* =====================================================================
   CONFERÊNCIA DEPOIS DO BUILD: O CÓDIGO DA OFERTA DE ESTUDANTE NÃO VAI
   AO NAVEGADOR
   ---------------------------------------------------------------------
   Roda no `npm run build`, logo depois do `next build` (package.json). A
   oferta de estudante da Hotmart (ESTUDANTE_OFERTA_LANCAMENTO e
   ESTUDANTE_OFERTA, em config/pricing.ts) tem link aberto: quem tiver o
   off= paga o preço de estudante sem passar pela /estudante (CPF único,
   declaração do vínculo, teto por hora, link pessoal). Por isso o código
   só pode existir no servidor (/estudante/ativar, a API do pedido, o
   webhook e o pós-pagamento).

   Procura cada código preenchido em tudo o que o navegador recebe:
     .next/static            o JavaScript e o CSS das páginas
     .next/server/app        só o HTML e o RSC das páginas geradas no
     .next/server/pages      build (.html, .rsc, .body), nunca o .js do
                             servidor, que pode ter o código
   Achou: o build FALHA, com a lista dos arquivos. Quase sempre é um
   componente "use client" (ou o config.ts) chamando ofertaDoEstudante,
   estudanteTemOferta, checkoutDoEstudante ou OFERTAS_DO_ESTUDANTE: o
   navegador só pode usar estudanteAberto (config.ts), que lê o NOME das
   fases (DM_ESTUDANTE_FASES).

   Sem código preenchido, não há o que procurar: só avisa e passa.
   CommonJS puro, sem dependência nova. Teste em test/precos.test.js.
   ===================================================================== */

const fs = require("fs");
const path = require("path");

/** Extensões que o navegador recebe nas pastas do servidor. */
const DO_NAVEGADOR_NO_SERVIDOR = /\.(html|rsc|body)$/;

function arquivos(pasta, filtro) {
  const achados = [];
  let itens;
  try {
    itens = fs.readdirSync(pasta, { withFileTypes: true });
  } catch {
    return achados;
  }
  for (const item of itens) {
    const caminho = path.join(pasta, item.name);
    if (item.isDirectory()) achados.push(...arquivos(caminho, filtro));
    else if (!filtro || filtro.test(item.name)) achados.push(caminho);
  }
  return achados;
}

/** Os códigos de oferta de estudante preenchidos (e válidos) no config. */
function codigosDoConfig(cfg) {
  const ofertas = (cfg && cfg.OFERTAS_DO_ESTUDANTE) || {};
  return Object.values(ofertas)
    .map((c) => String(c || "").trim())
    .filter((c) => /^[A-Za-z0-9]{4,20}$/.test(c));
}

/**
 * Procura os códigos no que o navegador recebe de `pastaNext` (.next).
 * O código precisa aparecer inteiro, sem letra ou número colado antes ou
 * depois (um nome de arquivo com hash não conta). Devolve [{ arquivo, codigo }].
 */
function procurarCodigos(pastaNext, codigos) {
  const lista = codigos.filter(Boolean);
  if (!lista.length) return [];
  const alvos = [
    ...arquivos(path.join(pastaNext, "static")),
    ...arquivos(path.join(pastaNext, "server", "app"), DO_NAVEGADOR_NO_SERVIDOR),
    ...arquivos(path.join(pastaNext, "server", "pages"), DO_NAVEGADOR_NO_SERVIDOR),
  ];
  const padroes = lista.map((c) => [c, new RegExp(`(^|[^A-Za-z0-9])${c}($|[^A-Za-z0-9])`, "i")]);
  const achados = [];
  for (const arquivo of alvos) {
    let texto;
    try {
      texto = fs.readFileSync(arquivo, "utf8");
    } catch {
      continue;
    }
    for (const [codigo, re] of padroes) {
      if (re.test(texto)) achados.push({ arquivo: path.relative(path.dirname(pastaNext), arquivo), codigo });
    }
  }
  return achados;
}

function main() {
  const raiz = path.join(__dirname, "..");
  const { carregarPrecos } = require("./checar-precos");
  const codigos = codigosDoConfig(carregarPrecos());
  if (!codigos.length) {
    console.log("[diariamente] Conferência do build: nenhum código de oferta de estudante preenchido, nada a procurar.");
    return 0;
  }
  const pastaNext = path.join(raiz, ".next");
  if (!fs.existsSync(pastaNext)) {
    console.error("[diariamente] Conferência do build: .next não existe. Rode depois do next build.");
    return 1;
  }
  const achados = procurarCodigos(pastaNext, codigos);
  if (achados.length) {
    console.error(
      "\n[diariamente] BUILD BLOQUEADO: o código da oferta de estudante foi parar no que o navegador recebe. " +
        "Qualquer visitante pagaria o preço de estudante sem passar pela /estudante. Arquivos:\n" +
        achados.map((a) => `  ${a.arquivo} (off=${a.codigo})`).join("\n") +
        "\nO navegador só pode usar estudanteAberto (config.ts); ofertaDoEstudante, estudanteTemOferta, " +
        "checkoutDoEstudante e OFERTAS_DO_ESTUDANTE são só do servidor (config/pricing.ts).\n"
    );
    return 1;
  }
  console.log(`[diariamente] Conferência do build: os ${codigos.length} códigos de oferta de estudante ficaram só no servidor.`);
  return 0;
}

if (require.main === module) process.exit(main());

module.exports = { procurarCodigos, codigosDoConfig };
