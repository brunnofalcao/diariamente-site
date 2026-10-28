# Diariamente · versão auditada para publicação

> **STANDBY (27/10/2026, decisão do dono).** O site de vendas está pronto e
> desligado por uma chave: `DM_SITE_LANCADO` (`config/lancamento.ts`).
> Desligada (padrão), as homes mostram a lista de espera, como antes, e o
> site de vendas, exatamente como vai ao ar, fica na vitrine, com o idioma
> na frente: **`/vendas`** (Brasil), `/es/vendas`, `/es-es/vendas`,
> `/pt-pt/vendas` e `/mundo/vendas`, com noindex e fora do sitemap (os
> antigos `/vendas/es`... redirecionam para eles). Na vitrine todos os
> mercados aparecem com a venda aberta e os botões abrem o checkout de
> verdade da Hotmart (decisão do dono, 27/10/2026). A trava do webhook
> (`DM_WEBHOOK_V2_OK`) e a de preços só avisam enquanto a chave está
> desligada e voltam a parar o build de produção quando ela for ligada. A
> `/estudante` e a `/sobre` ficam como na produção (formulário aberto,
> R$ 77,00 sobre R$ 137,90). O que ainda muda para o público já no merge
> está em `docs/LANCAMENTO.md`. Para lançar:
> `DM_SITE_LANCADO=1` na Vercel (Production) e um novo deploy, depois do
> passo (a) abaixo. Tudo em **`docs/LANCAMENTO.md`**. A tabela e o quadro
> abaixo descrevem o site com a chave LIGADA.

> **Pós-pagamento em português e espanhol (28/10/2026).** As três URLs de
> obrigado que vão na Hotmart (sem prefixo, em pt-BR) levam quem é de
> espanhol às rotas em espanhol (`/es/gracias-aprobado`,
> `/es/gracias-pago-pendiente`, `/es/gracias-en-analisis`), com a loja
> certa pelo aparelho, o QR code no computador e o `/baixar` (e
> `/es/descargar`) que manda o celular direto para a loja. Passo a passo,
> regras e testes em **`docs/POS-PAGAMENTO.md`**.

> **Lançamento do Brasil e mercados (out/2026, branch `claude/site-lancamento`, PR #3).**
> O que vale é esta caixa; o resto do arquivo é o histórico das entregas
> anteriores (inclusive a auditoria do dono, que descrevia o site oculto).
> Decisões do dono de 12/10/2026 aplicadas: links da Hotmart, lançamento
> como oferta própria, estudante com cupom pessoal, mercados de fora
> fechados e "Diariamente App by Science Play" no que é visível.
>
> | URL | Mostra |
> | --- | --- |
> | `/` (país BR) | **site de vendas.** Até 16/11/2026, a oferta de lançamento (`off=lf63bgdd`): R$ 99,98 por ano (R$ 8,33/mês) nos 3 primeiros anos e, depois, R$ 149,90 por ano, só à vista. A partir de 17/11, a oferta oficial (`off=fhrttdh8`): R$ 149,90 por ano à vista (R$ 12,49/mês), ou em até 12x no cartão com acréscimo, sem valor de parcela |
> | `/` (fora de BR, PT, ES e América Latina) | a mesma página, reescrita para `/mundo`, com a lista de espera no bloco (rw fechado; aberto, US$ 29,99 por ano pela oferta `uevhmhy2`) |
> | `/pt-pt` | página de vendas em pt-PT, lista de espera no bloco (pt fechado; link `3n484jbe` pronto) |
> | `/es` e `/es-es` | lista de espera em espanhol (página inteira; la e es fechados, links `uevhmhy2` e `iuoufnf6` prontos) |
> | `/pt-pt/embreve`, `/es-es/embreve` | **prévias do dono** (noindex, fora do sitemap, abrem de qualquer país): página de vendas de Portugal e da Espanha com o bloco de 29,99 €, botão desabilitado enquanto a venda do mercado estiver fechada |
> | `/estudante` | condição de estudante, **qualquer curso**: R$ 59,90 por ano nos 3 primeiros anos para quem assinar até 16/11/2026 e R$ 79,90 depois (nas duas fases, R$ 149,90 por ano depois dos 3 anos), numa OFERTA da Hotmart por fase; o link pessoal vai pelo WhatsApp. **Fechada sozinha** enquanto faltar o modelo v2 na Vercel ou o código da oferta da fase vigente em `config/pricing.ts` (item 1 abaixo e `docs/ESTUDANTE.md`) |
> | `/estudante/ativar?cupom=TOKEN` | token conhecido: 302 para a oferta de estudante da fase do clique, com o token no `sck`; já usado ou fase sem oferta: `/estudante/inscricao` (inscrição concluída, ou o link continua valendo); desconhecido: `/estudante` |
> | `/embreve`, `/es/embreve` | redirecionam para `/` e `/es`, com utm |
>
> **QUADRO DE GO-LIVE · nesta ordem.** O site no ar vende na hora: o
> botão do Brasil já abre a oferta de lançamento.
>
> **(a) Primeiro, no app.** Na Hotmart, o webhook do produto 7448309
> reconfigurado para o app, e a chave `HOTMART_WEBHOOK_V2` na **posição 1**
> no Railway (`docs/HOTMART-WEBHOOK-V2.md`, no repositório do app). Hoje
> (27/10/2026) a rota antiga do app (posição 0) já cria a conta, mas grava
> no log do Railway o e-mail e o link de ativação de cada conta nova; a
> posição 1 resolve isso. **Feito isso, na Vercel, Settings,
> Environment Variables, Production: `DM_WEBHOOK_V2_OK=1`.** É a
> confirmação de que o passo (a) foi feito: sem ela, o build de produção
> da Vercel **trava** (`scripts/checar-precos.js`) enquanto algum mercado
> vende. Preview e build local não travam por isso.
>
> **(b) Só então, o merge do PR #3 do site.** Com `DM_WEBHOOK_V2_OK=1`, o
> build de produção passa (as travas estão satisfeitas); o log mostra os
> avisos abaixo, um por um. Merge antes da variável: o deploy de produção
> falha, e o site antigo continua no ar.
>
> Depois do merge (não travam o build; saem como aviso em todo build):
>
> 1. **Estudante: link pessoal e oferta por fase (decisão do dono,
>    28/10/2026). Passo a passo em `docs/ESTUDANTE.md`.** A API de cupons
>    da Hotmart não aceita produto de assinatura, e o 7448309 é
>    assinatura: o cupom pessoal pela API saiu (só o standby o usa). O
>    pedido grava um token pessoal em `cupons_estudante.codigo`, o
>    WhatsApp (modelo `diariamente_estudante_aprovado_v2`, inalterado)
>    leva a `/estudante/ativar?cupom=TOKEN`, que abre a oferta de
>    estudante da fase do clique (`ESTUDANTE_OFERTA_LANCAMENTO`, R$ 59,90,
>    até 16/11; `ESTUDANTE_OFERTA`, R$ 79,90, depois), e o webhook do site
>    marca o link como usado na venda aprovada (pelo `sck` ou pelo
>    e-mail). **Os dois códigos ainda estão vazios**: enquanto faltar o da
>    fase vigente, a `/estudante` fica fechada (lista de espera, API em
>    503 sem gravar nada, home sem o card), e o log do build diz qual
>    falta e avisa quando faltar o da fase seguinte. `STUDENT_DISCOUNT`,
>    `HOTMART_OFFER_IDS` e `HOTMART_PRODUCT_ID` não contam mais. **Os
>    mesmos dois códigos vão, no mesmo dia, no app**
>    (`command-center/mercado.js`, deploy no Railway): sem eles, o app
>    trata o estudante como assinante comum do Brasil. Opcional:
>    `RESEND_API_KEY` na Vercel (e-mail de aprovação pelo Resend) e o
>    campo `cf_link_estudante` no RD (o link na conversão).
> 2. **Fim do lançamento (16/11/2026).** Nada a fazer no site: a partir de
>    17/11 00:00 (Brasília) a página mostra R$ 149,90 e o botão abre
>    `fhrttdh8` (as homes se refazem a cada hora e o navegador confere de
>    novo). Na Hotmart, mantenha a oferta `lf63bgdd` ativa até 17/11 02:00
>    e então desative-a: o link dela é aberto, e quem o guardou pagaria o
>    preço de lançamento. Para encerrar antes da data: `ativo: false` no
>    mercado br de `config/pricing.ts`.
> 3. **Mercados de fora** (la, rw, pt, es): links prontos, todos com
>    `vendaAberta: false` até o dono confirmar. Para abrir um, vire a
>    chave dele (a trava confere o link). Antes: testar o checkout por IP
>    (VPN) para confirmar a moeda; lembrar que rw usa a oferta da América
>    Latina (`uevhmhy2`, US$ 29,99), cujo checkout abre em espanhol numa
>    página em português; revisar `/es/condicionesdeuso` com o jurídico
>    (direito do consumidor local; 14 dias na União Europeia).
> 4. **Revisão jurídica da cláusula de titularidade.** O texto está em
>    `components/Titularidade.tsx` (seção 1 dos Termos e da Política, pt e
>    es). Desde a decisão do dono de 26/10/2026 (que substitui a de
>    12/10/2026), a seção abre com a linha de identificação do grupo
>    Science Play (Science Play Audiobook LTDA, Science Play Cursos LTDA e
>    Falcão14 Organização de Feiras LTDA, com os CNPJs, vindos de
>    `EMPRESA.grupo`): a Science Play®, por meio dessas empresas, é a
>    titular e a responsável pelo Diariamente App e pelos dados; os
>    pagamentos são processados pela Hotmart, que atua como intermediária
>    (o texto NÃO diz quem contratou a Hotmart); qualquer empresa do grupo
>    pode aparecer como vendedora em loja de aplicativos, na plataforma de
>    pagamento ou em documento fiscal, sem mudar a titularidade nem a
>    responsabilidade. **Merece um olhar do jurídico.**
>    Base legal: o Decreto 7.962/2013, art. 2º, pede nome empresarial, CNPJ e endereço físico e eletrônico "em local de destaque e de fácil visualização" no site.
>    O rodapé de todas as páginas mostra a linha curta do grupo com os três CNPJs (`RodapeDoGrupo`, em `components/CnpjsDoGrupo.tsx`).
>
> - **Preços:** fonte única em `config/pricing.ts`, por mercado (moeda,
>   preço anual, formato, link, textos do bloco, oferta de lançamento).
>   Moeda por mercado: Brasil em BRL; Portugal e Espanha em EUR; América
>   Latina e resto do mundo em USD.
>   Nenhum componente escreve preço. `vendaAberta` liga cada mercado.
>   Nenhum link de venda leva cupom; só o estudante usa cupom.
> - **Trava de preços:** `npm run build` falha se o link da oferta oficial
>   (`CHECKOUT_BRL`) ou o da oferta de lançamento (`CHECKOUT_LANCAMENTO`)
>   faltar, sair da Hotmart, levar `offDiscount` ou se os dois forem a mesma
>   oferta; se a data de término (`FIM_DO_LANCAMENTO`) faltar ou não
>   existir; se houver mercado com venda aberta sem link; ou, no build de
>   produção da Vercel com venda aberta, se faltar `DM_WEBHOOK_V2_OK=1`
>   (passo (a) do quadro) (`scripts/checar-precos.js`). Passado o último dia do lançamento, a
>   página volta sozinha a R$ 149,90 e o botão, à oferta oficial: as homes
>   se refazem a cada hora e, enquanto isso, o navegador confere de novo
>   depois de carregar (e troca na virada da meia-noite com a página
>   aberta). Um HTML antigo em cache ainda pode mostrar o preço de
>   lançamento por até uma hora para quem estiver sem JavaScript; daí a
>   folga até 02:00 no item 2.
> - **Empresa:** grupo Science Play (decisão do dono, 26/10/2026). No
>   rodapé de todas as páginas, a linha curta "Science Play® · grupo
>   Science Play · CNPJs ..." (`RodapeDoGrupo`); nos Termos e na Política
>   (pt e es), a linha de identificação com razão social e CNPJ de cada
>   empresa, o endereço de contato do grupo, contato@ e suporte@. Razão
>   social e CNPJ moram só em `EMPRESA.grupo` (`config.ts`); a página "Em
>   breve" usa a assinatura curta (`EMPRESA.assinatura`, "Diariamente App
>   by Science Play"). O endereço mora em `ENDERECO_DA_EMPRESA`, no `config.ts`: a
>   trava do endereço continua (com `[TROCAR` em qualquer parte, o build
>   falha) e hoje está satisfeita. **Build na sua máquina:** as rotas de
>   API criam o cliente do Supabase ao carregar, então o `next build`
>   local precisa de `SUPABASE_URL` e `SUPABASE_SERVICE_KEY` (fictícias
>   servem; sem elas, "supabaseUrl is required"). Produção local:
>   `SUPABASE_URL=https://exemplo.supabase.co SUPABASE_SERVICE_KEY=x npm run build`.
>   Com outro endereço: `DM_ENDERECO_TESTE="Rua de Teste, 123" SUPABASE_URL=https://exemplo.supabase.co SUPABASE_SERVICE_KEY=x npm run build`
>   (libera as duas travas; recusado em produção na Vercel). Na Vercel as
>   duas variáveis já existem. `npm test` roda os testes.
> - **Roteamento por país:** `middleware.ts` + `lib/mercado.ts` (lista da
>   América Latina num só lugar). Só as homes decidem; robô nunca é
>   redirecionado (navegador interno do LinkedIn, Pinterest, Telegram,
>   DuckDuckGo e Instagram é gente, e segue o país); `?mercado=` do
>   seletor do rodapé grava `dm_market` por 180 dias e vence o país; sem
>   país, o idioma do navegador decide. hreflang das homes: pt-BR, pt-PT,
>   es-ES, es e x-default (o es-419 do handoff saiu, como na main).
> - **Lista de espera:** grava mercado, idioma e país quando as colunas
>   existirem; sem elas, grava sem, sem perder o lead.
> - **Cookies:** aviso com Aceitar e Recusar (`components/Consentimento.tsx`).
>   GA4, Pixel da Meta, InitiateCheckout e Purchase só depois do Aceitar.
>   A Política (seção 8, pt e es) lista `dm_cookies` e `dm_market`.
> - **Para voltar à lista de espera:** Vercel, Deployments, deploy anterior,
>   Instant Rollback (ou reverter os commits da virada).

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

Site continua oculto. Sitemap com 12 URLs (sem repetição desde 20/10/2026), nenhuma de venda.

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
