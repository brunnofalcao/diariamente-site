# Diariamente · versão auditada para publicação

> **Lançamento do Brasil e mercados (out/2026, branch `claude/site-lancamento`).**
> O que vale é esta caixa; o resto do arquivo é o histórico das entregas
> anteriores (inclusive a auditoria do dono, que descrevia o site oculto).
>
> | URL | Mostra |
> | --- | --- |
> | `/` (país BR) | **site de vendas**, plano BRL do produto 7448309 |
> | `/` (fora de BR, PT, ES e América Latina) | a mesma página, reescrita para `/mundo`, com o bloco em dólar (US$ 24,99); o build de produção trava até o `CHECKOUT_USD` existir |
> | `/pt-pt` | página de vendas em pt-PT, lista de espera no bloco até o plano EUR existir |
> | `/es` e `/es-es` | lista de espera em espanhol (página inteira) até o plano e o acervo em espanhol |
> | `/pt-pt/embreve`, `/es-es/embreve` | **prévias do dono** (noindex, fora do sitemap, abrem de qualquer país): página de vendas de Portugal e da Espanha com o bloco de 29,99 €, botão desabilitado enquanto a venda do mercado estiver fechada |
> | `/embreve`, `/es/embreve` | redirecionam para `/` e `/es`, com utm |
>
> **QUADRO DE GO-LIVE · pendências do dono, nesta ordem.** O build de
> produção trava sozinho nos itens marcados com (trava); os outros só
> aparecem como aviso no log do build, então confira um a um.
>
> 1. **Plano BRL** no produto 7448309 (R$ 149,90): o link vai em
>    `CHECKOUT_BRL`, em `config/pricing.ts`, sem cupom no link. (trava)
> 2. **Cupom de lançamento** de 20%, restrito ao plano BRL: o código vai
>    em `CUPOM_LANCAMENTO`, escrito igual ao cadastro. (trava) Na
>    Hotmart, deixe a validade do cupom até pelo menos **02:00 do dia
>    seguinte** ao `FIM_DO_LANCAMENTO`: a home fica em cache por até uma
>    hora e quem abriu o checkout perto da meia-noite ainda paga.
> 3. **Último dia do lançamento** em `FIM_DO_LANCAMENTO` (AAAA-MM-DD,
>    horário de Brasília; data que não existe, como 2026-11-31, trava). (trava)
> 4. **Ligar o cupom na página.** Preenchidos os três, a página continua em
>    R$ 149,90 (`ativo: false` no mercado br, como o dono deixou). O build
>    mostra no aviso o link exato com `offDiscount`: abra, confira
>    **R$ 119,92** no checkout e só então vire `ativo: true`.
> 5. **Resto do mundo (rw)** abre junto com o Brasil (handoff, seção 13,
>    passo 6): o link do plano USD vai em `CHECKOUT_USD`. (trava) Para
>    lançar só o Brasil, vire rw para `vendaAberta: false`; todo build
>    lista os mercados em lista de espera, para a decisão ficar à vista.
> 6. **Estudante, antes de divulgar a /estudante** (ela anuncia R$ 89,94
>    com `ESTUDANTE.mostrarPreco: true`):
>    - trocar a base do botão do template `diariamente_estudante_aprovado`
>      de `https://pay.hotmart.com/L107085210M?checkoutMode=10&offDiscount={{1}}`
>      (produto 8280315, R$ 137,90, checkout fechado com o erro 049) para
>      `https://diariamente.app/estudante/ativar?cupom={{1}}` e reaprovar
>      na Meta (a rota monta o link a partir do `CHECKOUT_BRL`);
>    - na Vercel, `HOTMART_PRODUCT_ID=7448309` e, em `HOTMART_OFFER_IDS`,
>      o id NUMÉRICO da oferta do plano BRL novo (o código `off` não serve);
>    - feito isso, `DM_TEMPLATE_ESTUDANTE_OK=1` na Vercel cala o aviso.
> 7. **Endereço da empresa** em `ENDERECO_DA_EMPRESA`, no `config.ts`. (trava)
> 8. **Antes de abrir Portugal e Espanha:** revisar `/pt-pt/embreve` e
>    `/es-es/embreve`, e então `vendaAberta: true` em pt ou es com o
>    `CHECKOUT_EUR` (trava). O pagamento em espanhol ainda diz "reales
>    brasileños (BRL)" em `/es/condicionesdeuso` (seção 4): revisar antes
>    de abrir la ou es.
>
> - **Preços:** fonte única em `config/pricing.ts`, por mercado (moeda,
>   preço anual, formato, link, textos do bloco, cupom de lançamento).
>   Nenhum componente escreve preço. `vendaAberta` liga cada mercado.
> - **Trava de preços:** `npm run build` falha enquanto faltar o link do
>   plano BRL (`CHECKOUT_BRL`), o código do cupom (`CUPOM_LANCAMENTO`) ou a
>   data de término (`FIM_DO_LANCAMENTO`), ou houver mercado com venda
>   aberta sem link (`scripts/checar-precos.js`). Passado o último dia do
>   lançamento, a página volta sozinha a R$ 149,90 e o link perde o cupom:
>   as homes se refazem a cada hora e, enquanto isso, o navegador confere
>   de novo depois de carregar (e troca na virada da meia-noite com a
>   página aberta). Um HTML antigo em cache ainda pode mostrar o preço de
>   lançamento por até uma hora para quem estiver sem JavaScript; daí a
>   folga de validade do cupom no item 2 do quadro.
> - **Roteamento por país:** `middleware.ts` + `lib/mercado.ts` (lista da
>   América Latina num só lugar). Só as homes decidem; robô nunca é
>   redirecionado (navegador interno do LinkedIn, Pinterest, Telegram,
>   DuckDuckGo e Instagram é gente, e segue o país); `?mercado=` do
>   seletor do rodapé grava `dm_market` por 180 dias e vence o país; sem
>   país, o idioma do navegador decide. hreflang das homes: pt-BR, pt-PT,
>   es-ES, es-419, es e x-default.
> - **Lista de espera:** grava mercado, idioma e país quando as colunas
>   existirem; sem elas, grava sem, sem perder o lead.
> - **Endereço da empresa:** fica só em `ENDERECO_DA_EMPRESA`, no
>   `config.ts`. Enquanto ele tiver `[TROCAR` em qualquer parte, o build
>   falha de propósito. Para testar o build sem os dados reais:
>   `DM_ENDERECO_TESTE="Rua de Teste, 123" npm run build` (libera as duas
>   travas; recusado em produção na Vercel). `npm test` roda os testes.
> - **Cookies:** aviso com Aceitar e Recusar (`components/Consentimento.tsx`).
>   GA4, Pixel da Meta, InitiateCheckout e Purchase só depois do Aceitar.
>   A Política (seção 8, pt e es) lista `dm_cookies` e `dm_market`.
> - **Para voltar à lista de espera:** Vercel, Deployments, deploy anterior,
>   Instant Rollback (ou reverter os commits da virada).

18 arquivos. `tsc` limpo, `next build` com **34 rotas**.
Substitui os pacotes de mercados e de pt-PT: contém os dois.

Links de compra continuam inativos, conforme pedido. O botão fica
desabilitado com aviso em âmbar enquanto `config/pricing.ts` tiver
`[PREENCHER]`.

---

## O QUE FOI MEDIDO

Auditoria rodada contra o HTML gerado das 16 rotas públicas, não contra
o código. Cada número abaixo saiu de uma verificação, não de estimativa.

### Resultado final

| Verificação | 16 rotas |
| --- | --- |
| Exatamente um `<h1>` | 16/16 |
| Landmark `<main>` | 16/16 |
| Canonical próprio | 16/16 |
| OpenGraph completo | 16/16 |
| JSON-LD válido | 16/16 |
| Imagens com `alt` | 100% |
| Saltos de nível de heading | nenhum |
| IDs duplicados | nenhum |
| Meta description entre 50 e 165 car. | 16/16 |

### Contraste WCAG, medido sobre S0 `#0A0E0E`

| Token | Contraste | |
| --- | --- | --- |
| N200 texto corpo | 12,70:1 | ok |
| N300 | 8,98:1 | ok |
| N400 | 6,23:1 | ok |
| Teal P500 | 8,42:1 | ok |
| Dourado A500 | 10,81:1 | ok |
| Botão N900 sobre teal | 7,72:1 | ok |

Branco sobre teal daria 2,31:1, e é por isso que o brandbook o proíbe.

---

## OS SEIS PROBLEMAS CORRIGIDOS

### 1 · FAQPage declarado DUAS vezes · dados estruturados

Grave e invisível. Ao mover o FAQ do layout para a página, eu não vi que
o componente **já tinha** um `faqSchema` próprio. O HTML saía com dois
`FAQPage`, o que o Google trata como marcação inválida e pode levar a
perder o rich result da página inteira.

Removido o meu. O que ficou passou a declarar `inLanguage` com o locale
do mercado: sem isso, o mesmo FAQ em quatro idiomas parece conteúdo
repetido.

### 2 · A página não tinha `<main>`

Zero landmarks de conteúdo. Leitor de tela não oferece "pular para o
conteúdo principal", e é falha em qualquer ferramenta de auditoria.
Agora existe `<main id="conteudo">` nas 16 rotas.

### 3 · Sem link de pular navegação

Quem navega por teclado atravessava a navegação inteira a cada visita.
Entrou um skip link como primeiro elemento focável, invisível até
receber foco.

### 4 · Fontes bloqueando a renderização

O `<link rel="stylesheet">` para o Google Fonts é recurso bloqueante: o
navegador não pinta nada até baixá-lo. Em conexão lenta vai direto para
o LCP.

Agora a folha é pedida como `media="print"`, que o navegador não trata
como bloqueante, e é promovida a `all` ao carregar. `<noscript>` cobre
quem está sem JavaScript.

**Nota honesta:** o certo seria `next/font/google`, que baixa as fontes
no build e as serve do próprio domínio, eliminando as duas conexões
externas. Eu escrevi, mas **o build falhou aqui**: o ambiente onde
compilo não tem acesso de rede ao Google Fonts. Revertí em vez de
entregar sem validar. Na Vercel funciona, e está anotado no topo do
`layout.tsx` para quem puder buildar.

### 5 · 97 regras de CSS mortas

88 classes definidas e nunca usadas, restos dos componentes
substituídos (`est-*`, `cart-*`, `preco-*`, `autor-*`, `manifesto-*`,
`junto-*`, `ativ-*`).

```
globals.css   75,6 kB  ->  62,4 kB   (17,5% menor)
CSS servido   76,8 kB  ->  67,0 kB
```

A poda só removeu regras em que **todos** os seletores eram de classe e
**todas** estavam ausentes do código. Conferi depois que 14 classes
críticas continuam no CSS servido.

### 6 · Meta descriptions curtas nas páginas legais

Entre 24 e 34 caracteres, curtas demais para o Google montar snippet.
As quatro foram reescritas para 146 a 149 caracteres, dizendo o que a
página realmente cobre.

---

## O QUE FICA REGISTRADO, E NÃO FOI MEXIDO

### `<html lang="pt-BR">` em todas as rotas

Inclusive `/es` e `/es-es`. Página espanhola declarando português é
sinal errado para leitor de tela e para o buscador.

Existe uma correção no cliente (`useEffect` ajusta o `lang` após a
hidratação), que resolve para quem usa a página, mas **não para o
crawler**, que lê o HTML do servidor.

A solução correta no App Router é **route groups com layouts raiz
separados** (`app/(pt)/layout.tsx` e `app/(es)/layout.tsx`). Isso move
todas as pastas de rota e tem risco real de quebrar. Não fiz numa
entrega cujo objetivo é publicar. O `hreflang` está correto nas quatro
homes, que é o sinal que o Google de fato usa para servir a versão
certa por país.

### Página de vendas inteira como componente de cliente

`Home.tsx` é `"use client"`, então 108 kB de JS chegam ao navegador
numa página que é quase toda estática. Transformá-la em componente de
servidor com ilhas de cliente (o seletor, o sticky, o typewriter)
economizaria algo em torno de 20 kB. É refatoração grande, não ajuste
de auditoria.

### Seis "você" em `/pt-pt`

Todos na mesma frase, vinda da descrição do schema global
(`SITE.descricao` em `app/layout.tsx`). Não é texto visível. Resolve
junto com o `SoftwareApplication` schema, que tem o mesmo problema de
ser global e em pt-BR.

### Nove strings mortas no dicionário

`prCond`, `prName`, `prSave`, `prTerms`, `prDay`, `prNote`, `prT1` a
`prT3` ficaram órfãs quando o card de preço virou componente. Contêm
valores velhos (R$ 59,10, 12x de R$ 14,26, R$ 0,38). Não renderizam,
mas confundem quem for mexer.

---

## ESTADO DAS ROTAS

| Rota | Mostra | Robots |
| --- | --- | --- |
| `/` · `/es` · `/pt-pt` · `/es-es` | lista de espera | indexa |
| `/embreve` | vendas · R$ 149,90 | noindex |
| `/es/embreve` | vendas · US$ 24.99 | noindex |
| `/pt-pt/embreve` | vendas · 29,99 € | noindex |
| `/es-es/embreve` | vendas · 29,99 € | noindex |

Site continua oculto. Sitemap com 14 URLs, nenhuma de venda.

---

## PESO

```
JS compartilhado        87,2 kB
Lista de espera         91,6 kB First Load
Página de vendas         108 kB First Load
CSS                     67,0 kB  (era 76,8)
Imagens                 f_auto, q_auto, srcset de 3 larguras
```

---

## CONFERIR DEPOIS DE SUBIR

1. `diariamente.app/pt-pt` mostra lista de espera, não preço.
2. Tab no teclado, logo ao abrir: aparece "Saltar para o conteúdo".
3. Rich Results Test do Google em `/embreve`: **um** FAQPage, não dois.
4. Lighthouse em `/embreve`: acessibilidade deve passar de 95.
5. Nenhuma rota mostra moeda de outro mercado.
