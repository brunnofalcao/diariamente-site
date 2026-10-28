# Estudante: link pessoal e oferta por fase

Decisão do dono, 28/10/2026. Vale com a chave de lançamento ligada
(`DM_SITE_LANCADO=1`). Em standby, a `/estudante` continua a da produção
(R$ 77,00, cupom da main) e nada daqui se aplica.

## Por que mudou

A API de cupons da Hotmart (`POST /products/api/v1/product/:id/coupon`)
não aceita produto de assinatura ("does not support subscription
products", na documentação oficial), e o produto 7448309 é assinatura.
O fluxo antigo criava um cupom pessoal por essa API e nunca funcionou no
7448309: quem pedia via "Não foi possível gerar seu código agora". Os 4
cupons em `cupons_estudante` são de agosto, do produto antigo.

## Como funciona agora

1. A pessoa pede na `/estudante`. Estudante de **qualquer curso**; a
   aprovação é automática ao declarar o vínculo. Um CPF, um pedido.
2. `/api/estudante/solicitar` valida, grava o lead e gera um **token
   pessoal** (`DIARIAEST` + 14 letras e números, aleatório) em
   `cupons_estudante.codigo`, com `status = 'ativo'` e **sem**
   `hotmart_coupon_id`. Nenhum cupom na Hotmart. Nada de migração: a
   coluna `desconto` recebe só o desconto equivalente da fase sobre
   R$ 149,90 (0.6004 ou 0.46698), informativo; `expira_em` é o prazo
   para o cron mandar o WhatsApp (30 dias), não a validade do link.
3. O cron (`/api/cron/manutencao`) manda o WhatsApp com o modelo
   `diariamente_estudante_aprovado_v2` (Utilidade, aprovado; **não
   muda**): botão "Concluir inscrição" ->
   `https://www.diariamente.app/estudante/ativar?cupom={{1}}`, com o token
   no `{{1}}`.
4. `/estudante/ativar?cupom=TOKEN`: token conhecido -> **302** para
   `https://pay.hotmart.com/K105072021O?off=<oferta da fase>&sck=TOKEN`;
   token desconhecido, revogado (`status` `revogado` ou `cancelado`, à
   mão), ou fase sem oferta -> `/estudante`. A fase é a **do clique**:
   quem foi aprovado no lançamento e abre o link depois de 16/11 vai para
   a oferta de R$ 79,90 (por isso o texto do lançamento diz "para quem
   assinar até 16 de novembro"). O link não vence.
5. O webhook do site (`/api/webhooks/hotmart`), na venda aprovada de uma
   oferta de estudante, marca o link como usado (`status = 'usado'`,
   `usado_em`, `transacao_hotmart`): pelo token que volta no `sck`
   (`data.purchase.origin.sck`) ou, sem ele, pelo e-mail do comprador
   igual ao do pedido. Não chama a API de cupom. Venda de oferta de
   estudante sem pedido fica em `log_estudante` como
   `venda_estudante_sem_link` (só transação e oferta).

O `sck` leva só o token aleatório, nunca dado da pessoa. Se o primeiro
webhook real não trouxer o `sck`, nada quebra: o e-mail cobre.

## Preço em duas fases

A mesma virada do card do Brasil (`FIM_DO_LANCAMENTO = "2026-11-16"`,
horário de Brasília, e o `ativo` do lançamento, em `config/pricing.ts`):

| Fase | Até | Preço | Constante |
| --- | --- | --- | --- |
| Lançamento | 16/11/2026, 23:59 | R$ 59,90 por ano nos 3 primeiros anos; depois, R$ 149,90 por ano | `ESTUDANTE_OFERTA_LANCAMENTO` |
| Depois | a partir de 17/11/2026, 00:00 | R$ 79,90 por ano nos 3 primeiros anos; depois, R$ 149,90 por ano | `ESTUDANTE_OFERTA` |

Os textos saem de `regraDoEstudante` (`config/pricing.ts`): "R$ 59,90 por
ano nos 3 primeiros anos, para quem assinar até 16 de novembro. Depois,
R$ 149,90 por ano." e "R$ 79,90 por ano nos 3 primeiros anos. Depois,
R$ 149,90 por ano.", com "à vista, ou em até 12x no cartão com
acréscimo". A home ("Sou estudante" e o card "Condição de estudante"), a
`/estudante` (card, comparativo, FAQ e resumo), a `/es/estudiantes` e o
e-mail escolhem a fase na hora.

## Passo a passo do dono

### 1. Na Hotmart: os dois cupons e as duas ofertas

Para cada fase, no produto 7448309:

1. Crie o cupom de assinatura: **Valor final** (R$ 59,90 no lançamento,
   R$ 79,90 depois), **Apenas nas três primeiras recorrências**, só no
   plano **Anual**, parcelamento permitido com acréscimo.
2. Crie a oferta com esse cupom (como a `lf63bgdd` do lançamento, que é
   o cupom "lancamento").
3. Abra o link da oferta e confira no checkout: o preço da fase à vista,
   o seletor de parcelas (a página diz "em até 12x no cartão com
   acréscimo"; se a oferta parcelar menos, avise o DEV) e, na descrição,
   o desconto só nas 3 primeiras recorrências.
4. Copie o **código da oferta**: o valor do `off=` no link (8 letras e
   números). Só o código, sem o endereço.

### 2. No site: os códigos em `config/pricing.ts`

```ts
export const ESTUDANTE_OFERTA_LANCAMENTO = "xxxxxxxx"; // R$ 59,90 (até 16/11/2026)
export const ESTUDANTE_OFERTA = "yyyyyyyy"; // R$ 79,90 (a partir de 17/11/2026)
```

Commit e novo deploy. A trava do build (`scripts/checar-precos.js`):

- **trava** o build de produção se um código não tiver o formato da
  Hotmart, se for a oferta de um link de venda (`fhrttdh8`, `lf63bgdd`,
  mercados de fora) ou se as duas fases tiverem o mesmo código;
- **fecha** a `/estudante` (sem travar) se faltar o código da fase
  vigente, e diz qual no log ("Estudante FECHADO ... Para abrir: ...");
- **avisa** no lançamento se faltar o `ESTUDANTE_OFERTA`: em 17/11 a
  `/estudante` fecharia sozinha (lista de espera, API em 503, home sem o
  card, `/estudante/ativar` de volta para a `/estudante`).

Fechada, nenhum CPF fica preso: a API responde 503 antes de ler o pedido.

### 3. Na Vercel (Production)

- `WA_TEMPLATE_ESTUDANTE=diariamente_estudante_aprovado_v2` (já está).
  Sem ele, o fluxo fica fechado.
- `STUDENT_DISCOUNT`, `HOTMART_OFFER_IDS` e `HOTMART_PRODUCT_ID` **não
  contam mais** para abrir o estudante. Só o standby (o cupom da main)
  ainda lê `STUDENT_DISCOUNT`.
- **`RESEND_API_KEY` (opcional).** Com ela, o site manda o e-mail de
  aprovação pelo Resend, na hora do pedido: remetente
  `Diariamente App <acesso@diariamente.app>`, responder para
  `suporte@scienceplay.com`, em português, com o botão "Concluir
  inscrição" para o link pessoal e o preço da fase do momento. Sem ela,
  só o RD, como hoje. Antes de pôr a chave:
  - o domínio `diariamente.app` verificado no Resend (o mesmo do
    remetente);
  - **click tracking desligado** no domínio, no Resend (é por domínio,
    não por e-mail): com ele ligado, o botão passaria por um
    redirecionamento do Resend antes do link pessoal;
  - desligue o e-mail de aprovação da automação do RD, se ele existir,
    para a pessoa não receber dois (decisão do dono: todo e-mail
    automático vai para o Resend).
  A `/estudante` só diz "e para o seu e-mail" com a chave na Vercel
  (`DM_ESTUDANTE_EMAIL`, calculada no build).
- Novo deploy depois de mudar variável.

### 4. No RD Station: o campo do link

O site manda a conversão do estudante (`RD_CONVERSION_IDENTIFIER`, padrão
`diariamente-estudante`) com o link pessoal em **`cf_link_estudante`**.
Crie o campo em Configurações, Campos personalizados: texto de uma
linha, identificador `cf_link_estudante`. A automação do RD pode usá-lo no
botão do e-mail. Se o campo não existir e o RD recusar a conversão, o
site manda de novo sem ele (o lead chega como antes) e o log da Vercel
avisa "[rd] conversao recusada com cf_link_estudante".

### 5. Na Hotmart: o webhook do site

`https://www.diariamente.app/api/webhooks/hotmart` (com www) cadastrado
no 7448309, evento de compra aprovada, hottok em `HOTMART_HOTTOK`. É ele
que marca o link como usado. Na primeira venda real, confira no histórico
do webhook se o `sck` veio em `data.purchase.origin.sck`.

### 6. Fim do lançamento

Nada a fazer no site (a virada é automática). Na Hotmart, mantenha a
oferta de estudante do lançamento ativa até 02:00 de 17/11 e depois
desative-a: o link dela é aberto, e quem o guardou pagaria R$ 59,90. O
log do build lembra.

## O que fica à vista do dono

- `log_estudante`: `link_emitido` (fase, preço, oferta), `link_aberto`
  (cada clique, com a fase e a oferta da hora), `email_enviado` /
  `email_falhou`, `link_usado` (via `rastreio` ou `email`),
  `venda_estudante_sem_link`.
- O link da oferta de estudante é aberto: quem tiver o endereço da
  Hotmart paga o preço de estudante sem passar pela `/estudante`. O token
  só liga o pedido à venda; a `venda_estudante_sem_link` mostra quando
  isso acontece.
