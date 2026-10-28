/* =====================================================================
   CABEÇALHOS DE PROTEÇÃO (todas as rotas, páginas e API)
   ---------------------------------------------------------------------
   X-Frame-Options DENY        nenhuma página pode ser aberta dentro de
                               iframe de outro site (o formulário do
                               estudante e o da lista de espera não podem
                               ser embutidos numa página falsa)
   X-Content-Type-Options      o navegador não "adivinha" o tipo do
                               arquivo; vale o Content-Type enviado
   Referrer-Policy             outro site recebe só a origem, nunca o
                               caminho com utm e parâmetros
   Permissions-Policy          câmera, microfone e localização desligados:
                               o site não usa, e um script de terceiro
                               também não consegue pedir

   SEM Content-Security-Policy de bloqueio, de propósito: uma lista errada
   derruba o Google Analytics e o pixel da Meta sem aviso. Quando for a
   hora, começar por Content-Security-Policy-Report-Only com um endereço
   que receba os relatórios, olhar por alguns dias e só então aplicar.

   HSTS a Vercel já manda, e o domínio .app só abre em HTTPS por regra
   do próprio domínio.
   ===================================================================== */
/* Site de vendas em standby, a "vitrine": os mesmos cinco endereços de
   lib/mercado.ts (VENDAS_DO_MERCADO), com o idioma na frente
   (test/standby.test.js confere que as duas listas batem). */
const VITRINE = ["/vendas", "/es/vendas", "/es-es/vendas", "/pt-pt/vendas", "/mundo/vendas"];

/* Pós-pagamento: as 8 rotas de obrigado e do /baixar, em pt e em es
   (lib/obrigado.mjs, ROTAS_DO_POS_PAGAMENTO; testes/obrigado.test.mjs
   confere que as duas listas batem). Página de quem acabou de pagar não
   vai para o índice: além do <meta robots> (components/PaginaObrigado.tsx
   e BaixarApp.tsx), o cabeçalho. */
const POS_PAGAMENTO = [
  "/obrigado-aprovado",
  "/obrigado-aguardando-pagamento",
  "/obrigado-aguardando-analise",
  "/baixar",
  "/es/gracias-aprobado",
  "/es/gracias-pago-pendiente",
  "/es/gracias-en-analisis",
  "/es/descargar",
];

const CABECALHOS_DE_PROTECAO = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Endereço fictício SÓ para teste (ver scripts/checar-endereco.js). O
  // `env` do Next grava o valor no servidor e no navegador no momento do
  // build; vazio, o config.ts usa ENDERECO_DA_EMPRESA.
  env: {
    DM_ENDERECO_TESTE: (process.env.DM_ENDERECO_TESTE || "").trim(),
  },
  images: {
    remotePatterns: [
      // Só a conta do Diariamente: sem isto, qualquer conta do Cloudinary podia usar o
      // otimizador de imagem da Vercel pelo nosso domínio (cota e custo).
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "/dlzrfhwin/**" },
    ],
  },
  // O `next dev` do Next 16 cria um AGENTS.md na raiz quando percebe um
  // assistente de IA rodando. Desligado: o arquivo ficava fora do git e
  // entraria no próximo `git add .` do repositório público.
  agentRules: false,
  async headers() {
    return [
      { source: "/:path*", headers: CABECALHOS_DE_PROTECAO },
      // Site de vendas em standby (a vitrine): além do <meta robots> da
      // página (lib/seo.ts, metadataDaVitrine), o cabeçalho, que vale
      // também para o que não é HTML. "/vendas/:path*" cobre ainda os
      // endereços antigos (/vendas/es...), que só redirecionam. Ligada a
      // chave de lançamento, todos eles só redirecionam para as homes.
      ...VITRINE.flatMap((base) => [
        { source: base, headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
        { source: `${base}/:path*`, headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
      ]),
      // Pós-pagamento: noindex também no cabeçalho, nas 8 rotas exatas.
      ...POS_PAGAMENTO.map((source) => ({ source, headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] })),
    ];
  },
};

/* =====================================================================
   TRAVAS DE PUBLICAÇÃO: ENDEREÇO DA EMPRESA E PREÇOS
   ---------------------------------------------------------------------
   `next build` para com uma mensagem clara enquanto:
     - ENDERECO_DA_EMPRESA, em config.ts, ainda tiver o marcador "[TROCAR"
       (scripts/checar-endereco.js);
     - config/pricing.ts não tiver o link da oferta oficial do Brasil, o
       link e a data da oferta de lançamento, ou tiver um mercado com
       venda aberta sem link; ou, em build de produção da Vercel com venda
       aberta, faltar DM_WEBHOOK_V2_OK=1 (scripts/checar-precos.js).
   Em `next dev` e `next start` só avisa no terminal, para não travar o
   trabalho local. DM_ENDERECO_TESTE libera as duas para teste e é
   recusada em produção na Vercel.

   CHAVE DE LANÇAMENTO: DM_SITE_LANCADO (config/lancamento.ts). Gravada
   aqui, a cada build, pelo `env` do Next: "1" só se a variável da Vercel
   for exatamente "1"; qualquer outra coisa é standby (vazio). Em standby,
   a trava de preços e a do webhook (DM_WEBHOOK_V2_OK) só avisam
   (scripts/checar-precos.js, emStandby); ligada, voltam a parar o build
   de produção. A trava do endereço vale nos dois estados.

   CHAVE DO ESTUDANTE: DM_ESTUDANTE_ABERTO é CALCULADA aqui, a cada
   build, a partir das variáveis da Vercel (estadoDoEstudante, em
   scripts/checar-precos.js: o modelo v2 do WhatsApp e o config do
   estudante sem erro), e gravada pelo `env` do Next no servidor e no
   navegador. Não se põe à mão: o valor da Vercel é sobrescrito. "1" diz
   que a configuração está pronta; o fluxo do link pessoal abre de fato
   quando, além dela, a fase vigente tem o código da oferta de estudante
   em config/pricing.ts, conferido NA HORA (config.ts, estudanteAberto:
   a virada de 16/11 fecha a /estudante sozinha se faltar o da fase
   nova). Fechado: home sem link para a /estudante, lista de espera no
   lugar do formulário, API em 503. Só vale "1" com a chave de lançamento
   ligada: em standby a /estudante é a da produção (app/estudante/page.tsx)
   e o fluxo novo não abre.

   FASES DO ESTUDANTE COM OFERTA: DM_ESTUDANTE_FASES, também calculada
   aqui ("lancamento,depois", só as fases com código em
   config/pricing.ts). É SÓ O NOME da fase: o código da oferta (o off=)
   nunca vai ao navegador, senão qualquer visitante o acharia no
   JavaScript da home e pagaria o preço de estudante sem passar pela
   /estudante. O `npm run build` confere isso depois do next build
   (scripts/conferir-bundle.js).

   E-MAIL DO ESTUDANTE: DM_ESTUDANTE_EMAIL, também calculada aqui: "1"
   com RESEND_API_KEY na Vercel (e a chave de lançamento ligada), para a
   /estudante dizer que o link vai também por e-mail. Só o sinal vai ao
   navegador; a chave em si fica no servidor (lib/estudante.js).

   CHECKOUT DA VITRINE: os botões do site de vendas em standby (/vendas,
   /es/vendas, /es-es/vendas, /pt-pt/vendas, /mundo/vendas) abrem o
   checkout de verdade da Hotmart, sem depender de variável nenhuma.
   Decisão do dono, 27/10/2026: "Já pode colocar o link do checkout.
   Quero testar a jornada inteira." Até então a DM_VENDA_LIBERADA,
   calculada aqui, segurava esses botões no bloco de preço até
   DM_WEBHOOK_V2_OK=1; saiu. A trava do LANÇAMENTO não mudou: com
   DM_SITE_LANCADO=1, o build de produção continua exigindo
   DM_WEBHOOK_V2_OK=1 (scripts/checar-precos.js). Contexto em
   docs/LANCAMENTO.md.
   ===================================================================== */
const { PHASE_PRODUCTION_BUILD } = require("next/constants");
const { checarEnderecoDoProjeto } = require("./scripts/checar-endereco");
const { checarPrecosDoProjeto, estudanteDoProjeto, siteLancado } = require("./scripts/checar-precos");

module.exports = (phase) => {
  const travas = [
    ["Endereço da empresa pendente em config.ts (ENDERECO_DA_EMPRESA).", checarEnderecoDoProjeto(process.env)],
    ["Preço ou checkout pendente em config/pricing.ts, ou confirmação do webhook (DM_WEBHOOK_V2_OK) pendente na Vercel.", checarPrecosDoProjeto(process.env)],
  ];
  // As duas travas falam antes de parar: quem lê o log vê tudo o que
  // falta de uma vez, não uma pendência por build.
  const bloqueios = [];
  for (const [erro, r] of travas) {
    if (!r.ok) {
      if (phase === PHASE_PRODUCTION_BUILD) {
        console.error("\n[diariamente] BUILD BLOQUEADO: " + r.mensagem + "\n");
        bloqueios.push(erro);
      } else {
        console.warn("\n[diariamente] Aviso: " + r.mensagem + "\n");
      }
    } else if (r.teste || r.mensagem) {
      console.warn("\n[diariamente] Aviso: " + r.mensagem + "\n");
    }
  }
  if (bloqueios.length) throw new Error(bloqueios.join(" "));
  const estudante = estudanteDoProjeto(process.env);
  const lancado = siteLancado(process.env);
  return {
    ...nextConfig,
    env: {
      ...nextConfig.env,
      DM_ESTUDANTE_ABERTO: lancado && estudante.configurado ? "1" : "",
      DM_ESTUDANTE_FASES: lancado && estudante.configurado ? (estudante.fases || []).join(",") : "",
      DM_ESTUDANTE_EMAIL: lancado && String(process.env.RESEND_API_KEY || "").trim() ? "1" : "",
      DM_SITE_LANCADO: lancado ? "1" : "",
    },
  };
};
