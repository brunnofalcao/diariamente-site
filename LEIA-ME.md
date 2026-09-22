# Diariamente · página Em breve

5 arquivos. `tsc` limpo, `next build` com 27 rotas.
`/em-breve` sai estática, 3,65 kB.

```
app/em-breve/page.tsx           NOVO
components/EmBreve.tsx          NOVO
app/api/lista-espera/route.js   NOVO
lib/consentimento.ts            NOVO se ainda não subiu o ZIP legal-global
app/globals.css                 substitui · bloco novo no fim, nada removido
```

URL: `diariamente.app/em-breve`

---

## A COPY

```
EM BREVE

Ainda não é hoje.
Mas está perto.

O Diariamente está sendo preparado com o mesmo cuidado que ele vai
pedir de você: um passo de cada vez. Deixe seu contato e avisamos no
dia em que abrir.

Um texto por dia · Uma ação possível · Sem cobrança

[ Me avise quando abrir ]
```

Depois do envio:

```
Anotado.
Quando o Diariamente abrir, você fica sabendo primeiro, pelo WhatsApp
e pelo e-mail que deixou aqui. Até lá, sem pressa.
```

O que a página **não** tem, de propósito: contagem regressiva, "vagas
limitadas", "garanta já". Urgência artificial é vetada pelo brandbook, e
numa página cujo tema é paciência ela soaria como contradição.

Auditado no HTML: zero ocorrências de "a gente", travessão, "compra",
"vagas" e "garanta".

---

## PARA ONDE VAI O LEAD

Dois destinos, ao mesmo tempo:

| Destino | Função |
| --- | --- |
| Supabase `lista_espera` | fonte da verdade, com o registro do consentimento |
| RD Station | para disparar a comunicação de abertura |

A rota responde OK se **pelo menos um** aceitar. Isso é o que deixa a
página subir antes de a tabela existir: o token do RD já está na Vercel
(o fluxo de estudante usa o mesmo), então o lead não se perde no
primeiro dia.

No RD, a conversão entra como `diariamente-em-breve`, com as tags
`lista-espera` e `em-breve`, e `aceita-parceiros` quando a caixa for
marcada. Dá para trocar o identificador pela variável
`RD_CONVERSION_EM_BREVE`.

Não mexi em `lib/rdstation.js`: aquela função é do fluxo de estudante, e
alterá-la arriscaria o que já funciona.

### Tabela · rodar uma vez no Supabase

O SQL está no topo de `app/api/lista-espera/route.js`. Pontos:

- `email` é **UNIQUE na coluna**. É o que permite o upsert: quem se
  inscreve duas vezes atualiza em vez de duplicar, e não recebe dois
  avisos. Índice por expressão (`lower(email)`) não serve de alvo para o
  upsert do Supabase, por isso o e-mail já chega em minúsculas.
- `avisado_em` para marcar quem já recebeu o aviso de abertura.

---

## CONSENTIMENTO

- O motivo da coleta está escrito junto do botão: *"Usamos seus dados só
  para avisar sobre a abertura do Diariamente."* Enviar o formulário é o
  consentimento para essa finalidade.
- O compartilhamento com grupo, parceiros e patrocinadores é uma **caixa
  separada, desmarcada e opcional**, com o mesmo texto de
  `lib/consentimento.ts`. Verificado: nenhuma caixa pré-marcada.
- Grava versão do texto, data, origem e hash do IP.

---

## DETALHES

- **WhatsApp internacional:** DDI editável, padrão `55`. Com 55, máscara
  brasileira e exige 10 ou 11 dígitos; com outro DDI, aceita de 6 a 15.
- **noindex:** página de captura não disputa a busca com a página de
  vendas. Fica fora do mapa de rotas e do sitemap. É destino de campanha
  e link direto.
- **Pixel e GA:** dispara `Lead` e `generate_lead` só depois do OK do
  servidor, não no clique.
- **Enter** no teclado envia.

---

## CONFERIR DEPOIS DE SUBIR

1. Abra `diariamente.app/em-breve` e inscreva um e-mail seu.
2. Confira no RD Station a conversão `diariamente-em-breve`.
3. Rode o SQL e inscreva de novo: a linha aparece em `lista_espera`.
4. Inscreva o mesmo e-mail outra vez: continua **uma** linha só.
