# Pós-pagamento: páginas de obrigado e /baixar

O que a pessoa vê no segundo em que paga, e o que cada parte faz. Uma
página de obrigado por mercado, em quatro locais (pedido do dono,
29/10/2026: "Preciso das URL's criar uma versão de página de obrigado,
aguardando pagamento… para cada idioma e colocarei dentro de cada oferta
delas. Brasil: português BR; Portugal: português PT; Espanha: espanhol;
América Latina: espanhol; EUA / demais países: inglês"). A URL de cada
local é no idioma dele, como a em espanhol desde 28/10/2026.

Código: `lib/obrigado.mjs` (regras), `lib/obrigado-textos.mjs` (textos),
`components/PaginaObrigado.tsx`, `components/ObrigadoShell.tsx`,
`components/PosPagamento.tsx`, `components/BaixarApp.tsx`,
`components/IdiomaDoDocumento.tsx`, `components/pos-pagamento.css`,
`components/Consentimento.tsx` (medição e aviso de cookies) e
`middleware.ts`. Testes: `testes/obrigado.test.mjs`.

## 1. As 14 URLs

| Página | pt (pt-BR) | pt-pt (Portugal) | es (espanhol) | en (inglês dos EUA) |
|---|---|---|---|---|
| Pagamento aprovado | `/obrigado-aprovado` | `/pt-pt/obrigado-aprovado` | `/es/gracias-aprobado` | `/en/thank-you-approved` |
| Aguardando pagamento | `/obrigado-aguardando-pagamento` | `/pt-pt/obrigado-aguardando-pagamento` | `/es/gracias-pago-pendiente` | `/en/thank-you-pending-payment` |
| Em análise | `/obrigado-aguardando-analise` | `/pt-pt/obrigado-aguardando-analise` | `/es/gracias-en-analisis` | `/en/thank-you-under-review` |
| Baixar o app (QR code) | `/baixar` | (usa o `/baixar`) | `/es/descargar` | (usa o `/baixar`) |

- **pt** atende o Brasil e quem paga em dólar e lê em português do Brasil.
  **pt-pt** atende Portugal. **es** atende a América Latina **e** a
  Espanha ("Espanha: espanhol"; não existe es-ES). **en** atende os
  Estados Unidos e os demais países.
- As URLs **sem prefixo** são as automáticas: descobrem o idioma (seção 3).
  Nas rotas **com prefixo** (`/pt-pt`, `/es`, `/en`) o **caminho manda**:
  nada de cookie, `?lang=`, navegador nem país.
- Todas são dinâmicas, `noindex, nofollow` na meta **e** no cabeçalho
  `X-Robots-Tag` (`next.config.js`, `POS_PAGAMENTO`), com canonical para
  si e fora do sitemap.
- O `<html lang>` do layout raiz é sempre `pt-BR`; cada página manda o
  idioma certo no `<main lang>` do HTML do servidor (`pt-BR`, `pt-PT`,
  `es`, `en`) e o `<html lang>` vira o do local na hidratação
  (`components/IdiomaDoDocumento.tsx`, como as homes).
- O `/obrigado` antigo leva à aprovada do local, com os parâmetros.
- `?lang=` nas URLs sem prefixo leva à rota do local (`?lang=es`,
  `?lang=pt-PT`, `?lang=en`); `/baixar?lang=es` → `/es/descargar` no
  computador, ou a loja em espanhol no celular.
- Só pt e es têm `/baixar`. As páginas de pt-pt e en reaproveitam o QR
  code do `/baixar` (quem aponta a câmera está no celular, e o middleware
  manda o celular direto para a loja). As rotas `/es/obrigado-*`,
  `/es/baixar`, `/es-es/*`, `/pt-pt/baixar` e `/en/baixar` não existem
  (404). As `/pt-pt/obrigado-*` saíram em 28/10 porque nunca tinham ido
  ao ar com texto próprio; voltaram em 29/10/2026 com texto em pt-PT.

## 2. O que vai em cada oferta da Hotmart

O dono cola as URLs **em cada oferta** (pedido de 29/10/2026: "colocarei
dentro de cada oferta delas"). Três por oferta, uma por status:

| Oferta | Mercado | Aprovado | Aguardando pagamento | Em análise |
|---|---|---|---|---|
| `fhrttdh8`, `lf63bgdd` e as de estudante | Brasil (real) | `https://www.diariamente.app/obrigado-aprovado` | `https://www.diariamente.app/obrigado-aguardando-pagamento` | `https://www.diariamente.app/obrigado-aguardando-analise` |
| `3n484jbe` | Portugal (euro) | `https://www.diariamente.app/pt-pt/obrigado-aprovado` | `https://www.diariamente.app/pt-pt/obrigado-aguardando-pagamento` | `https://www.diariamente.app/pt-pt/obrigado-aguardando-analise` |
| `iuoufnf6` | Espanha (euro) | `https://www.diariamente.app/es/gracias-aprobado` | `https://www.diariamente.app/es/gracias-pago-pendiente` | `https://www.diariamente.app/es/gracias-en-analisis` |
| `uevhmhy2` | América Latina **e** EUA / demais países (dólar) | `https://www.diariamente.app/obrigado-aprovado` (automática) | `https://www.diariamente.app/obrigado-aguardando-pagamento` (automática) | `https://www.diariamente.app/obrigado-aguardando-analise` (automática) |
| futura oferta só dos EUA | EUA | `https://www.diariamente.app/en/thank-you-approved` | `https://www.diariamente.app/en/thank-you-pending-payment` | `https://www.diariamente.app/en/thank-you-under-review` |

- A oferta em dólar é **uma só** para a América Latina e para os Estados
  Unidos e demais países: por isso leva as URLs automáticas, que escolhem
  na hora entre espanhol, inglês e português (seção 3). As `/en` diretas
  ficam prontas para o dia em que houver uma oferta só dos EUA.
- As `/es` servem a Espanha e também a América Latina (quem chega pela
  automática e lê em espanhol é levado para elas).
- Status "Aguardando pagamento": Pix, boleto, OXXO, transferência,
  Multibanco. "Em análise": por exemplo, PayPal.
- Se a Hotmart só aceitar a URL por **produto** (7448309) e não por
  oferta: **Produtos** > o produto > **Ferramentas** > **Configurações de
  pagamento** > **Pós-venda** > "Onde será?" > **Externa**, com as três
  automáticas. Elas levam cada um ao seu idioma (seção 3).

É ação do dono, no painel da Hotmart.

## 3. Como o idioma é decidido

As três URLs automáticas (e o `/obrigado` antigo) passam pelo middleware,
que decide o local nesta ordem (`decidirObrigado`, função pura testada):

1. **`?off=` de uma oferta de um mercado só**, se a Hotmart mandar:
   `fhrttdh8`, `lf63bgdd` e as de estudante (real) → pt; `3n484jbe`
   (euro, Portugal) → pt-pt; `iuoufnf6` (euro, Espanha) → es. A oferta
   diz o que foi pago **agora**, por isso vence o cookie, que pode ser de
   uma visita antiga. A `uevhmhy2` (dólar) é da América Latina **e** dos
   EUA e demais países: sozinha não decide, e os passos seguintes decidem.
2. **Cookie `dm_mercado`**: o mercado da última página de mercado aberta
   no site (seção 4). `br` → pt; `pt` → pt-pt; `es` e `la` → es. **`rw`
   não decide**: o site do resto do mundo é em português com preço em
   dólar, então o cookie não diz em que idioma a pessoa lê. Segue.
3. **`?lang=`** (links antigos do app: `/obrigado-aprovado?lang=es`):
   `es` → es; `pt` → pt; `pt-pt` (ou `pt-PT`) → pt-pt; `en` → en.
4. **Idioma do navegador** (`Accept-Language`, pelo q, depois a ordem):
   `es*` → es. Da família pt: a etiqueta `pt-PT` → pt-pt; o `pt` simples
   com o IP em Portugal → pt-pt, senão pt; `pt-BR` → pt. **Inglês e
   outros idiomas são pulados**: navegador em inglês não prova que a
   pessoa não está na América Latina ou no Brasil.
5. **País do IP** (`x-vercel-ip-country`), com as listas de
   `lib/mercado.ts` (as mesmas das homes): Brasil → pt; Portugal →
   pt-pt; Espanha e América Latina → es; o resto → en.
6. **pt**.

Se der um local diferente de pt, a resposta é um **307 para a rota do
mesmo status nesse local, com a busca inteira** (`transaction`, `off`,
`utm`...). Exemplos (conferidos com `curl`, seção 12):

| Quem chega na automática | Vai para |
|---|---|
| oferta do dólar, navegador `es-MX` | `/es/gracias-...` |
| oferta do dólar, navegador `en-US`, IP dos EUA | `/en/thank-you-...` |
| oferta do dólar, navegador `pt-BR`, IP dos EUA | fica na pt-BR |
| oferta do dólar, navegador `en-US`, IP do México | `/es/gracias-...` |
| cookie `rw`, IP da Alemanha | `/en/thank-you-...` |
| navegador `pt`, IP de Portugal | `/pt-pt/obrigado-...` |
| `off=3n484jbe` (de qualquer lugar) | `/pt-pt/obrigado-...` |
| oferta do Brasil, ou nada | fica na pt-BR |

Nas rotas com prefixo **o caminho manda**, e a decisão das homes
(`decidirRota`) também as deixa seguir (não são homes nem vitrine).

## 4. Cookie dm_mercado

Gravado pelo middleware sempre que uma página de mercado **abre**: as
homes (`/`, `/es`, `/es-es`, `/pt-pt`) e as páginas de venda (`/vendas`,
`/es/vendas`, `/es-es/vendas`, `/pt-pt/vendas`, `/mundo/vendas`). Guarda só
`br`, `la`, `es`, `pt` ou `rw`, por 30 dias, `Path=/`, `SameSite=Lax`,
`Secure`. Funcional, sem dado pessoal; está na Política de Privacidade
(pt e es, seção 8, versão lançada).

É outro cookie, de propósito: o `dm_market` é a **escolha** do seletor do
rodapé e decide para onde as homes levam; o `dm_mercado` só anota a visita
e não muda rota nenhuma. As páginas de obrigado não gravam o
`dm_mercado`. Nas páginas de venda e nas homes com prefixo o
valor depende só do caminho (não quebra cache: o `Cache-Control` delas
continua `s-maxage=3600`); na "/", `br` ou `rw` dependem do país e do
`dm_market`, que já estão no `Vary` da "/".

## 5. Mercado do pedido (Purchase, Pix e boleto)

`mercadoDoObrigado`: a oferta, quando vem, manda (a do dólar fica com a
América Latina na página es e com o resto do mundo nas páginas pt, pt-pt
e en). Sem oferta: o cookie `dm_mercado` e depois o país do IP, **se
forem mercados do local da página**:

| Local | Aceita do cookie e do país | Mercado natural (nada mais diz) |
|---|---|---|
| pt | `br`, `rw` (brasileiro no exterior lê pt e paga dólar) | `br` |
| pt-pt | `pt` | `pt` |
| es | `la`, `es` | `la` |
| en | `rw` | `rw` |

Exemplo: um brasileiro nos Estados Unidos lendo em pt, sem cookie e sem
oferta, é "mundo" (dólar); quem abre `/pt-pt/...` é sempre euro, a não
ser que a oferta diga outra moeda.

- **Pix e boleto só para o mercado `br`.** Quem lê em pt-BR e paga em
  dólar (mundo) vê a linha geral ("Siga as instruções mostradas ao
  finalizar o pedido..."); pt-pt, es e en não têm Pix nem boleto na copy
  e sempre veem a linha geral. Se a URL disser a forma
  (`payment_type` ou `payment_method`), só a orientação dela; outra
  forma, só a linha geral. O checkout das duas ofertas do Brasil lista
  boleto (BILLET) em 28/10/2026, por isso o cartão do boleto continua.
- **Purchase** (Meta Pixel e GA4): só na aprovada, com a moeda e o valor
  do mercado (`config/pricing.ts`, `valorDoPedido`). A conta do que sai é
  a função pura `dadosDoPurchase`: `transaction` (ou `transaction_id`)
  vira o `eventID` do Pixel e o `transaction_id` do GA4; o valor da URL
  só vale na mesma moeda do plano (no Brasil, sem moeda ou com BRL; fora
  dele, só se a URL disser a moeda e ela for a do plano). `hottok` nunca
  entra.

## 6. Consentimento (cookies de medição)

- **Chave de lançamento ligada**: o aviso de cookies vale em todas as
  páginas; GA4, Pixel e Purchase só depois do Aceitar.
- **Standby**: fora da vitrine, o site monta GA4 e Pixel direto, como a
  produção de hoje. **Nas páginas do pós-pagamento** (as 14 e o
  `/obrigado`), a página lê antes a escolha gravada (`dm_cookies`): quem
  clicou em **Recusar** na vitrine não monta GA4 nem Pixel e o Purchase
  não sai. Aceitou ou não escolheu: monta como hoje. Nada de medição vai
  no HTML do servidor dessas páginas.
- **Aviso no celular** (até 560 px, revisão de 28/10/2026): compacto, com
  115 px, sem o título, com o texto curto ("Usamos cookies de medição do
  Google e da Meta só se você aceitar. Saiba mais.") e Recusar e Aceitar
  de 40 px, do mesmo tamanho. O inteiro tinha ~214 px e, com a chave
  ligada, cobria o "Instalar no iPhone" de quem chega sem ter respondido.
  Medido com a chave ligada e sem `dm_cookies`: o aviso começa em 537 px
  (iPhone 390 x 664) e em 513 px (360 x 640); o botão termina em 484 px e
  em 479 px (pt) ou 503 px (es). No computador, o aviso de sempre, abaixo
  do QR. A mesma troca está na branch `claude/lancamento-ajustes`.
- **Idioma do aviso**: o da rota (pt ou es) e, nas páginas de obrigado, o
  do local (`localDoPosPagamento`): pt-PT em `/pt-pt/obrigado-*` ("só se
  aceitar", sem o "você") e inglês em `/en/thank-you-*`. A Política de
  Privacidade só existe em pt e es: pt-pt leva à em português, e o
  inglês também, dizendo no link "Privacy Policy (in Portuguese)" (com
  `hreflang="pt-BR"`). A home `/pt-pt` continua com o aviso em pt-BR.

## 7. O que cada página mostra

**Aprovado** (o app é o motivo principal).

- **Celular**, uma coluna, nesta ordem: selo e título compactos, o cartão
  "Passo 2: Instale o app" com o botão da loja do aparelho (**aparece sem
  rolar** no iPhone de verdade: o Safari deixa uns 390 x 664 de área
  visível; o fundo do botão fica em 484 px em pt e em es, e em 479 px
  (pt) e 503 px (es) a 360 x 640), a trilha de 3 marcos (status alinhados
  na base),
  "Passo 3: Crie sua senha no app", o aviso do WhatsApp com o "Não
  recebeu?" logo abaixo, e a tela real do app (a arte das lojas, sem
  legenda: ela já traz o próprio título).
- **Computador** (960 px ou mais), duas colunas: título e trilha à
  esquerda, o cartão de instalar com o **QR code na primeira dobra** à
  direita (QR de 202 a 370 px a 1280 x 800), e embaixo a senha, o WhatsApp
  e o "Não recebeu?" à esquerda e a tela do app à direita.
- O "chip" `Primeiro acesso? Ativar conta` / `¿Primer acceso? Activar
  cuenta` é **igual ao botão do app** (texto teal, 14 px, peso 600, sem
  borda nem fundo, como em `public/index.html` do app) e o passo diz onde
  ele fica: "abaixo do botão Entrar".
- **O app só tem pt-BR e es.** Abre em espanhol num aparelho em espanhol e
  em português num em português; num aparelho em inglês, decide pelo
  fuso (país de língua espanhola, es; o resto, como os EUA, pt-BR). Por
  isso pt-pt e en citam o rótulo **em português, exatamente como o app
  mostra**. O en põe a tradução entre parênteses na primeira vez
  ("Primeiro acesso? Ativar conta (First access? Activate account), below
  the Entrar (Sign in) button") e diz, numa frase, "The app is in
  Portuguese and Spanish." em toda página que manda abrir o app. Nenhuma
  página diz em que idioma chegam o WhatsApp e o e-mail.
- O chip sai com o **lang do rótulo** (`pt-BR` ou `es`), e o "Entrar" do
  en com `lang="pt-BR"` (`{ pt: "Entrar" }` na copy): o leitor de tela da
  página en lê os rótulos do app com a voz do português, como no app
  (WCAG 3.1.2).
- **Tela do app** no fim da aprovada: a arte das lojas, com a legenda
  escrita na imagem. pt e pt-pt usam a em português, es a em espanhol. O
  **en fica sem ela** (não há arte em inglês, e a em português seria
  texto em português na página em inglês); no computador, o WhatsApp sobe
  para a coluna da direita, ao lado da senha.
- O código de 6 dígitos **sem garantia absoluta**: o app manda o código ao
  WhatsApp da conta; sem telefone, ou se o WhatsApp falhar, manda um link
  de ativação ao e-mail (`/api/auth/activate-by-email` no app). O passo 3
  e o "Não recebeu?" falam dos dois caminhos.
- **"Abrir a versão web"** leva a `https://app.diariamente.club/ativar`
  (`?lang=es` só em espanhol; pt-pt e en sem lang). Conferido em 28/10/2026: sem token, responde
  200 e o app abre direto "Ativar sua conta" (e-mail, senha nova e
  confirmação). No `/baixar`, a versão web é a raiz do app. No
  computador, a aprovada mostra "Prefere começar aqui mesmo? Abrir a
  versão web" no fim do cartão do QR, na primeira dobra (592 px de 800), e
  o rodapé não repete a linha; no celular ela fica no rodapé.
- O subtítulo não conta passos ("Agora falta instalar o app e criar sua
  senha."): "dois passos" logo acima do cartão "Passo 2" se contradizia.
  A numeração fica com a trilha e os cartões. Vale para o título e o
  subtítulo dos três status (o en aguardando dizia "One step left: your
  payment." acima de uma trilha com dois passos por fazer; agora "Waiting
  for payment confirmation.").

**Aguardando pagamento** e **Em análise**: a mesma moldura em dourado,
relógio, trilha no passo 2 e o que fazer enquanto isso.

Regras da marca nos textos, nos quatro locais (o teste confere): nunca
"compra"/"comprar" (no inglês, nem "purchase", "buy" ou "bought": payment,
subscription, access, order), nenhum travessão, no máximo 1 emoji por
página, frases curtas, nada que o sistema não cumpra, sem dizer em que
idioma chegam WhatsApp e e-mail e sem garantir que o WhatsApp chega.
pt-PT de verdade (telemóvel, ecrã, câmara, instalar e descarregar,
registo, "a app", "o seu" e "a sua", palavra-passe na prosa) e inglês dos
EUA curto (o teste procura brasileirismo no pt-pt e português no en). Movimento só uma vez e nada com
`prefers-reduced-motion`; contraste AA, foco visível, alvos de 44 px, 360
px sem rolagem lateral.

## 8. Aparelho e /baixar

O servidor lê o user-agent (`aparelhoDoUserAgent`):

- **iPhone, iPad, iPod**: botão grande da App Store e "Usa Android?" discreto.
- **Android**: o inverso.
- **Computador ou desconhecido**: QR code + as duas lojas. O QR abre o
  `/baixar` do idioma no celular.

O iPad com iPadOS 13 ou mais novo se apresenta como Mac no Safari e cai
em "computador": vê o QR e as duas lojas, que também funcionam.

No `/baixar` e no `/es/descargar` o celular nem vê a página: o middleware
manda **302** direto para a loja do idioma. Computador, aparelho
desconhecido e robô veem a página.

**QR codes**, gerados uma vez e versionados:
`public/qr/baixar.svg` → `https://www.diariamente.app/baixar` e
`public/qr/descargar.svg` → `https://www.diariamente.app/es/descargar`.
Em 28/10/2026 os dois foram decodificados com o jsQR 1.4.0 (leitor
independente do gerador) e deram exatamente essas URLs. Para regenerar
(só se o domínio mudar):

```
npx --yes qrcode@1.5.4 -t svg -e M -q 2 -d 0A0E0EFF -l FFFFFFFF \
  -o public/qr/descargar.svg "https://www.diariamente.app/es/descargar"
```

## 9. Lojas

Um app só para o mundo (App Store `id6762151251`, Google Play
`club.diariamente.app`). Fonte única: `LOJAS_DO_LOCAL`, em `lib/i18n.ts`
(páginas de obrigado, `/baixar`, middleware, StoreBadges e as homes via
`ATIVOS`; `config.ts` repete o pt para o JSON-LD e o rodapé, e o teste
confere que é igual). Um par por local:

| Local | App Store | Google Play |
|---|---|---|
| pt | `https://apps.apple.com/br/app/diariamente-sa%C3%BAde-mental/id6762151251` | `...details?id=club.diariamente.app&hl=pt-BR` |
| pt-pt | `https://apps.apple.com/pt/app/diariamente-sa%C3%BAde-mental/id6762151251` | `...details?id=club.diariamente.app&hl=pt-PT` |
| es | `https://apps.apple.com/mx/app/diariamente-salud-mental/id6762151251` | `...details?id=club.diariamente.app&hl=es` |
| en | `https://apps.apple.com/us/app/diariamente-sa%C3%BAde-mental/id6762151251` | `...details?id=club.diariamente.app&hl=en` |

Os oito respondem 200 direto, sem redirecionar (`curl -sIL`: pt e es em
28/10/2026, pt-pt e en em 29/10/2026; nas vitrines `/pt/` e `/us/` a Apple
usa o mesmo nome de ficha da `/br/`). No celular o link abre a loja do
país da pessoa de qualquer jeito; o caminho só muda a vitrine e o idioma
da ficha no computador. O caminho antigo da Apple
(`/br/app/diariamente/id6762151251`, que dava 301) saiu do site todo, e o
teste confere que nenhum link de loja é escrito fora da fonte única. O
QR code das páginas de pt-pt e en é o do `/baixar` (seção 8), cujo 302 no
celular usa as lojas do pt.

## 10. Log de aprendizado

Não se sabe quais parâmetros a Hotmart acrescenta na URL de obrigado. Cada
página registra **uma linha** no log do servidor com o status, o idioma e
**só os nomes** dos parâmetros, em ordem alfabética. Valor nunca (pode ter
e-mail, nome ou telefone).

```
[obrigado] aprovado es parametros=off,transaction
[obrigado] aguardando-pagamento pt-pt parametros=(nenhum)
```

Na Vercel: projeto > **Logs**, filtrar por `[obrigado]`. Quando aparecer
um nome útil (por exemplo a forma de pagamento ou a moeda), a regra entra
em `lib/obrigado.mjs` com teste.

## 11. O que depende do app (não do site)

- **WhatsApp na hora**: o webhook do app cria a conta sem senha e manda o
  modelo `diariamente_acesso_assinatura`, **só** se o pagamento trouxe
  telefone válido. Hoje só o pt_BR está aprovado na Meta; a versão em
  espanhol está pronta no app (branch `claude/boas-vindas-es`) mas não
  foi criada na Meta. Por isso a página não diz em que idioma a mensagem
  chega nem garante que ela chega.
- **E-mail de acesso** (RD Station): só em português hoje.
- **Interface do app**: só pt-BR e es; a versão web em espanhol abre com
  `?lang=es`. Não há app em pt-PT nem em inglês: as páginas de pt-pt e
  en citam os rótulos em português (seção 7).

## 12. Como testar

```
npm test
env -u DM_SITE_LANCADO SUPABASE_URL=https://exemplo.supabase.co SUPABASE_SERVICE_KEY=x npx next build
npx next start -p 4652
```

Redirecionamento das URLs automáticas (307, mantendo os parâmetros):

```
curl -sI -H "Cookie: dm_mercado=la" "http://localhost:4652/obrigado-aprovado?transaction=HPTESTE" | grep -i location
# location: /es/gracias-aprobado?transaction=HPTESTE
curl -sI "http://localhost:4652/obrigado-aguardando-pagamento?transaction=HPTESTE&off=iuoufnf6" | grep -i location
# location: /es/gracias-pago-pendiente?transaction=HPTESTE&off=iuoufnf6
curl -sI -H "x-vercel-ip-country: MX" -H "Accept-Language: en-US" "http://localhost:4652/obrigado-aguardando-analise?transaction=HPTESTE" | grep -i location
# location: /es/gracias-en-analisis?transaction=HPTESTE
curl -sI -H "x-vercel-ip-country: US" -H "Accept-Language: en-US" "http://localhost:4652/obrigado-aprovado?transaction=HPTESTE&off=uevhmhy2" | grep -i location
# location: /en/thank-you-approved?transaction=HPTESTE&off=uevhmhy2
curl -sI -H "x-vercel-ip-country: PT" -H "Accept-Language: pt" "http://localhost:4652/obrigado-aprovado?transaction=HPTESTE" | grep -i location
# location: /pt-pt/obrigado-aprovado?transaction=HPTESTE
```

`/baixar` e `/es/descargar` no celular (302 para a loja do idioma):

```
curl -sI -A "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)" http://localhost:4652/baixar | grep -i location
curl -sI -A "Mozilla/5.0 (Linux; Android 14; Pixel 8)" http://localhost:4652/es/descargar | grep -i location
```

O log aparece no terminal do `next start` a cada página de obrigado aberta.

**Cuidado com a medição ao testar.** Em standby, quem não recusou os
cookies monta o GA4 e o Pixel nas páginas de obrigado: abrir
`/obrigado-aprovado` num navegador, mesmo em `localhost`, manda um
Purchase de verdade para o Pixel e o GA4 (em 28/10 vazaram 33 assim).
`curl` não executa JavaScript e não manda nada. Em teste automatizado
(Playwright), bloqueie `connect.facebook.net`, `www.facebook.com`,
`googletagmanager.com`, `google-analytics.com` e `analytics.google.com`
(`context.route(...)` com `abort`); no navegador, grave
`dm_cookies=1.recusado` antes de abrir (a página respeita a recusa). Para
conferir o Purchase sem enviar, veja `window.fbq.queue` e
`window.dataLayer` com esses domínios bloqueados.

## 13. Na fila (fora desta entrega)

- **Colar as URLs em cada oferta da Hotmart** (seção 2): Brasil e dólar
  com as automáticas, Portugal com as `/pt-pt`, Espanha com as `/es`.
  Ação do dono.
- **App em pt-PT e em inglês**: não existe. As páginas de pt-pt e en citam
  os rótulos do app em português, e a en avisa que o app está em
  português e espanhol. O WhatsApp (modelo pt_BR) e o e-mail de acesso
  chegam em português para Portugal e para os EUA. Traduzir o app, o
  modelo e o e-mail é decisão do dono (lado do app).
- **Tratamento no pt-PT**: as páginas de obrigado de Portugal usam o
  formal ("o seu", "a sua", "Instale"), como pedido em 29/10/2026; a home
  `/pt-pt` usa "tu" (`lib/i18n.ts`, PT_PT). Unificar é decisão do dono.
- **Arte da tela do app em inglês**: não há; a aprovada em inglês fica sem
  a tela (seção 7). Se um dia houver, entra em `telaDoApp`
  (`components/ObrigadoShell.tsx`).
- **Assunto do e-mail do atendimento**: as rotas `/pt-pt/...`, `/es/...`
  e `/en/...` abrem o e-mail com o assunto em português ("Suporte
  Diariamente App", "Atendimento Diariamente App"), que o dono decidiu em
  20/10/2026 para a triagem da caixa. Ficou como está; trocar por um
  assunto por idioma ou por um neutro é decisão do dono
  (`config/atendimento.ts`).
- **Política de Privacidade e Termos em inglês**: não existem. O aviso de
  cookies das páginas en leva à Política em português e diz isso no link.
- **Descobrir o que a Hotmart manda na URL**: depois do primeiro
  pagamento real, filtrar `[obrigado]` nos Logs da Vercel. Se não vier
  `off`, a decisão das automáticas fica com o cookie, o `?lang=`, o
  navegador e o país (nas `/pt-pt`, `/es` e `/en` o caminho já decide).
- **Modelo de WhatsApp em espanhol na Meta** e e-mail de acesso em
  espanhol (lado do app).
- **Standby fora do pós-pagamento**: as outras páginas ainda montam GA4 e
  Pixel sem ler a recusa feita na vitrine (como a produção de hoje). Vale
  decidir junto com a decisão de Meta e Analytics depois do lançamento.
- **Cache na Vercel**: confirmar no deploy de prévia que `/vendas` e as
  homes continuam com `x-vercel-cache: HIT` com o `Set-Cookie` do
  `dm_mercado`.
- **Política de Privacidade em standby**: `/privacidade` e
  `/es/privacidad` mostram o texto da produção, que não cita o
  `dm_mercado` pelo nome; a versão lançada cita.
- **Meta e GA4**: os Purchase de teste que vazaram em 28/10 (hostname
  127.0.0.1). No GA4, excluir o hostname 127.0.0.1; na Meta, ligar a
  lista de domínios permitidos do pixel.
