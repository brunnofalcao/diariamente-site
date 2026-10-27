/* =====================================================================
   CHAVE DE LANÇAMENTO · DM_SITE_LANCADO
   ---------------------------------------------------------------------
   Uma chave só decide se o site de vendas está no ar (decisão do dono,
   27/10/2026: "Deixe o site de vendas em standby").

   DESLIGADA (padrão, agora) · STANDBY
     - "/", "/es", "/es-es" e "/pt-pt" mostram a lista de espera ("Em
       breve"), como a produção antes do lançamento. O middleware continua
       levando cada país à home dele, mas NÃO reescreve "/" para /mundo.
     - O site de vendas, exatamente como vai ao ar (mesmos componentes,
       preço, oferta e botões), fica em /vendas (Brasil), /vendas/es
       (América Latina), /vendas/es-es, /vendas/pt-pt e /vendas/mundo
       (lib/mercado.ts, VENDAS_DO_MERCADO). Noindex, fora do sitemap, sem
       hreflang. Os links entre mercados dentro dele ficam em /vendas.
     - /embreve, /es/embreve, /pt-pt/embreve e /es-es/embreve levam ao
       /vendas do mercado.
     - A trava de preços e a do webhook (DM_WEBHOOK_V2_OK) não param o
       build: o que travaria o lançamento sai como aviso no log
       (scripts/checar-precos.js, emStandby).

   LIGADA (DM_SITE_LANCADO=1 nas variáveis de Production da Vercel e um
   novo deploy) · LANÇAMENTO
     - "/" vira o site de vendas e o middleware decide por país (PR #3).
     - /vendas e /vendas/* redirecionam para a home real do mercado.
     - A trava de preços e a do webhook voltam a parar o build de produção.

   O valor é gravado NO BUILD pelo next.config.js (só "1" liga; qualquer
   outro valor, ou nenhum, é standby). Trocar a variável na Vercel sem um
   novo deploy não muda nada. Passo a passo: docs/LANCAMENTO.md.
   ===================================================================== */

export const SITE_LANCADO: boolean = process.env.DM_SITE_LANCADO === "1";
