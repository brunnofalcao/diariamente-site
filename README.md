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

## ✅ CHECKLIST P0 — antes de publicar com tráfego (cabe a Brunno)
Estes itens dependem de dados/decisões suas e estão marcados no código:
1. **Links Hotmart reais** (`config.ts → HOTMART`) — Digital e Combo.
2. **Bio real da Roberta** (`config.ts → AUTORES.roberta.bio`).
3. **Screenshots reais do app** — substituir os `ImageSlot` por prints: Tela HOJE, DIAS, AÇÕES, Ofensiva/Ritmo, Conta/WhatsApp + retratos dos autores e foto lifestyle. (Passar `src` no `ImageSlot`.)
4. **Confirmar "+5.000 pessoas"** — prova real, documentada e defensável (`config.ts → PROVA`).
5. **Página /obrigado** apontada na Hotmart (redirect pós-compra).
6. **Conferir** que a oferta Digital/Combo bate com o que a Hotmart entrega.
7. *(Opcional, recomendado)* **Endereço da empresa** nos legais (`config.ts → EMPRESA.endereco`).

### ✅ Já resolvido nesta entrega
- **Dados da empresa:** Science Play Cursos LTDA · CNPJ 33.612.911/0001-29 (no rodapé e nos legais).
- **Termos de Uso e Política de Privacidade reais** (não mais modelo-marcação): escritos cobrindo Apple App Store 5.1.1 (dados coletados, uso, retenção, revogação de consentimento, ATT, SDKs terceiros) e LGPD (bases legais art. 7º, direitos do titular, encarregado/DPO, segurança) + CDC (art. 49, foro do consumidor). **Recomendação: revisão final por advogado antes de tráfego pesado** — o texto é sólido e válido para publicação/submissão, mas eu não sou advogado.
- **Rodapé:** logo com espaçamento maior + site, Instagram e LinkedIn da Science Play.

### Nota sobre streak/constância (importante)
Os testers relataram bugs no motor de constância (streak reiniciando, dias não refletindo no calendário). **Por isso, as promessas absolutas de sequência foram suavizadas** para linguagem de jornada ("acompanha sua jornada de constância", "registra o dia") em vez de garantias operacionais ("sua sequência avança"). Quando o motor estiver blindado, dá pra voltar a uma copy mais assertiva. Nos screenshots, evitar streaks exagerados que choquem com o estado atual do app.

## ⚠️ O QUE FALTA PREENCHER — tudo isolado em `config.ts`

Nada foi inventado. Os pontos abaixo estão marcados como `[TROCAR_...]` no código:

| Onde | Variável | Status |
|---|---|---|
| `config.ts` → `HOTMART.digital` / `HOTMART.combo` | Links de checkout Hotmart | **Pendente** — colar os 2 links (formato `https://pay.hotmart.com/XXXX?checkoutMode=10`). Enquanto começar com `[`, o botão avisa "em configuração". |
| `config.ts` → `EMPRESA.razaoSocial` / `EMPRESA.cnpj` | Razão social + CNPJ Science Play | **Pendente** — colar dados oficiais (não inventei documento). |
| `config.ts` → `AUTORES.roberta.bio` | Bio + papel da Roberta | **Pendente** — Brunno confirma |
| `config.ts` → `TRACKING` | Meta Pixel / GA4 / GTM IDs | **Pendente** — fase de tracking |
| `config.ts` → `LOGOS` / `SITE.ogImage` | URLs Cloudinary | Confirmar se os paths batem com a conta real |

## Configuração da Hotmart (pós-código)
1. No produto da Hotmart, copie o **link de checkout** de cada oferta (Digital e Combo) → cole em `config.ts → HOTMART`.
2. Em **Configurações → Página de obrigado**, aponte para `https://diariamente.club/obrigado` (a página já existe e foca em ativação imediata).
3. As **UTMs são preservadas automaticamente** da página de venda até o checkout (helper `buildCheckoutUrl`).
4. Webhooks (compra aprovada / boleto-pix pendente / reembolso / chargeback) → fase de tracking.

## Páginas já criadas
- `/` — página de venda
- `/obrigado` — confirmação + ativação (abrir app, fazer Dia 1) · linguagem Apple-safe ("e-mail de acesso")
- `/termos` — Termos de Uso (modelo-base — **revisar com advogado**)
- `/privacidade` — Política de Privacidade LGPD (modelo-base — **revisar com advogado**)
- `/robots.txt` e `/sitemap.xml` — gerados dinamicamente (App Router)

## Design v2 — padrão Apple/Oura (responsivo)
- Layout fluido com 3 larguras de container (showcase 1120px / leitura 680px / foco 560px).
- Hero desktop em 2 colunas (copy + mockup grande); mobile empilha.
- Seções `split` alternadas (esquerda/direita), tipografia serifada fluida (até 80px no desktop).
- Oferta com 2 planos lado a lado no desktop, empilhados no mobile.
- Top nav sticky (com CTA no desktop) + sticky CTA no rodapé (mobile).
- **Reveal-on-scroll é progressive enhancement**: conteúdo visível por padrão, anima só com JS, com rede de segurança de 2,5s. Se o JS falhar, nada some.
- Validado com screenshots reais em 1440px e 390px.

## Slots de imagem (marcação onde entram assets reais)
Componente `ImageSlot` em `components/Brand.tsx`. Cada slot mostra tag + descrição + dimensão recomendada. Para publicar a imagem real, passe `src` (e `alt`). Slots marcados na página:
- **Lifestyle** (seção "virada") — foto livro à meia-luz · 1200×1500px (4:5)
- **Screenshot HOJE** e **Screenshot DIAS** — prints reais do app · 1170×2532px
- **Foto Brunno** e **Foto Roberta** — retratos · 1000×1000px (quadrado)

## SEO / GEO
- Meta title/description, Open Graph, Twitter card, canonical.
- JSON-LD: Product + Offer + FAQPage + Organization.
- Bloco factual "Sobre o Diariamente" (GEO, lido por mecanismos de IA).
- sitemap.xml + robots.txt (página `/obrigado` fora do índice).

## Performance
- CSS ~2,8 KB gzip · First Load JS ~91,7 KB · 0 imagens locais · mockup do app é CSS puro (LCP instantâneo).
- Fontes com `display=swap` + preconnect.
- **Otimização recomendada na Vercel:** trocar o `<link>` do Google Fonts por `next/font/google` (self-host automático, remove o request render-blocking). Não foi aplicado no código porque o ambiente de build local bloqueia o fetch de fontes; na Vercel funciona e melhora o score de fontes. Exemplo no fim deste README.

### Como aplicar next/font (na Vercel)
```tsx
// app/layout.tsx
import { Inter, Instrument_Serif } from "next/font/google";
const inter = Inter({ subsets:["latin"], weight:["400","500","600","700","800"], variable:"--font-inter", display:"swap" });
const serif = Instrument_Serif({ subsets:["latin"], weight:"400", variable:"--font-instrument", display:"swap" });
// <html className={`${inter.variable} ${serif.variable}`}>  e remover o <link> do Google Fonts
// no globals.css: --font-sans: var(--font-inter), system-ui, sans-serif;  --font-serif: var(--font-instrument), Georgia, serif;
```


## Valores JÁ confirmados (por Brunno, jun/2026)
- Digital: **R$ 147** · Combo (livro+app): **R$ 247** · livro avulso R$ 149 (âncora)
- Prova: **+5.000 pessoas** · Garantia: **7 dias** · Escassez: combo com poucas unidades
- Checkout: **Hotmart** · Suporte: **contato@scienceplay.com**

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
