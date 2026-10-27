# Lançamento do site: standby e a chave

Decisão do dono (27/10/2026): "Deixe o site de vendas em standby. Considere
para nossa visualização www.diariamente.app/vendas e assim iremos ver o site
que irá ao ar quando lançarmos."

Ajustes do dono no mesmo dia (27/10/2026, 09:40):

- "Eu quero acessar todas as paginas de vendas que temos." e "o correto ao
  clicar entre PT e ES seria o domínio virar www.diariamente.app/es/vendas
  ... sempre o idioma vira primeiro." A vitrine passou a ter o idioma (ou o
  mercado) na frente e mostra todos os mercados com a venda aberta.
- "Já pode colocar o link do checkout. Quero testar a jornada inteira." Os
  botões da vitrine abrem o checkout de verdade da Hotmart (seção
  "Checkout na vitrine", abaixo).
- "não está claro que custa oficialmente 149,90 e somente agora está por
  33% a menos." O bloco de oferta do Brasil mostra o preço oficial riscado
  no lançamento (seção "Preço oficial riscado", abaixo).

## A chave: `DM_SITE_LANCADO`

Uma variável só decide se o site de vendas está no ar.

- **Desligada (padrão, hoje): STANDBY.** Sem a variável, ou com qualquer
  valor que não seja `1`.
- **Ligada: LANÇAMENTO.** `DM_SITE_LANCADO=1` nas variáveis de Production da
  Vercel **e um novo deploy**.

O valor é gravado no build (`next.config.js`, campo `env`) e lido por
`config/lancamento.ts` (`SITE_LANCADO`), que o middleware, as homes, o SEO e
as páginas da vitrine usam. Trocar a variável na Vercel sem um novo deploy
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
| `/es/vendas` | **site de vendas da América Latina** (espanhol, US$), com a venda aberta | redireciona para `/es` |
| `/es-es/vendas` | **site de vendas da Espanha** (espanhol, €), com a venda aberta | redireciona para `/es-es` |
| `/pt-pt/vendas` | **site de vendas de Portugal** (pt-PT, €), com a venda aberta | redireciona para `/pt-pt` |
| `/mundo/vendas` | **site de vendas do resto do mundo** (a `/` com o bloco em US$), com a venda aberta | redireciona para `/` |
| `/vendas/es`, `/vendas/es-es`, `/vendas/pt-pt`, `/vendas/mundo` (endereços antigos) | 307 para `/es/vendas`, `/es-es/vendas`, `/pt-pt/vendas`, `/mundo/vendas`, com os parâmetros | redirecionam para a home real do mercado |
| `/embreve`, `/es/embreve` | levam a `/vendas` e `/es/vendas` | levam a `/` e `/es` |
| `/pt-pt/embreve`, `/es-es/embreve` | levam a `/pt-pt/vendas` e `/es-es/vendas` | prévias do dono (29,99 €), noindex |
| `/estudante` | **a da produção**: formulário aberto, R$ 77,00 sobre R$ 137,90 (`components/estudante-atual`); a imagem do hero já é a arte Hoje das lojas, a pedido do dono | R$ 89,90 por ano, a mesma arte das lojas; fechada sozinha até a Vercel ter as três chaves |
| `/es/estudiantes` | com o "¿Estudias en Brasil?" que leva à `/estudante` | o mesmo link, só com o estudante aberto |
| `/api/estudante/solicitar` | a da produção (sem o 503) | 503 enquanto o estudante estiver fechado |
| `/estudante/ativar` | volta sempre para `/estudante` | abre a oferta oficial com o cupom |
| `/sobre` | as linhas de preço da produção (R$ 197, R$ 137,90) | o preço de `config/pricing.ts` |
| Termos, Política, Condiciones, Privacidad | **o texto da produção** (`components/legais-da-producao`) | o texto novo do PR #3 |
| aviso de cookies, GA4 e Pixel | fora da vitrine, **como a produção**: sem aviso, medição direta; na vitrine, o aviso | o aviso em todas as páginas |
| obrigado | iguais nos dois estados (diferenças da produção atual em "O que muda para o público já no merge em standby") | iguais |

A vitrine em standby (`/vendas`, `/es/vendas`, `/es-es/vendas`,
`/pt-pt/vendas` e `/mundo/vendas`, em `lib/mercado.ts`,
`VENDAS_DO_MERCADO`):

- é a mesma página do lançamento (`components/PaginaDoMercado.tsx` com
  `vitrine`): mesmos componentes, preço, oferta e botões de
  `config/pricing.ts`;
- **todos os mercados aparecem com a venda aberta**, como vão ao ar quando
  a venda de cada um abrir: a página inteira, com o bloco de oferta de
  venda (preço na moeda do mercado e o botão). Vale também para la, es, pt
  e rw, que continuam com `vendaAberta: false` (e la e es com `semVenda:
  "pagina"`) no lançamento público: essas chaves não mudaram e seguem
  decidindo `/es`, `/es-es`, `/pt-pt` e a `/` do resto do mundo quando a
  chave de lançamento for ligada. Na vitrine não há nota "Prévia interna";
- o idioma (ou o mercado) vem primeiro no endereço, como em
  `/es/estudiantes`. Os endereços antigos (`/vendas/es`, `/vendas/es-es`,
  `/vendas/pt-pt`, `/vendas/mundo`) redirecionam (307, com os parâmetros)
  para os novos (`lib/mercado.ts`, `VITRINE_ANTIGA`);
- `noindex, nofollow` na página (`metadataDaVitrine`, em `lib/seo.ts`, com
  o título e a descrição de venda do mercado) e no cabeçalho
  `X-Robots-Tag` (`next.config.js`, lista `VITRINE`), canonical para si
  mesma, sem hreflang e fora do `sitemap.xml`. Nenhuma página pública
  aponta para a vitrine;
- os links entre mercados (PT | ES, seletor de país) ficam na vitrine:
  PT | ES em `/vendas` leva a `/es/vendas`, e em `/es/vendas` volta a
  `/vendas`;
- o `<html lang>` sai `pt-BR` do servidor em todas as rotas (é o layout
  raiz, como em `/es` hoje) e a página o troca na hidratação pelo idioma
  do mercado (`es-419` em `/es/vendas`, `es-ES` em `/es-es/vendas`,
  `pt-PT` em `/pt-pt/vendas`, `pt-BR` em `/vendas` e `/mundo/vendas`); o
  conteúdo já sai do servidor marcado com o idioma (`lang` no
  `#dm-root`);
- **os botões abrem o checkout de verdade da Hotmart** (seção abaixo);
- o card "Condição de estudante" e o "Sou estudante" só aparecem com a
  chave ligada (e as três chaves do estudante na Vercel): em standby a
  `/estudante` é a da produção, com outro preço;
- a página de cada rota é a rota irmã das homes (`app/es/vendas`,
  `app/es-es/vendas`, `app/pt-pt/vendas`, `app/mundo/vendas`). O 404 de
  `/mundo` em standby (`app/mundo/page.tsx`) vale só para `/mundo`; a
  imagem de prévia de link de `/es` (`app/es/opengraph-image.tsx`) vale
  também para `/es/vendas`.

## Checkout na vitrine

Decisão do dono, 27/10/2026: "Já pode colocar o link do checkout. Quero
testar a jornada inteira."

- Os botões da vitrine (bloco de oferta e CTA final) abrem o checkout da
  Hotmart de cada mercado, já, sem variável nenhuma: no Brasil, até
  16/11/2026, a oferta de lançamento (`off=lf63bgdd`, R$ 99,98) e, depois,
  a oficial (`off=fhrttdh8`, R$ 149,90); na América Latina e no resto do
  mundo, `off=uevhmhy2` (US$ 29,99); na Espanha, `off=iuoufnf6`; em
  Portugal, `off=3n484jbe` (29,99 €). Os links estão em
  `config/pricing.ts`.
- Saiu a `DM_VENDA_LIBERADA`, que o `next.config.js` calculava e que
  segurava esses botões no bloco de preço até `DM_WEBHOOK_V2_OK=1`.
- A trava do **lançamento** não mudou: com `DM_SITE_LANCADO=1`, o build de
  produção da Vercel continua exigindo `DM_WEBHOOK_V2_OK=1`
  (`scripts/checar-precos.js`).
- Contexto conferido em 27/10/2026: o webhook do produto 7448309 entrega
  no app desde 21/10/2026, e a rota antiga do app (posição 0) cria a conta
  de quem paga. A posição 1 (`HOTMART_WEBHOOK_V2=1` no Railway) segue
  pendente para o lançamento público (passo 1 de "Para lançar").
- Quem pagar pela vitrine paga de verdade: para testar a jornada sem
  custo, reembolse pela Hotmart depois (a garantia é de 7 dias).
- O formulário da lista de espera continua gravando contatos de verdade
  onde ainda aparece (homes públicas em standby).

## Preço oficial riscado

Pedido do dono, 27/10/2026: "O carrinho de oferta está lindo, mas não está
claro que custa oficialmente 149,90 e somente agora está por 33% a menos."

Só onde o lançamento vale (mercado br, até `FIM_DO_LANCAMENTO`, com
`ativo: true`), o card mostra:

```
Preço oficial: R$ 149,90 por ano        (riscado)
R$ 8,33 /mês no lançamento
R$ 99,98 por ano nos 3 primeiros anos, 33% a menos que o preço oficial. Depois, R$ 149,90 por ano.
Pagamento à vista
Preço de lançamento só até 16 de novembro.
```

- O selo "33% OFF" continua. O percentual sai da conta
  (`percentualDoLancamento`, arredondado para baixo), nunca escrito à mão:
  `{pct}` em `textos.lancamentoRegra` (`config/pricing.ts`).
- Barra fixa e CTA final mostram o preço oficial riscado ao lado do de
  lançamento, na mesma unidade (R$ 149,90 ao lado de R$ 99,98 por ano).
- Para leitor de tela, o valor riscado vem depois do rótulo "Preço
  oficial:" (visível no card, só para leitor de tela na barra e no CTA).
- Passado o `FIM_DO_LANCAMENTO` (ou com `ativo: false`), nada riscado: só
  o preço cheio. Mercados sem lançamento (la, es, pt, rw) não mudam.
- A `/estudante` (fluxo novo, chave ligada) mantém a regra sem o
  percentual (`regraDoLancamento` com `semPercentual`): ali as diferenças
  mostradas são as do estudante.

## O que muda para o público já no merge em standby

O standby mantém as homes, a `/estudante`, a `/sobre`, as páginas legais,
a medição (GA4 e Pixel sem aviso de cookies, fora da vitrine) e as rotas
como a produção (main) mostra hoje. Atenção: a Política publicada (seção 8)
diz que medição e publicidade só são ativadas com consentimento, dado no
aviso do primeiro acesso; a produção de hoje já não cumpre isso, e o standby
mantém como está (decisão do dono: Meta e Analytics ficam para depois). Para
ligar o aviso já no standby, tirar o ramo `comoAProducao` de
`components/Consentimento.tsx`. Depois do lançamento, apagar
`components/legais-da-producao/`.

O que ainda muda para quem visita, já no merge, com a chave desligada:

- **Fontes**: Literata e Inter passam a carregar. Na produção a folha do
  Google Fonts fica em `media="print"` e não chega à tela.
- **/estudante, imagem do hero**: a arte Hoje da App Store em português
  (`/telas/pt/hoje`, `components/TelaDaLoja.tsx`), a mesma do lançamento,
  sem moldura de celular (280 px no celular, 300 px no computador), no
  lugar do mockup Tela_HOJE do Cloudinary com a interface antiga do app.
  Pedido do dono em 27/10/2026: atualizar todas as telas do app no site.
  Texto, preço, formulário e a pílula "Sua provocação de hoje. Só a de
  hoje." seguem os da produção.
- **/estudante**, de propósito, em três pontos do texto: sem a promessa do
  preço pela graduação inteira e com "Solicitar não gera compromisso" no
  lugar da frase com a palavra vetada (decisões do dono no PR #3), e o prazo
  do código em "até 10 minutos" (a API agenda o envio para 5 minutos depois
  e o cron tenta até 5 vezes; os "2 minutos" da produção não eram verdade).
  O mesmo prazo em `/estudante/solicitacaorecebida` e, em `/es/estudiantes`,
  "llega por WhatsApp en unos minutos" no lugar de "el proceso es
  inmediato" e "el precio de entrada" no lugar de "mientras estás cursando".
- **/estudante/ativar** existe (307 para `/estudante`); na produção, 404.
- **/obrigado?lang=es** e **/em-breve** levam os parâmetros junto
  (`/obrigado-aprovado?lang=es`, utm). Na produção, `/obrigado` perde o
  `?lang=es`.
- **Lista de espera nas homes**: o logo de `/pt-pt` e de `/es-es` leva à
  própria home (na produção, a `/` e a `/es`); o WhatsApp vem com o código
  do país do mercado (+351 em `/pt-pt`, +34 em `/es-es`; na produção, +55 e
  vazio); o formulário manda mercado, idioma e origem, e o RD recebe a tag
  `mercado-xx`.
- **Busca e prévia de link**: o sitemap lista as quatro homes primeiro (as
  mesmas 12 URLs, em outra ordem), com o grupo de hreflang das quatro homes
  em cada uma; `/pt-pt` declara `og:locale` pt_PT, e `/pt-pt` e `/es-es`
  ganham `og:image`; o JSON-LD de Product e o preço do MobileApplication
  saíram do layout (a produção declara R$ 137,90 em toda página; em
  standby, nenhuma página pública declara preço). Títulos e descrições das
  quatro homes são os da produção.

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
2. **Conferir a vitrine** (`/vendas` e as dos outros mercados) com as
   pendências da lista abaixo resolvidas.
3. **Vercel, Production: `DM_SITE_LANCADO=1`** e um novo deploy (Redeploy do
   último deploy de produção). Se a trava parar o build, o log diz o que
   falta e o standby continua no ar.
4. **Conferir:** `/` mostra o site de vendas; `/vendas` redireciona para `/`
   (e `/es/vendas` para `/es`); `/pt-pt` mostra a página de Portugal, com
   a lista de espera no bloco enquanto pt estiver fechado; o log do build
   não diz "STANDBY".

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
- Mercados: no lançamento público, só o Brasil vende (`vendaAberta: true`
  em `config/pricing.ts`); la, es, pt e rw fechados (`vendaAberta: false`).
  Na vitrine todos aparecem abertos, com o checkout de cada um.
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
