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
    return [{ source: "/:path*", headers: CABECALHOS_DE_PROTECAO }];
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

   CHAVE DO ESTUDANTE: DM_ESTUDANTE_ABERTO é CALCULADA aqui, a cada
   build, a partir das variáveis da Vercel (estadoDoEstudante, em
   scripts/checar-precos.js), e gravada pelo `env` do Next no servidor e
   no navegador. Não se põe à mão: o valor da Vercel é sobrescrito. "1"
   abre o fluxo do cupom pessoal; vazio o fecha (home sem link para a
   /estudante, lista de espera no lugar do formulário, API em 503).
   ===================================================================== */
const { PHASE_PRODUCTION_BUILD } = require("next/constants");
const { checarEnderecoDoProjeto } = require("./scripts/checar-endereco");
const { checarPrecosDoProjeto, estudanteDoProjeto } = require("./scripts/checar-precos");

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
  return { ...nextConfig, env: { ...nextConfig.env, DM_ESTUDANTE_ABERTO: estudante.aberto ? "1" : "" } };
};
