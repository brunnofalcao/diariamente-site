# Diariamente · versão auditada para publicação

> **Virada de lançamento (out/2026, branch `claude/site-lancamento`).**
> A partir dela, o que vale é esta caixa; o resto do arquivo é o histórico
> da entrega "em breve".
>
> | URL | Mostra |
> | --- | --- |
> | `diariamente.app` | **site de vendas** (PT), indexável |
> | `diariamente.app/es` | **Próximamente** (ES), sem mudança |
> | `/embreve` | redireciona para `/` |
> | `/es/embreve` | redireciona para `/es` |
>
> - **Endereço da empresa:** fica só em `ENDERECO_DA_EMPRESA`, no
>   `config.ts`. Enquanto ele tiver `[TROCAR` em qualquer parte, o `npm run build`
>   falha de propósito, com a explicação. Para testar o build sem o
>   endereço real: `DM_ENDERECO_TESTE="Rua de Teste, 123" npm run build`
>   (recusado em produção na Vercel). `npm test` roda os testes da trava.
> - **Cookies:** aviso com Aceitar e Recusar (`components/Consentimento.tsx`).
>   GA4, Pixel da Meta e o evento de Purchase só carregam depois do
>   Aceitar; a escolha fica 6 meses no cookie `dm_cookies`. A Política
>   (seção 8, pt e es) descreve exatamente isso.
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
