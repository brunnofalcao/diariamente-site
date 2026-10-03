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
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
  async headers() {
    return [{ source: "/:path*", headers: CABECALHOS_DE_PROTECAO }];
  },
};

module.exports = nextConfig;
