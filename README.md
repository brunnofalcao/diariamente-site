# Diariamente — Página de Venda (Next.js / Vercel)

Página de venda do Diariamente. Dark mode 100%, mobile-first, fiel ao **Brandbook IDV v1.0**.
Build validado (`next build` ✓). Stack: Next.js 14 (App Router) + TypeScript, sem dependências pesadas.

## Rodar local
```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # validar produção
```

## Deploy na Vercel
1. Suba a pasta num repositório (GitHub é a fonte da verdade).
2. Import no painel da Vercel → framework detectado automaticamente (Next.js).
3. Domínio: `diariamente.club`.

---

## ⚠️ O QUE FALTA PREENCHER — tudo isolado em `config.ts`

Nada foi inventado. Os pontos abaixo estão marcados como `[TROCAR_...]` no código:

| Onde | Variável | Status |
|---|---|---|
| `config.ts` → `PLANOS[].checkoutUrl` | Links de checkout (Digital e Combo) | **Pendente** — definir plataforma (Hotmart/Kiwify/Stripe) e colar os links. Enquanto isso, o botão avisa "checkout em configuração" em vez de quebrar. |
| `config.ts` → `AUTORES.roberta.bio` | Bio + papel da Roberta no conteúdo | **Pendente** — Brunno confirma |
| `config.ts` → `TRACKING` | Meta Pixel / GA4 / GTM IDs | **Pendente** — fase de tracking |
| `config.ts` → `LOGOS` / `SITE.ogImage` | URLs Cloudinary | Confirmar se os paths batem com a conta real |

## Valores JÁ confirmados (por Brunno, jun/2026)
- Digital: **R$ 147** · Combo (livro+app): **R$ 247** · livro avulso R$ 149 (usado como âncora)
- Prova: **+5.000 pessoas**
- Garantia: **7 dias**
- Escassez: combo com **poucas unidades** (lançamento)

## Regras do projeto respeitadas
- ✅ **Nunca "compra" na UI** — usa "e-mail de acesso" / "Quero meu acesso" (regra App Store).
- ✅ **Logo oficial no topo** (Wordmark com logomark SVG do brandbook).
- ✅ Tokens de cor/tipografia/spacing espelhados do brandbook (`globals.css :root`).
- ✅ Sem botão morto: checkout não-configurado é interceptado.
- ✅ SEO + GEO: meta tags, Open Graph, JSON-LD (Product, FAQPage, Organization) no `layout.tsx`.
- ✅ Slots de tracking via `dataLayer.push` (ClickCTA, InitiateCheckout, FAQClick) prontos pro GTM.

## Próxima fase (quando quiser)
Tracking completo (GTM + Pixel + GA4 com PageView/ViewContent/InitiateCheckout/Purchase),
preservação de UTMs, integração real do checkout, página `/obrigado`, recuperação de carrinho.
Falta também criar `/termos` e `/privacidade` (os links já existem no rodapé).
