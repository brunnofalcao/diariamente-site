# Pós-pagamento: páginas de obrigado e /baixar

O que a pessoa vê no segundo em que paga, e o que cada parte faz. Dois
idiomas, como o projeto todo (decisão do dono, 28/10/2026: "Vamos com tudo
para o Português - Brasil para lançar hoje"; o projeto é só em português e
espanhol, e a URL em espanhol é em espanhol).

Código: `lib/obrigado.mjs` (regras), `lib/obrigado-textos.mjs` (textos),
`components/PaginaObrigado.tsx`, `components/ObrigadoShell.tsx`,
`components/PosPagamento.tsx`, `components/BaixarApp.tsx`,
`components/pos-pagamento.css`, `components/Consentimento.tsx` (medição) e
`middleware.ts`. Testes: `testes/obrigado.test.mjs`.

## 1. As 8 URLs

| Página | pt (pt-BR) | es (espanhol da América Latina) |
|---|---|---|
| Pagamento aprovado | `/obrigado-aprovado` | `/es/gracias-aprobado` |
| Aguardando pagamento | `/obrigado-aguardando-pagamento` | `/es/gracias-pago-pendiente` |
| Aguardando análise de crédito | `/obrigado-aguardando-analise` | `/es/gracias-en-analisis` |
| Baixar o app (QR code) | `/baixar` | `/es/descargar` |

- **pt** atende Brasil, Portugal e o "mundo" (quem paga em dólar e lê em
  português). **es** atende a América Latina e a Espanha.
- Todas são dinâmicas, `noindex, nofollow` na meta **e** no cabeçalho
  `X-Robots-Tag` (`next.config.js`, `POS_PAGAMENTO`), com canonical para
  si e fora do sitemap.
- O `/obrigado` antigo leva à aprovada do idioma, com os parâmetros.
- `?lang=es` nas URLs sem prefixo leva à rota em espanhol equivalente
  (`/obrigado-aprovado?lang=es` → `/es/gracias-aprobado?lang=es`;
  `/baixar?lang=es` → `/es/descargar` no computador, ou a loja em espanhol
  no celular).
- As rotas `/es/obrigado-*`, `/es/baixar`, `/es-es/*` e `/pt-pt/*` do
  pós-pagamento nunca foram ao ar e saíram (respondem 404).

## 2. As três URLs que vão na Hotmart

A "Página de obrigado externa" da Hotmart é configurada **por produto**
(7448309), não por oferta nem por idioma. Por isso vão **as três URLs pt,
sem prefixo**, as mesmas para todos os mercados:

| Status na Hotmart | URL |
|---|---|
| Pagamento aprovado | `https://www.diariamente.app/obrigado-aprovado` |
| Aguardando pagamento (Pix, boleto, OXXO, transferência, Multibanco) | `https://www.diariamente.app/obrigado-aguardando-pagamento` |
| Aguardando análise de crédito (ex.: PayPal) | `https://www.diariamente.app/obrigado-aguardando-analise` |

Onde: **Produtos** > o produto Diariamente (7448309) > **Ferramentas** >
**Configurações de pagamento** > **Pós-venda** > "Onde será?" >
**Externa**, e uma URL em cada campo. É ação do dono, no painel.

Não se cadastram as rotas em espanhol: quem é de espanhol é levado para
elas na hora (seção 3).

## 3. Como o idioma é decidido

As três URLs da Hotmart (e o `/obrigado` antigo) passam pelo middleware,
que decide o idioma nesta ordem (`decidirObrigado`, função pura testada):

1. **`?off=` de uma oferta de um mercado só**, se a Hotmart mandar:
   `fhrttdh8` e `lf63bgdd` (real), `3n484jbe` (euro, Portugal) → pt;
   `iuoufnf6` (euro, Espanha) → es. A oferta diz o que foi pago **agora**,
   por isso vence o cookie, que pode ser de uma visita antiga. A
   `uevhmhy2` (dólar) é da América Latina **e** do "mundo": sozinha não
   decide, e os passos seguintes decidem.
2. **Cookie `dm_mercado`**: o mercado da última página de mercado aberta
   no site (seção 4). `br`, `pt` e `rw` → pt; `la` e `es` → es.
3. **`?lang=`** (links antigos do app: `/obrigado-aprovado?lang=es`).
4. **Idioma do navegador** (`Accept-Language`): `es*` → es; `pt*` → pt;
   outro idioma é pulado.
5. **País do IP** (`x-vercel-ip-country`), com as listas de
   `lib/mercado.ts` (as mesmas das homes): América Latina e Espanha → es;
   o resto → pt.
6. **pt**.

Se der espanhol, a resposta é um **307 para a rota em espanhol do mesmo
status, com todos os parâmetros** (`transaction`, `off`, `utm`...):
aprovado → `/es/gracias-aprobado`, aguardando pagamento →
`/es/gracias-pago-pendiente`, em análise → `/es/gracias-en-analisis`. Nas
rotas em espanhol **o caminho manda**: nada de `?lang=` nem navegador.

## 4. Cookie dm_mercado

Gravado pelo middleware sempre que uma página de mercado **abre**: as
homes (`/`, `/es`, `/es-es`, `/pt-pt`) e as páginas de venda (`/vendas`,
`/es/vendas`, `/es-es/vendas`, `/pt-pt/vendas`, `/mundo/vendas`). Guarda só
`br`, `la`, `es`, `pt` ou `rw`, por 30 dias, `Path=/`, `SameSite=Lax`,
`Secure`. Funcional, sem dado pessoal; está na Política de Privacidade
(pt e es, seção 8, versão lançada).

É outro cookie, de propósito: o `dm_market` é a **escolha** do seletor do
rodapé e decide para onde as homes levam; o `dm_mercado` só anota a visita
e não muda rota nenhuma. Nas páginas de venda e nas homes com prefixo o
valor depende só do caminho (não quebra cache: o `Cache-Control` delas
continua `s-maxage=3600`); na "/", `br` ou `rw` dependem do país e do
`dm_market`, que já estão no `Vary` da "/".

## 5. Mercado do pedido (Purchase, Pix e boleto)

`mercadoDoObrigado`: a oferta, quando vem, manda (a do dólar fica com a
América Latina na página em espanhol e com o "mundo" na em português).
Sem oferta: o cookie `dm_mercado` e depois o país do IP, **se forem do
idioma da página**; por fim, o mercado natural do idioma (pt → Brasil, es
→ América Latina). Exemplo: um brasileiro nos Estados Unidos lendo em pt,
sem cookie e sem oferta, é "mundo" (dólar).

- **Pix e boleto só para o mercado `br`.** Quem lê em português e paga em
  dólar (mundo) ou euro (Portugal) vê a linha geral ("Siga as instruções
  mostradas ao finalizar o pedido..."). Se a URL disser a forma
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
  produção de hoje. **Nas páginas do pós-pagamento** (as 8 e o
  `/obrigado`), a página lê antes a escolha gravada (`dm_cookies`): quem
  clicou em **Recusar** na vitrine não monta GA4 nem Pixel e o Purchase
  não sai. Aceitou ou não escolheu: monta como hoje. Nada de medição vai
  no HTML do servidor dessas páginas.

## 7. O que cada página mostra

**Aprovado** (o app é o motivo principal).

- **Celular**, uma coluna, nesta ordem: selo e título compactos, o cartão
  "Passo 2: Instale o app" com o botão da loja do aparelho (**aparece sem
  rolar** no iPhone de verdade: o Safari deixa uns 390 x 664 de área
  visível; o fundo do botão fica em 484 px em pt e 508 px em es, e em
  503 px a 360 x 640), a trilha de 3 marcos (status alinhados na base),
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
- O código de 6 dígitos **sem garantia absoluta**: o app manda o código ao
  WhatsApp da conta; sem telefone, ou se o WhatsApp falhar, manda um link
  de ativação ao e-mail (`/api/auth/activate-by-email` no app). O passo 3
  e o "Não recebeu?" falam dos dois caminhos.
- **"Abrir a versão web"** leva a `https://app.diariamente.club/ativar`
  (`?lang=es` em espanhol). Conferido em 28/10/2026: sem token, responde
  200 e o app abre direto "Ativar sua conta" (e-mail, senha nova e
  confirmação). No `/baixar`, a versão web é a raiz do app.

**Aguardando pagamento** e **Em análise**: a mesma moldura em dourado,
relógio, trilha no passo 2 e o que fazer enquanto isso.

Regras da marca nos textos (o teste confere): nunca "compra"/"comprar",
nenhum travessão, no máximo 1 emoji por página, frases curtas, nada que o
sistema não cumpra, sem dizer em que idioma chegam WhatsApp e e-mail e
sem garantir que o WhatsApp chega. Movimento só uma vez e nada com
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
confere que é igual):

| Idioma | App Store | Google Play |
|---|---|---|
| pt | `https://apps.apple.com/br/app/diariamente-sa%C3%BAde-mental/id6762151251` | `...details?id=club.diariamente.app&hl=pt-BR` |
| es | `https://apps.apple.com/mx/app/diariamente-salud-mental/id6762151251` | `...details?id=club.diariamente.app&hl=es` |

As quatro respondem 200 direto (28/10/2026). No celular o link abre a
loja do país da pessoa de qualquer jeito; o caminho só muda a vitrine e o
idioma da ficha no computador. O caminho antigo da Apple
(`/br/app/diariamente/id6762151251`, que dava 301) saiu do site todo, e o
teste confere que nenhum link de loja é escrito fora da fonte única.

## 10. Log de aprendizado

Não se sabe quais parâmetros a Hotmart acrescenta na URL de obrigado. Cada
página registra **uma linha** no log do servidor com o status, o idioma e
**só os nomes** dos parâmetros, em ordem alfabética. Valor nunca (pode ter
e-mail, nome ou telefone).

```
[obrigado] aprovado es parametros=off,transaction
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
- **Interface do app**: pt-BR e es, os mesmos dois idiomas do site; a
  versão web em espanhol abre com `?lang=es`.

## 12. Como testar

```
npm test
env -u DM_SITE_LANCADO SUPABASE_URL=https://exemplo.supabase.co SUPABASE_SERVICE_KEY=x npx next build
npx next start -p 4652
```

Redirecionamento das URLs da Hotmart (307, mantendo os parâmetros):

```
curl -sI -H "Cookie: dm_mercado=la" "http://localhost:4652/obrigado-aprovado?transaction=HPTESTE" | grep -i location
# location: /es/gracias-aprobado?transaction=HPTESTE
curl -sI "http://localhost:4652/obrigado-aguardando-pagamento?transaction=HPTESTE&off=iuoufnf6" | grep -i location
# location: /es/gracias-pago-pendiente?transaction=HPTESTE&off=iuoufnf6
curl -sI -H "x-vercel-ip-country: MX" -H "Accept-Language: en-US" "http://localhost:4652/obrigado-aguardando-analise?transaction=HPTESTE" | grep -i location
# location: /es/gracias-en-analisis?transaction=HPTESTE
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

- **Colar as 3 URLs na Hotmart** (seção 2). Ação do dono.
- **Descobrir o que a Hotmart manda na URL**: depois do primeiro
  pagamento real, filtrar `[obrigado]` nos Logs da Vercel. Se não vier
  `off`, a decisão fica com o cookie, o `?lang=`, o navegador e o país.
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
