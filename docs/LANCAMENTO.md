# Lançamento do site: standby e a chave

Decisão do dono (27/10/2026): "Deixe o site de vendas em standby. Considere
para nossa visualização www.diariamente.app/vendas e assim iremos ver o site
que irá ao ar quando lançarmos."

## A chave: `DM_SITE_LANCADO`

Uma variável só decide se o site de vendas está no ar.

- **Desligada (padrão, hoje): STANDBY.** Sem a variável, ou com qualquer
  valor que não seja `1`.
- **Ligada: LANÇAMENTO.** `DM_SITE_LANCADO=1` nas variáveis de Production da
  Vercel **e um novo deploy**.

O valor é gravado no build (`next.config.js`, campo `env`) e lido por
`config/lancamento.ts` (`SITE_LANCADO`), que o middleware, as homes, o SEO e
as páginas de `/vendas` usam. Trocar a variável na Vercel sem um novo deploy
não muda nada.

## O que cada rota mostra

| Rota | Standby (hoje) | Ligada (lançamento, PR #3) |
| --- | --- | --- |
| `/` | lista de espera ("Em breve"), indexável | site de vendas do Brasil |
| `/es`, `/es-es` | lista de espera em espanhol | lista de espera (la e es fechados) |
| `/pt-pt` | lista de espera | site de vendas de Portugal, lista de espera no bloco |
| `/` para quem é de fora (rw) | fica na `/` (lista de espera), sem reescrita | reescrita para `/mundo`, bloco em dólar |
| `/mundo` direto | 404, como antes | redireciona para `/` |
| país do IP nas homes | cada país vai para a sua home, como hoje | igual |
| `/vendas` | **site de vendas do Brasil, como vai ao ar** | redireciona para `/` |
| `/vendas/es` | o que `/es` vai mostrar (América Latina) | redireciona para `/es` |
| `/vendas/es-es` | o que `/es-es` vai mostrar (Espanha) | redireciona para `/es-es` |
| `/vendas/pt-pt` | o que `/pt-pt` vai mostrar (Portugal) | redireciona para `/pt-pt` |
| `/vendas/mundo` | o que a `/` vai mostrar fora de BR, PT, ES e América Latina | redireciona para `/` |
| `/embreve`, `/es/embreve` | levam a `/vendas` e `/vendas/es` | levam a `/` e `/es` |
| `/pt-pt/embreve`, `/es-es/embreve` | levam a `/vendas/pt-pt` e `/vendas/es-es` | prévias do dono (29,99 €), noindex |
| obrigado, legais, sobre, estudante | iguais nos dois estados | iguais |

`/vendas/*` em standby:

- é a mesma página do lançamento (`components/PaginaDoMercado.tsx` com
  `vitrine`): mesmos componentes, preço, oferta e botões de
  `config/pricing.ts`;
- `noindex, nofollow` na página (`metadataDaVitrine`, em `lib/seo.ts`) e no
  cabeçalho `X-Robots-Tag` (`next.config.js`), canonical para si mesma, sem
  hreflang e fora do `sitemap.xml`. Nenhuma página pública aponta para
  `/vendas`;
- os links entre mercados (PT | ES, seletor de país, logo da lista de
  espera) ficam dentro de `/vendas` (`lib/mercado.ts`, `VENDAS_DO_MERCADO`);
- **o botão abre o checkout de verdade da Hotmart.** Quem pagar por ali
  antes do passo 1 abaixo fica sem conta no app. Use `/vendas` para ver, não
  para pagar. O formulário da lista de espera de `/vendas` grava contatos de
  verdade.

## A trava do build

`scripts/checar-precos.js` (`checarPrecos`) trava o build de produção quando
falta ou está errado algum link ou data de `config/pricing.ts` e, no build de
produção da Vercel com algum mercado vendendo, quando falta
`DM_WEBHOOK_V2_OK=1` (a ordem do dono: o site só vende depois de o webhook do
produto 7448309 estar no app).

Com o site em standby essa trava não pode impedir o deploy. Por isso:

- `checarPrecos`, a regra, não mudou;
- `checarPrecosDoProjeto`, que o `next.config.js` chama, passa o resultado
  por `emStandby` quando a chave está desligada: o build segue e o log
  mostra "Site em STANDBY" e, se for o caso, "Ao ligar a chave, o build de
  produção TRAVARIA por isto: ...", com a mesma explicação de sempre;
- com a chave ligada, o resultado volta a ser o da regra: sem
  `DM_WEBHOOK_V2_OK=1`, o build de produção falha e o deploy anterior
  (standby) continua no ar;
- a trava do endereço (`scripts/checar-endereco.js`) vale nos dois estados.

## Para lançar, nesta ordem

1. **App.** Webhook do produto 7448309 reconfigurado para o app e
   `HOTMART_WEBHOOK_V2` na posição 1 no Railway (passo (a) do LEIA-ME). Feito
   isso: Vercel, Production, `DM_WEBHOOK_V2_OK=1`.
2. **Conferir `/vendas`** com as pendências da lista abaixo resolvidas.
3. **Vercel, Production: `DM_SITE_LANCADO=1`** e um novo deploy (Redeploy do
   último deploy de produção). Se a trava parar o build, o log diz o que
   falta e o standby continua no ar.
4. **Conferir:** `/` mostra o site de vendas; `/vendas` redireciona para `/`;
   `/pt-pt` mostra a página de Portugal; o log do build não diz "STANDBY".

**Voltar ao standby:** tirar `DM_SITE_LANCADO` (ou pôr `0`) e fazer um novo
deploy, ou Instant Rollback para o deploy anterior.

## Pendências para vender

- Datas: `FIM_DO_LANCAMENTO = "2026-11-16"` (`config/pricing.ts:55`). Se o
  lançamento passar dessa data, a página mostra R$ 149,90 e o botão abre a
  oferta oficial; decidir a data nova antes de ligar a chave.
- Links de checkout: `CHECKOUT_BRL` e `CHECKOUT_LANCAMENTO`
  (`config/pricing.ts:53-54`) abertos e conferidos no checkout (R$ 149,90 e
  R$ 99,98); os dos mercados de fora (`config/pricing.ts:60-62`) só quando
  abrirem.
- Preços: `config/pricing.ts:181` (R$ 149,90), `:183` (R$ 99,98, 3 anos),
  `:76` (estudante, R$ 89,90).
- Mercados: só o Brasil vende (`vendaAberta: true`, `config/pricing.ts:201`);
  la, es, pt e rw fechados (`:253`, `:293`, `:332`, `:375`).
- Cupom do estudante: `STUDENT_DISCOUNT=0.40027`, `HOTMART_PRODUCT_ID=7448309`,
  `WA_TEMPLATE_ESTUDANTE` (modelo v2) e `HOTMART_OFFER_IDS` na Vercel
  (`config/pricing.ts:586`, LEIA-ME item 1). Desativar a oferta `h82bllbx`
  na Hotmart.
- Variáveis na Vercel (Production): `DM_WEBHOOK_V2_OK=1` (passo 1),
  `DM_SITE_LANCADO=1` (passo 3), `HOTMART_HOTTOK` e o webhook do site
  (`https://www.diariamente.app/api/webhooks/hotmart`) cadastrado no 7448309.
- Espanhol: links da App Store e da Google Play ainda em pt
  (`lib/i18n.ts:298-299`) e badge da Google Play em pt (`lib/i18n.ts:294`),
  antes de abrir la ou es.
