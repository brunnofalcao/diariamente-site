# Diariamente · pacote consolidado

**30 arquivos.** Tudo o que mudou desde o ZIP-base que você me mandou
(`diariamente-site-main__4_`). `tsc` limpo, `next build` com 29 rotas.

**Este ZIP substitui TODOS os anteriores a partir daquela base:**
ajustes-favicon, centro, idiomas, rotas-es, legal-global e em-breve.
Se subir só este, está tudo certo. Se já subiu algum dos outros, este
sobrescreve com a mesma versão ou mais nova.

Suba mantendo os caminhos. Nada precisa ser deletado. São 16 arquivos
novos e 14 alterados, incluindo 3 imagens (`icon.png`, `icon.svg`,
`apple-icon.png`): confira que subiram.

---

## A MUDANÇA DESTA ENTREGA

| URL | Mostra | Google |
| --- | --- | --- |
| `diariamente.app` | **Em breve** (PT) | indexa |
| `diariamente.app/es` | **Próximamente** (ES) | indexa |
| `diariamente.app/embreve` | site de vendas (PT) | **noindex** |
| `diariamente.app/es/embreve` | site de vendas (ES) | **noindex** |
| `diariamente.app/em-breve` | redireciona para `/` | — |

### Por que a `/es` também virou "em breve"

O middleware manda todo navegador em espanhol para `/es`. Se ela
continuasse mostrando o site de vendas, **o site que você quer esconder
estaria público para todo o público hispânico.**

### O site de vendas em `/embreve`

- `noindex, nofollow`, fora do sitemap. Quem tem o link acessa normalmente.
- O seletor PT/ES dentro dele alterna entre `/embreve` e `/es/embreve`,
  sem jogar você de volta para a página de espera.
- Canonical próprio. O teste pegou um vazamento: o `layout.tsx` raiz
  declara `canonical: /`, e o Next herda metadata do layout. Sem a
  correção, `/embreve` diria ao Google que a home "em breve" é cópia do
  site de vendas. Corrigido e revalidado: canonical próprio, zero
  hreflang herdado.

### `/em-breve` (com hífen)

Existiu por algumas horas como endereço da lista. Agora redireciona para
a home com 307, então qualquer link que já tenha saído continua
funcionando.

### Lista de espera

A página agora é bilíngue. No RD Station, cada inscrição leva a tag
`idioma-pt` ou `idioma-es`: na abertura, cada lista recebe a mensagem no
idioma em que se inscreveu. Em espanhol o DDI vem vazio, porque o
público está espalhado por vinte países e um código pré-preenchido
errado é pior que nenhum.

---

## NO DIA DO LANÇAMENTO

Duas trocas, uma linha cada:

`app/page.tsx`
```tsx
import { Home } from "@/components/Home";
export default function Page() { return <Home lang="pt" />; }
```

`app/es/page.tsx`
```tsx
import { Home } from "@/components/Home";
export default function PaginaEs() { return <Home lang="es" />; }
```

Instruções também comentadas no topo dos arquivos.

---

## ⚠ ANTES DE SUBIR · leia isto

**Anúncios e links ativos apontando para a home vão cair na lista de
espera.** Bio do Instagram, campanhas no Meta, e-mails e QR codes que
levam a `diariamente.app` passam a mostrar "Ainda não é hoje". Se houver
campanha de venda rodando, troque o destino para `/embreve` ou pause
antes do deploy.

**O app já está nas lojas.** Quem já comprou e procurar o site vai ver
"Ainda não é hoje". Suporte, termos e privacidade continuam acessíveis
pelo rodapé.

---

## O QUE MAIS ESTÁ NESTE PACOTE

Resumo das entregas anteriores incluídas:

- **Texto do dia** buscado da API, com data e numeração só quando o
  texto é comprovadamente o do dia
- **Favicon** transparente, isotipo teal com piso de opacidade
- **Hero** centralizado no mobile (atalho `margin` que zerava o auto)
- **Faixa de confiança** em pílulas; rodapé com títulos teal e "Contato"
- **Árvore PT/ES** com slugs traduzidos, hreflang recíproco e sitemap
- **Middleware** de detecção de idioma
- **Políticas LGPD + RGPD** e termos com desistência de 14 dias na UE
- **Consentimento desagregado** em duas caixas desmarcadas
- **Formulário global de estudante** para Espanha e América Latina

---

## PENDÊNCIAS QUE CONTINUAM ABERTAS

| | O quê |
| --- | --- |
| **P0** | `EMPRESA.endereco` ainda é `[TROCAR]`, e as políticas o exibem |
| **P0** | Rodar o SQL de `lista_espera` (topo de `app/api/lista-espera/route.js`) |
| **P0** | Banner de cookies com opt-in: as políticas dizem que medição só roda com consentimento |
| **P1** | Rodar o SQL de `estudante_interesse` |
| **P1** | Abrir `diariamente.app/api/provocacao-do-dia` e ler o `motivo` |
