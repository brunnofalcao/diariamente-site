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
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
  async headers() {
    return [{ source: "/:path*", headers: CABECALHOS_DE_PROTECAO }];
  },
};

/* =====================================================================
   TRAVA DE PUBLICAÇÃO: ENDEREÇO DA EMPRESA
   ---------------------------------------------------------------------
   `next build` para com uma mensagem clara enquanto ENDERECO_DA_EMPRESA,
   em config.ts, ainda tiver o marcador "[TROCAR". Em `next dev` e
   `next start` só avisa no terminal, para não travar o trabalho local.
   Detalhes e teste em scripts/checar-endereco.js.
   ===================================================================== */
const { PHASE_PRODUCTION_BUILD } = require("next/constants");
const { checarEnderecoDoProjeto } = require("./scripts/checar-endereco");

module.exports = (phase) => {
  const r = checarEnderecoDoProjeto(process.env);
  if (!r.ok) {
    if (phase === PHASE_PRODUCTION_BUILD) {
      console.error("\n[diariamente] BUILD BLOQUEADO: " + r.mensagem + "\n");
      throw new Error("Endereço da empresa pendente em config.ts (ENDERECO_DA_EMPRESA).");
    }
    console.warn("\n[diariamente] Aviso: " + r.mensagem + "\n");
  } else if (r.teste) {
    console.warn("\n[diariamente] Aviso: " + r.mensagem + "\n");
  }
  return nextConfig;
};
