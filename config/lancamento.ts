/* =====================================================================
   CHAVE DE LANÇAMENTO · DM_SITE_LANCADO
   ---------------------------------------------------------------------
   Uma chave só decide se o site de vendas está no ar (decisão do dono,
   27/10/2026: "Deixe o site de vendas em standby").

   DESLIGADA (padrão, agora) · STANDBY
     - "/", "/es", "/es-es" e "/pt-pt" mostram a lista de espera ("Em
       breve"), como a produção antes do lançamento; a /estudante e a
       /sobre também ficam como na produção. O que ainda muda para o
       público já no merge está em docs/LANCAMENTO.md ("O que muda para o
       público já no merge em standby"). O middleware continua
       levando cada país à home dele, mas NÃO reescreve "/" para /mundo.
     - O site de vendas de cada mercado, como vai ao ar quando a venda
       dele abrir (mesmos componentes, preço, oferta e botões), fica na
       "vitrine", com o idioma na frente: /vendas (Brasil), /es/vendas
       (América Latina), /es-es/vendas, /pt-pt/vendas e /mundo/vendas
       (lib/mercado.ts, VENDAS_DO_MERCADO). Noindex, fora do sitemap, sem
       hreflang. Os links entre mercados dentro dela ficam na vitrine. Os
       endereços antigos (/vendas/es, /vendas/es-es, /vendas/pt-pt,
       /vendas/mundo) levam aos novos.
     - Na vitrine, todo mercado aparece com a venda aberta (la, es, pt e
       rw também, que seguem com vendaAberta: false no lançamento
       público), e os botões abrem o checkout de verdade da Hotmart
       (decisão do dono, 27/10/2026: "Já pode colocar o link do
       checkout. Quero testar a jornada inteira.").
     - /embreve, /es/embreve, /pt-pt/embreve e /es-es/embreve levam à
       vitrine do mercado.
     - A trava de preços e a do webhook (DM_WEBHOOK_V2_OK) não param o
       build: o que travaria o lançamento sai como aviso no log
       (scripts/checar-precos.js, emStandby).

   LIGADA (DM_SITE_LANCADO=1 nas variáveis de Production da Vercel e um
   novo deploy) · LANÇAMENTO
     - "/" vira o site de vendas e o middleware decide por país (PR #3).
     - A vitrine (e os endereços antigos dela) redireciona para a home
       real do mercado.
     - A trava de preços e a do webhook voltam a parar o build de produção.

   O valor é gravado NO BUILD pelo next.config.js (só "1" liga; qualquer
   outro valor, ou nenhum, é standby). Trocar a variável na Vercel sem um
   novo deploy não muda nada. Passo a passo: docs/LANCAMENTO.md.
   ===================================================================== */

export const SITE_LANCADO: boolean = process.env.DM_SITE_LANCADO === "1";
