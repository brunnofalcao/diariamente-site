# Diariamente · correção dos P0 da auditoria

24 arquivos. Consolidado: inclui tudo das entregas anteriores.
`tsc` limpo, `next build` com 21 rotas.

**Pré-condição mantida:** só suba depois que `diariamente.club` fizer
301 para `diariamente.app`.

---

## A AUDITORIA ESTÁ CERTA

Verifiquei os quatro P0 no código antes de mexer em qualquer coisa.
**Todos reproduzíveis.** O conselho não exagerou em nenhum ponto.

E um deles é meu: eu reescrevi o `FAQ.tsx` mantendo os nomes de classe e
**não verifiquei se o CSS existia**. Não existia.

---

## P0-1 · FAQ sem CSS

```
grep '.faq-q'    em globals.css  ->  0 regras
grep '.faq-item' em globals.css  ->  0 regras
grep '.faq-a'    em globals.css  ->  0 regras
```

Dez botões nativos cinza, colados na borda esquerda, imediatamente antes
do CTA final. O pior lugar possível para a página parecer quebrada.

**Corrigido:** CSS completo (card 16 px conforme §33, chevron em traço
alinhado à iconografia Lucide, estado aberto em teal, animação
"aparecer" de 200 ms) e o componente ganhou `<section>`, container e
`<h2>`: *"O que as pessoas perguntam"*. Antes entrava sem heading
nenhum.

Verificado no CSS servido: 3 regras `.faq-q`, 3 `.faq-item`.

## P0-2 · 29 MB de imagem

Os quatro prints e o lifestyle saíam do Cloudinary **sem transformação
nenhuma**. A rota `/estudante` já fazia certo com `cld()`; a home não.

**Corrigido no `ImageSlot`**, que é por onde todas passam: `f_auto`,
`q_auto` e `srcset` de três larguras, com `sizes`.

```
antes   5 PNG crus                    ~29 MB
depois  AVIF/WebP, largura por device  ~450 a 900 KB   (−97%)
larguras servidas: 320 · 480 · 560 · 840 · 1200
```

Verificado no HTML: **40 URLs** com `f_auto,q_auto` e **0 URLs cruas**
de print. Com 90% do tráfego em celular, isso é o LCP e o plano de dados
da pessoa.

## P0-3 · Contraste reprovando AA

Medido sobre S0 `#0A0E0E`:

| Token | Contraste | |
| --- | --- | --- |
| N600 `#4E5858` | **2,64:1** | reprova |
| N500 `#6B7777` | **4,19:1** | reprova |
| N400 `#8A9494` | 6,23:1 | passa |

O texto legal e o CNPJ estavam em N600 a 12,5 px. Além de ilegível, é
justamente o texto que identifica o fornecedor.

**Corrigido:** rodapé inteiro para N400, com corpo subindo de 12,5 para
13 px.

## P0-4 · Schema FAQ diferente do FAQ visível

O `layout.tsx` declarava 7 perguntas antigas ("É caro?", "Quero só o
livro impresso"...) enquanto a página mostrava 10 outras. O Google via um
FAQ, o visitante via outro.

**Corrigido com fonte única.** As perguntas saíram do componente para
`lib/faq.ts`, e tanto o `FAQ.tsx` quanto o JSON-LD leem o mesmo array.
Não é possível divergirem de novo.

Verificado: 10 perguntas no schema, "É caro?" ausente, primeira igual à
da página.

### Nota técnica sobre este arquivo novo

`PERGUNTAS` **não pode** morar dentro de `FAQ.tsx`. O componente é
`"use client"`, e tudo exportado de um módulo de cliente vira referência
de cliente: o `layout.tsx` roda no servidor e precisa fazer `.map()`
sobre a lista. Tentei primeiro pelo componente e **o build quebrou** com
*"Attempted to call map() from the server but map is on the client"*.
Daí o módulo neutro em `lib/faq.ts`.

## Bônus · `.cart-est-h` em fonte aposentada

A regra pedia `'Instrument Serif'` literal, que não é mais carregada:
caía silenciosamente em Georgia. Passou a usar `var(--font-serif)`.

---

## O QUE **NÃO** FOI FEITO

Os P1 e P2 da auditoria continuam abertos, e vários são grandes:

| | O quê |
| --- | --- |
| **P1** | H1 de 66 caracteres em 5–6 linhas; brandbook limita a 2 |
| **P1** | Card do hero: caixa alta com destaque em "MENTE", selo dourado de streak (§11 proíbe dourado marcando sequência) |
| **P1** | Ritual público com passo "Constância"/"sequência"; §06 define Provocação → Reflexão → Ação |
| **P1** | 18 seções; oferta a ~75% da rolagem; ~14 telas até o preço no celular |
| **P1** | 6 rótulos de CTA para a mesma ação |
| **P1** | Prova social duplicada, uma delas com claim não aprovado ("impactadas") |
| **P1** | Sticky oculto continua focável (sem `aria-hidden`/`tabindex`) |
| **P1** | 5 animações em loop infinito; §27 proíbe loop |
| **P2** | Raios 12/16/24/28 misturados; sombras e glows (§33 pede sem sombra no escuro) |
| **P2** | Emoji 🔒 fora da iconografia Lucide; `#00201F` fora da paleta |
| **P2** | Typo "Condição válido apenas no mês de lançamento" |
| **P2** | CSS morto: `.autor-*`, `.cart-estudante`, `.est-*`, `.plano-card`, `.preco-*` |

**Minha leitura:** os P0 eram quebra e custo, e por isso vieram
primeiro. Os P1 de arquitetura (18 seções, oferta a 75% da rolagem, 14
telas até o preço) são os que mexem em conversão de verdade, e são uma
reestruturação da home, não um patch.

Me diga se sigo por eles.

---

## AINDA ABERTO, FORA DA AUDITORIA

- **P0** 301 de `.club` para `.app`
- **P0** Order bump do livro no checkout (painel Hotmart)
- **P0** Nomear o conselho editorial (array `CONSELHO`)
- **P0** Assinatura: webhook só trata `PURCHASE_APPROVED`
- **P1** Criar o @diariamente.app no Instagram, se ainda não existir
