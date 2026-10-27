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
> | `/estudante` | condição de estudante: R$ 89,90 por ano, cobrança anual (R$ 7,49/mês), com o cupom pessoal de uso único sobre a oferta oficial de R$ 149,90; o cupom chega pelo WhatsApp. **Fechada sozinha** enquanto faltar configuração na Vercel (item 1 abaixo): lista de espera no lugar do formulário, e a home não leva até ela |
> | `/estudante/ativar?cupom=CODIGO` | confere o código e abre a oferta oficial `fhrttdh8` com `offDiscount=CODIGO` |
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
> 1. **Estudante: fechado sozinho até a Vercel ter as três chaves.** O
>    fluxo é o original: aprovado o estudante, o site cria o cupom PESSOAL
>    dele pela API da Hotmart; o WhatsApp leva o botão para
>    `/estudante/ativar`, que abre a oferta oficial `fhrttdh8` com o cupom;
>    o webhook do site apaga o cupom quando o pagamento é aprovado (uso
>    único). **Enquanto faltar uma das três chaves abaixo, o build fecha o
>    fluxo** (`DM_ESTUDANTE_ABERTO`, calculada no `next.config.js`): a home
>    não mostra "Sou estudante" nem o card de estudante, a `/estudante`
>    mostra a lista de espera no lugar do formulário (os contatos entram na
>    lista com origem `estudante`, conversão `diariamente-estudante-em-breve`
>    no RD) e `/api/estudante/solicitar` responde 503 **sem gravar nada**:
>    nenhum cupom nasce, nenhum CPF fica preso pela regra "um CPF, um
>    pedido", nenhuma mensagem sai. O log diz "Estudante FECHADO" e o que
>    falta. As três chaves (Vercel, Production):
>    - `WA_TEMPLATE_ESTUDANTE`: o nome do **v2** do modelo de aprovação,
>      com o botão `https://www.diariamente.app/estudante/ativar?cupom={{1}}`
>      (com www: sem www a Vercel responde 308 e o clique dá um salto a mais),
>      criado e aprovado pelo app na Meta (o modelo aprovado hoje fica
>      preservado). O `diariamente_estudante_aprovado` abre o checkout
>      antigo, do produto 8280315, onde o cupom não vale.
>    - `HOTMART_PRODUCT_ID=7448309`. Com outro produto, o cupom nasce lá e
>      o checkout da oferta oficial não o reconhece. As credenciais da API
>      que o site já usa (`HOTMART_CLIENT_ID`, `HOTMART_CLIENT_SECRET`,
>      `HOTMART_BASIC`) servem se o 7448309 estiver na mesma conta Hotmart.
>    - `STUDENT_DISCOUNT=0.40027` (exatamente este valor). O preço do
>      estudante é FINAL (`ESTUDANTE_PRECO_FINAL = 89.9` em
>      `config/pricing.ts`), e o desconto do cupom sai dele:
>      1 - 89,90/149,90 = 0,400266..., arredondado PARA CIMA com 5 casas
>      = 0.40027 (`ESTUDANTE_DESCONTO`). Para cima porque o preço exato
>      (R$ 89,8995) fica no anunciado ou abaixo: seja qual for o
>      arredondamento da Hotmart, o checkout mostra R$ 89,90 ou R$ 89,89,
>      nunca R$ 89,91. A trava aceita só valores com essa garantia (de
>      0.40027 a 0.40030) e diz o exato no aviso. **O `0.40` antigo fecha
>      o fluxo** (daria R$ 89,94), e **0.40024 a 0.40026 também** (o
>      0.400266 do passo a passo antigo do app incluído): arredondam para
>      R$ 89,90, mas o preço exato passa dele, e, se a Hotmart cortar o
>      desconto, o checkout cobraria R$ 89,91.
>
>    Antes do novo deploy que abre o fluxo (o build não consegue conferir):
>    - Hotmart: o webhook do site (`https://www.diariamente.app/api/webhooks/hotmart`,
>      COM www, hottok em `HOTMART_HOTTOK`) cadastrado também no 7448309, com
>      compra aprovada. É ele que apaga o cupom; sem ele, o cupom só morre
>      ao vencer (48 h). Sem www, a Vercel responde 308 e a Hotmart pode
>      não repetir o POST no endereço novo: se um cadastro já existente
>      usa `https://diariamente.app/...`, troque pelo com www.
>    - Vercel, `HOTMART_OFFER_IDS`: o id NUMÉRICO da oferta `fhrttdh8`
>      (Hotmart, produto 7448309, Ofertas; o código `off` não serve).
>      **Vazio, o cupom pessoal vale em qualquer oferta do produto,
>      inclusive a de lançamento** (o mesmo desconto sobre R$ 99,98 daria
>      R$ 59,96). Não fecha o fluxo
>      (risco aceito pelo dono); sai como aviso em todo build.
>    - Aberto, faça um pedido de teste de estudante com um CPF seu e
>      **confira o primeiro cupom real no checkout: ele precisa mostrar
>      R$ 89,90.** A API da Hotmart recebe o desconto como fração e nada
>      no código nem na documentação que ele seguiu diz quantas casas ela
>      guarda nem como arredonda. O que o checkout pode mostrar, e o que
>      decidir em cada caso:
>      - **R$ 89,90:** pronto, nada a fazer.
>      - **R$ 89,89:** a Hotmart corta o centavo. O estudante paga 1
>        centavo a menos que a página (nunca a mais). Decisão do dono:
>        aceitar assim, ou pedir ao DEV um desconto um pouco menor (com o
>        corte confirmado, 0.40024 dá R$ 89,90; a trava hoje recusa esse
>        valor de propósito e precisa ser ajustada junto).
>      - **R$ 89,94:** a Hotmart guarda só 2 ou 3 casas do desconto
>        (0.40). Nenhum desconto percentual dá R$ 89,90 sobre R$ 149,90
>        (0.40 dá R$ 89,94; 0.41 dá R$ 88,44). Decisão do dono: anunciar
>        R$ 89,94 (`ESTUDANTE_PRECO_FINAL = 89.94` em `config/pricing.ts`
>        e `STUDENT_DISCOUNT=0.4`) ou R$ 88,44 (0.41). Até a decisão, o
>        estudante fica fechado (tirar o `STUDENT_DISCOUNT` da Vercel e
>        fazer um novo deploy).
>      - **"Não foi possível gerar seu código":** a Hotmart recusou o
>        desconto com 5 casas. Mesma decisão do caso de R$ 89,94.
>      - Confira também que o checkout com o cupom mostra o seletor de
>        parcelas: a `/estudante` diz "R$ 89,90 à vista, ou em até 12x no
>        cartão com acréscimo" (`ESTUDANTE.pagamento`, a mesma linha da
>        oferta oficial). Sem seletor, troque essa linha por "à vista".
>    - Banco: a coluna `cupons_estudante.desconto` é `numeric(4,3)` e
>      guarda 0.400 (o valor exato, 0.40027, fica em
>      `log_estudante.detalhe`). Não quebra nada; para guardar o valor
>      exato, `sql/2026-10-12-cupons-estudante-desconto_APROVACAO.sql`
>      (mudança em tabela existente, precisa de aprovação).
>    - Tempo de espera: a tela promete o código "em até 10 minutos"
>      (`ESTUDANTE.esperaMinutos`): 5 de janela de conferência na API e até
>      5 tentativas do cron, uma por minuto. Um teste confere a conta.
>    - Renovação: o cupom vale também nas renovações? Não se sabe. Por
>      decisão do dono (12/10/2026, terceira rodada), o texto diz SÓ que a
>      cobrança é anual: "R$ 89,90 por ano · cobrança anual" e "Cobrança
>      anual. Cancele quando quiser." (`ESTUDANTE.periodo` e
>      `ESTUDANTE.renovacao` em `config.ts`), sem "no primeiro ano", sem
>      "3 anos" e sem "renova pelo mesmo valor" (a chave
>      `renovaMesmoValor` saiu do estudante). Também sem "enquanto está
>      na graduação" nem "durante toda a sua graduação" (o mesmo prazo
>      com outras palavras): a `/estudante` diz que a condição é "para
>      quem ainda está na graduação" e que muda "o preço de entrada". Um
>      teste varre o texto em português e espanhol atrás dessas frases.
>      Durante o lançamento, a regra do LANÇAMENTO ("nos 3 primeiros
>      anos. Depois, R$ 149,90 por ano."), que é da oferta `lf63bgdd`,
>      aparece só na coluna "Quem entra hoje pelo site" do comparativo,
>      para o estudante comparar as duas opções. Ela saiu da nota do card
>      de estudante, onde era lida como a duração do cupom; a nota agora
>      começa por "Para você, estudante:".
>    - **Risco a decidir (dono): a economia durante o lançamento.** Até
>      16/11, o comparativo mostra "Você economiza R$ 10,08" e o selo
>      "R$ 10,08 OFF" (R$ 99,98 contra R$ 89,90, a cobrança de hoje), sem
>      período, como o dono pediu. Só que o preço de lançamento é garantido
>      por 3 anos e o do estudante não se sabe: se o cupom não valer nas
>      renovações, o estudante paga 89,90 + 149,90 + 149,90 = R$ 389,70 em
>      3 anos, contra R$ 299,94 pelo lançamento (R$ 89,76 a mais). A coluna
>      do lançamento mostra a regra dos 3 anos, mas o "economiza" pode ser
>      lido como vantagem garantida (CDC, art. 37). Opções, sem falar em
>      duração do estudante: (a) manter; (b) esconder a coluna "Você
>      economiza" e o selo OFF enquanto o lançamento vale; (c) dizer "na
>      cobrança de hoje". Hoje está (a).
>    - O link "Sou estudante" da home diz "R$ 7,49/mês · R$ 89,90 por ano
>      · cobrança anual", sem a linha de pagamento (não cabe no link). Ela
>      está no card e no resumo da `/estudante`, e o checkout mostra cada
>      parcela com o total.
>    - A oferta de estudante `h82bllbx` hoje mostra R$ 149,90 no checkout,
>      igual à oficial, e o site não a usa. Recomendação mantida:
>      desativá-la na Hotmart (o link dela é aberto).
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
