# Diariamente · mercados por geografia · SUBSTITUI o ZIP anterior

16 arquivos. `tsc` limpo, `next build` com **34 rotas**.

**Descarte o `diariamente-mercados.zip` anterior.** Ele tinha um erro
grave, descrito abaixo.

---

## ⚠ O ERRO QUE VOCÊ PEGOU COM A PERGUNTA

Você perguntou se o site continuava oculto. Fui verificar no HTML e a
resposta era **não**.

As rotas `/pt-pt` e `/es-es` que criei renderizavam o **site de vendas
completo**, com `index, follow`. E o middleware novo manda todo
visitante de Portugal e da Espanha direto para elas. Na prática, o site
que você quer esconder entraria no ar para dois países inteiros, e
indexável.

Eu construí o roteamento por mercado olhando o handoff, que descreve o
estado de lançamento, e não o estado de hoje, que é site oculto. Erro
meu.

### Como ficou

| Rota | Mostra | Robots |
| --- | --- | --- |
| `/` | lista de espera | indexa |
| `/es` | lista de espera | indexa |
| `/pt-pt` | lista de espera | indexa |
| `/es-es` | lista de espera | indexa |
| `/embreve` | vendas · R$ 149,90 | **noindex** |
| `/es/embreve` | vendas · US$ 24.99 | **noindex** |
| `/pt-pt/embreve` | vendas · 29,99 € | **noindex** |
| `/es-es/embreve` | vendas · 29,99 € | **noindex** |

As quatro homes públicas mostram a lista de espera, cada uma no seu
idioma. As quatro prévias de venda, uma por mercado, ficam em `/embreve`
e só abrem para quem tem o link. Sitemap com 14 URLs, nenhuma de venda.

**Respondendo direto: sim, pode subir só este ZIP, e o site continua
oculto.**

---

## NA VIRADA DE LANÇAMENTO

Quatro arquivos, duas linhas cada. As instruções estão comentadas no
topo de cada um:

```
app/page.tsx         <EmBreve lang="pt" />  →  <Home lang="pt" mercado="br" />
app/es/page.tsx      <EmBreve lang="es" />  →  <Home lang="es" mercado="la" />
app/pt-pt/page.tsx   <EmBreve lang="pt" />  →  <Home lang="pt" mercado="pt" />
app/es-es/page.tsx   <EmBreve lang="es" />  →  <Home lang="es" mercado="es" />
```

Não precisa mexer em componente, nem em preço, nem em rota.

---

## O RESTO DA ENTREGA

Executa a seção 13, passo 2 do handoff.

**Dois eixos.** Idioma define o conteúdo, geografia define a oferta,
pelo cabeçalho `x-vercel-ip-country`. Português tem duas moedas e
espanhol tem duas: idioma sozinho nunca decidiria moeda.

**Simulação por país**, rodada contra o build:

| Visitante | Mercado | Vai para | Manchete | Total |
| --- | --- | --- | --- | --- |
| Brasileiro | br | `/` | R$ 12,49/mês | R$ 149,90 |
| Português | pt | `/pt-pt` | 2,50 €/mês | 29,99 € |
| Espanhol | es | `/es-es` | 2,50 €/mes | 29,99 € |
| México, Argentina, Chile | la | `/es` | US$ 2.08/mes | US$ 24.99 |
| EUA, Alemanha, Angola | rw | `/` | US$ 2,08/mês | US$ 24,99 |

`es-419` com ponto decimal, porque o México lê vírgula como separador de
milhar. `rw` com vírgula, porque a página é em português.

**Três vazamentos de preço**, achados pelo teste que lê o HTML:

1. Barra fixa do rodapé com `R$ 197` e `R$ 137,90` escritos à mão.
2. `finNote` no dicionário, com o preço dentro da string.
3. **Schema do FAQ**, o pior: o JSON-LD é declarado no layout raiz, que
   é global e não conhece o mercado, então o preço em real ia para três
   dos quatro mercados dentro do dado estruturado que o Google lê. Esse
   não aparece na tela.

Resultado: um preço por mercado, zero vazamento.

**hreflang** nas quatro homes, recíproco, com `x-default` no Brasil:
`pt-BR`, `pt-PT`, `es-ES`, `es-419`.

**Middleware**: só as homes decidem, `?mercado=xx` grava cookie e vence
o IP, robô nunca é redirecionado, `Vary` com país, idioma e cookie.
No Next.js 16 o arquivo passa a se chamar `proxy.ts`; hoje o projeto
está no 14.2.35.

**Seletor de mercado no rodapé**, com Brasil, Portugal, España e
América Latina.

---

## PREENCHER ANTES DO GO-LIVE

`config/pricing.ts`, cinco campos `[PREENCHER]`: os três links de
checkout, o código do cupom e a data de término. Com o link vazio o
botão fica desabilitado e mostra aviso em âmbar.

`br.lancamento.ativo` está `false`: a página mostra R$ 149,90. Vire
para `true` só depois de confirmar que o link com cupom abre o checkout
em R$ 119,92.

`br.renovaMesmoValor` está `false` pela pendência da seção 14. Com
`false`, a promessa sai da página sozinha.

`la` e `es` estão com `vendaAberta: false`, conforme a seção 9.

---

## CONFERIR DEPOIS DE SUBIR

1. `diariamente.app` mostra a lista de espera.
2. `diariamente.app/pt-pt` e `/es-es` mostram a lista de espera, não
   preço. **Este é o teste que importa agora.**
3. `/pt-pt/embreve` mostra 29,99 € e `/es/embreve` mostra US$ 24.99.
4. `diariamente.app/sitemap.xml` com 14 URLs, nenhuma com "embreve".
5. Com VPN em Portugal, a raiz leva a `/pt-pt` e mostra a lista de
   espera em português.
