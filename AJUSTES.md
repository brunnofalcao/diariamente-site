# Ajustes v3 — mobile-first + SEO/AEO/GEO/social

90% do tráfego é mobile. Desktop mantém splits, drift e glow.

## Design mobile-first
- **globals.css** (bloco "AJUSTES MOBILE-FIRST v3" no fim): CTA hero full-width; texto antes da imagem em todo \`.split\`; screenshots do app em escala natural (~250px); features em 2 colunas compactas; autores em media-object; glows/drift desligados <900px (GPU); seções 80→64px no mobile; stats 3-em-linha.
- **page.tsx**: logo do topo 72→48 (clamp no Brand.tsx); CTA "Quero começar" na nav (desktop); seção "Como você usa em 5 minutos" fundida no Método (faixa de chips); CTA intermediário após "Não é app de motivação"; resumo estruturado no bloco Sobre (GEO).
- **Sticky.tsx**: sticky CTA aparece quando o CTA do hero sai da tela e some enquanto #oferta está visível (não cobre mais o botão de compra).
- **FAQ.tsx**: animação por grid-rows — o max-height fixo (240px) cortava respostas longas no mobile.
- **HeroProvocacao.tsx**: typewriter inicia quando o card entra na viewport; botão **Compartilhar** (Web Share API, fallback copia link, UTM \`utm_campaign=provocacao_do_dia\`, evento \`share\`).

## SEO / AEO / GEO
- **layout.tsx**: title ~52 chars; meta description própria (~135 chars); FAQ schema alinhado 1:1 com o FAQ visível; Organization com \`sameAs\`; Person schema dos dois autores; favicon separado do OG.
- **robots.ts**: removido o Disallow das páginas de obrigado — elas já têm \`robots:{index:false}\`; bloquear no robots.txt impede o Google de LER o noindex.
- **config.ts**: \`f_auto,q_auto\` nas URLs Cloudinary (≈70% menos peso, LCP mobile); "Condição válida" (typo).

## Compartilhamento social
- **public/og-card.png** (1200×630): card estratégico — headline, app, 30% OFF, R$ 137,90, garantia. Referenciado por \`SITE.ogImage = "/og-card.png"\` (og:image, twitter:card, Product schema).

## Pendências (não alterado)
- Conferir parcelamento real na Hotmart antes de mudar "até 12x".
- Endereço da empresa nos legais (\`EMPRESA.endereco\`).
