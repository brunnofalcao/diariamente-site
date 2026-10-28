# Pós-pagamento: páginas de obrigado e /baixar

O que a pessoa vê no segundo em que paga, em cada idioma, e o que cada
parte faz. Código: `lib/obrigado.mjs` (regras), `lib/obrigado-textos.mjs`
(textos), `components/PaginaObrigado.tsx`, `components/ObrigadoShell.tsx`,
`components/PosPagamento.tsx`, `components/BaixarApp.tsx`,
`components/pos-pagamento.css` e `middleware.ts`. Testes:
`testes/obrigado.test.mjs`.

## 1. As três URLs para colar na Hotmart

A "Página de obrigado externa" da Hotmart é configurada **por produto**
(7448309), não por oferta nem por idioma. Por isso vão **as três URLs sem
prefixo**, as mesmas para todos os mercados:

| Status na Hotmart | URL |
|---|---|
| Compra aprovada | `https://www.diariamente.app/obrigado-aprovado` |
| Aguardando pagamento (boleto, Pix, OXXO, transferência, Multibanco) | `https://www.diariamente.app/obrigado-aguardando-pagamento` |
| Aguardando análise de crédito (ex.: PayPal) | `https://www.diariamente.app/obrigado-aguardando-analise` |

Onde: **Produtos** > o produto Diariamente > **Ferramentas** >
**Configurações de pagamento** > **Pós-venda** > "Onde será?" >
**Externa**, e uma URL em cada campo.

Quem não lê em português do Brasil é levado na hora para a versão do seu
idioma (seção 2). Não é preciso cadastrar as versões com prefixo.

## 2. Como o idioma é decidido

As URLs sem prefixo (e o `/obrigado` antigo) passam pelo middleware, que
decide o idioma nesta ordem (`decidirObrigado`):

1. **Cookie `dm_mercado`**: o mercado da última página de mercado que a
   pessoa abriu no site (seção 3). É o sinal mais fiel do idioma em que ela
   leu antes de pagar.
2. **`?off=` da oferta**, se a Hotmart mandar: `iuoufnf6` → Espanha,
   `3n484jbe` → Portugal, `fhrttdh8` e `lf63bgdd` → Brasil. A `uevhmhy2`
   (dólar) é da América Latina **e** do "mundo": sozinha não decide, só
   limita a escolha a espanhol latino ou português do Brasil, que o passo 3
   ou o 4 fazem.
3. **`?lang=`** (links antigos do app: `/obrigado-aprovado?lang=es`).
4. **Idioma do navegador** (`Accept-Language`): `es-ES` → Espanha; outro
   espanhol → América Latina; `pt-PT` → Portugal; o resto → pt-BR.

Se não for pt-BR, a resposta é um **307 para a versão com prefixo, com
todos os parâmetros** (`transaction`, `off`, `utm`...). O mercado "mundo"
(rw) lê as páginas em pt-BR.

| Local | Aprovado | Aguardando pagamento | Em análise | Baixar |
|---|---|---|---|---|
| pt-BR (Brasil e mundo) | `/obrigado-aprovado` | `/obrigado-aguardando-pagamento` | `/obrigado-aguardando-analise` | `/baixar` |
| América Latina | `/es/obrigado-aprovado` | `/es/obrigado-aguardando-pagamento` | `/es/obrigado-aguardando-analise` | `/es/baixar` |
| Espanha | `/es-es/obrigado-aprovado` | `/es-es/obrigado-aguardando-pagamento` | `/es-es/obrigado-aguardando-analise` | `/es-es/baixar` |
| Portugal | `/pt-pt/obrigado-aprovado` | `/pt-pt/obrigado-aguardando-pagamento` | `/pt-pt/obrigado-aguardando-analise` | `/pt-pt/baixar` |

Nas rotas com prefixo **o caminho manda**: nada de `?lang=` nem de
navegador. Todas são `noindex, nofollow`, com canonical para si e fora do
sitemap.

## 3. Cookie dm_mercado

Gravado pelo middleware sempre que uma página de mercado **abre**: as
homes (`/`, `/es`, `/es-es`, `/pt-pt`) e as páginas de venda (`/vendas`,
`/es/vendas`, `/es-es/vendas`, `/pt-pt/vendas`, `/mundo/vendas`). Guarda só
`br`, `la`, `es`, `pt` ou `rw`, por 30 dias, `Path=/`, `SameSite=Lax`,
`Secure`. Funcional, sem dado pessoal; está na Política de Privacidade
(pt e es, seção 8).

É outro cookie, de propósito: o `dm_market` é a **escolha** do seletor do
rodapé e decide para onde as homes levam; o `dm_mercado` só anota a visita
e não muda rota nenhuma. Nas páginas de venda e nas homes com prefixo o
valor depende só do caminho (não quebra cache); na "/", `br` ou `rw`
dependem do país e do `dm_market`, que já estão no `Vary` da "/".

## 4. O que cada página mostra

**Aprovado** (o app é o motivo principal): selo com o check que se desenha
e os raios do sol da marca, trilha de 3 marcos (pagamento feito, instalar
o app agora, criar a senha a seguir), o cartão de instalar pelo aparelho,
os 3 passos da senha com o chip que imita o botão exato do app ("Primeiro
acesso? Ativar conta" / "¿Primer acceso? Activar cuenta"), o aviso do
WhatsApp (verde discreto, sem prometer que chega), a tela real do app,
"Não recebeu?" (abre e fecha), a versão web (espanhol com `?lang=es`) e o
atendimento.

**Aguardando pagamento** e **Em análise**: a mesma moldura em dourado,
relógio, trilha no passo 2 e o que fazer enquanto isso. Pix e boleto só
no Brasil; se a URL disser a forma (`payment_type` ou `payment_method`),
só a orientação dela; outra forma, só a linha geral. Fora do Brasil, a
linha geral do local (OXXO e transferência na América Latina, Multibanco
em Portugal).

Movimento só uma vez (nada em laço), e nada com
`prefers-reduced-motion`. Contraste AA, foco visível, alvos de 44 px,
360 px sem rolagem lateral.

## 5. Aparelho e /baixar

O servidor lê o user-agent (`aparelhoDoUserAgent`):

- **iPhone, iPad, iPod**: botão grande da App Store e "Usa Android?" discreto.
- **Android**: o inverso.
- **Computador ou desconhecido**: QR code + as duas lojas. O QR abre o
  `/baixar` do idioma no celular.

O iPad com iPadOS 13 ou mais novo se apresenta como Mac no Safari e cai
em "computador": vê o QR e as duas lojas, que também funcionam.

No `/baixar` (e `/es/baixar`, `/es-es/baixar`, `/pt-pt/baixar`) o celular
nem vê a página: o middleware manda **302** direto para a loja do idioma.
Computador, aparelho desconhecido e robô veem a página.

**QR codes**: `public/qr/baixar-pt.svg`, `baixar-es.svg`,
`baixar-es-es.svg` e `baixar-pt-pt.svg`, gerados uma vez e versionados.
Para regenerar (só se o domínio mudar):

```
npx --yes qrcode@1.5.4 -t svg -e M -q 2 -d 0A0E0EFF -l FFFFFFFF \
  -o public/qr/baixar-es.svg "https://www.diariamente.app/es/baixar"
```

Em 28/10/2026 os quatro foram decodificados com o jsQR 1.4.0 (leitor
independente do gerador), e cada um deu a URL do seu `/baixar`.

## 6. Lojas por idioma

Um app só para todos os países (App Store `id6762151251`, Google Play
`club.diariamente.app`). A fonte única é `LOJAS_DO_LOCAL`, em
`lib/i18n.ts`:

| Local | App Store | Google Play |
|---|---|---|
| pt | `/br/app/diariamente-sa%C3%BAde-mental/id6762151251` | `&hl=pt-BR` |
| pt-pt | `/pt/app/diariamente-sa%C3%BAde-mental/id6762151251` | `&hl=pt-PT` |
| es | `/mx/app/diariamente-salud-mental/id6762151251` | `&hl=es` |
| es-es | `/es/app/diariamente-salud-mental/id6762151251` | `&hl=es` |

No celular o link abre a loja do país da pessoa de qualquer jeito; o
caminho só muda a vitrine e o idioma da ficha no computador. O caminho
antigo da Apple (`/br/app/diariamente/id6762151251`) dava 301 e saiu de
todo o site. `LOJAS`, em `config.ts`, repete o pt (o JSON-LD do layout e
o rodapé leem de lá) e o teste confere que é igual.

## 7. Log de aprendizado

Não se sabe quais parâmetros a Hotmart acrescenta na URL de obrigado. Cada
página registra **uma linha** no log do servidor com o status, o local e
**só os nomes** dos parâmetros, em ordem alfabética. Valor nunca (pode ter
e-mail, nome ou telefone).

```
[obrigado] aprovado es parametros=off,transaction
```

Na Vercel: projeto > **Logs**, filtrar por `[obrigado]`. Quando aparecer
um nome útil (por exemplo a forma de pagamento ou a moeda), a regra entra
em `lib/obrigado.mjs` com teste.

## 8. Purchase (Meta Pixel e GA4)

Só na aprovada. Moeda e valor do mercado do pedido (`mercadoDoObrigado`):
a oferta `?off=`, quando vem, manda (a do dólar fica com a América Latina
nas páginas em espanhol e com o mundo nas em português); sem ela, o cookie
`dm_mercado` do mesmo idioma; senão, o mercado do caminho. O valor sai de
`config/pricing.ts` (`valorDoPedido`: o preço da oferta paga, ou o preço
de agora do mercado). O valor que vier na URL só é usado na mesma moeda:
no Brasil sempre (a não ser que a URL diga outra moeda); fora dele, só se
a URL disser a moeda e ela for a do plano. `transaction` vira o
`eventID`. Continua dependendo do aceite no aviso de cookies com a chave
de lançamento ligada.

## 9. O que depende do app (não do site)

- **WhatsApp na hora**: o webhook do app cria a conta sem senha e manda o
  modelo `diariamente_acesso_assinatura`, **só** se o pagamento trouxe
  telefone válido. Hoje só o pt_BR está aprovado na Meta; a versão em
  espanhol está pronta no app (`command-center/wa-boas-vindas.js`) mas não
  foi criada na Meta, e a conta em espanhol recebe o pt_BR. Por isso a
  página não diz em que idioma a mensagem chega nem garante que ela chega.
- **E-mail de acesso** (RD Station): só em português hoje.
- **Interface do app**: só pt-BR e es (Portugal vê pt-BR). Por isso o chip
  de pt-pt usa o rótulo do pt-BR, e a versão web em espanhol abre com
  `?lang=es`.

## 10. Como testar

```
npm test
env -u DM_SITE_LANCADO SUPABASE_URL=https://exemplo.supabase.co SUPABASE_SERVICE_KEY=x npx next build
npx next start -p 4641
```

Redirecionamento das URLs da Hotmart (307, mantendo os parâmetros):

```
curl -sI -H "Cookie: dm_mercado=la" "http://localhost:4641/obrigado-aprovado?transaction=HPTESTE&off=uevhmhy2" | grep -i location
# location: /es/obrigado-aprovado?transaction=HPTESTE&off=uevhmhy2
curl -sI -H "Accept-Language: es-ES" "http://localhost:4641/obrigado-aguardando-pagamento?transaction=HPTESTE" | grep -i location
# location: /es-es/obrigado-aguardando-pagamento?transaction=HPTESTE
```

`/baixar` no celular (302 para a loja do idioma):

```
curl -sI -A "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)" http://localhost:4641/pt-pt/baixar | grep -i location
curl -sI -A "Mozilla/5.0 (Linux; Android 14; Pixel 8)" http://localhost:4641/es/baixar | grep -i location
```

O log aparece no terminal do `next start` a cada página de obrigado aberta.
