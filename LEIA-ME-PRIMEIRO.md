# Pacote estudante · v2 · 19/ago/2026

Repositório: **brunnofalcao/diariamente-site**
Base: commit **2b058d7** (o seu design novo, o mesmo do ZIP que você enviou).
Build validado localmente: `next build` passou, 16 páginas, todas as rotas.

> **Este pacote substitui a v1.** A v1 tinha sido montada sobre o commit
> anterior (766f8a3) e o `config.ts` dela apagaria seu OG card novo e as
> otimizações do Cloudinary. Use só este.

---

## 1. Vercel: criar 1 variável (se ainda não criou)

Settings > Environment Variables > Add

| Campo | Valor |
|---|---|
| Name | `CRON_SECRET` |
| Value | senha aleatória longa (40 caracteres) |
| Environments | Production e Preview |

Sem ela o cron responde 401 e nenhum código de estudante sai.

## 2. GitHub: subir os arquivos

**Substituir** (mesmo caminho, mesmo nome):

```
config.ts
lib/hotmart.js
app/estudante/page.tsx
app/estudante/solicitacaorecebida/page.tsx
app/api/estudante/solicitar/route.js
```

**Criar** (novos):

```
vercel.json
app/api/cron/manutencao/route.js
```

**Apagar** (único passo manual, o upload não deleta):

```
app/api/setup/criar-template/route.js
```

Na página do arquivo no GitHub: botão de três pontinhos > Delete file > Commit.

## 3. Depois do deploy

1. Vercel > Settings > Cron Jobs: `/api/cron/manutencao` deve aparecer rodando a cada minuto.
2. Testar na mão: `https://diariamente.app/api/cron/manutencao?key=SEU_CRON_SECRET`
   Esperado: `{"ok":true,"resultado":{...}}`
3. Solicitar em `/estudante` com um CPF válido e cronometrar o WhatsApp (~5 min).

---

## Nada do seu design foi tocado

Os arquivos do redesign continuam intactos. Não estão no pacote:

```
app/page.tsx · app/layout.tsx · app/globals.css · app/robots.ts
components/Brand.tsx · components/FAQ.tsx
components/HeroProvocacao.tsx · components/Sticky.tsx
public/og-card.png · AJUSTES.md · package-lock.json
```

### config.ts: o que mudou de verdade

Você já tinha corrigido o domínio para `diariamente.app` por conta própria.
A **única** alteração deste pacote no arquivo é uma linha nova:

```ts
// tempo de conferência antes do envio do código (espelha ESPERA_MINUTOS da API)
esperaMinutos: 5,
```

Seu OG card (`/og-card.png`), as URLs com `f_auto,q_auto` do Cloudinary e o
`prazoTexto` corrigido estão preservados.

---

## O que mudou em cada arquivo

### lib/hotmart.js
Nova função `offerIdsDoAmbiente()`: lê `HOTMART_OFFER_IDS` e mantém apenas IDs
numéricos. Código de checkout (`gqu7p0mm`) é descartado com aviso no log, não
vira `NaN`. `criarCupom` filtra inteiros válidos antes de montar o payload.

### app/api/estudante/solicitar/route.js
O WhatsApp sai do caminho da requisição. O cupom nasce com
`enviar_em = agora + 5 minutos` e a resposta vira
`{ ok: true, agendado: true, espera_minutos: 5 }`.

Resolve o furo antigo: antes, se a Meta recusasse o envio, a API respondia
"deu certo", o CPF ficava queimado e o estudante ficava sem código e sem
plano B. Agora o cron tenta 5 vezes.

### app/api/cron/manutencao/route.js (novo)
Roda a cada minuto, 4 tarefas isoladas:
1. **Envia** os códigos maduros (até 40 por rodada, 5 tentativas cada)
2. **Expira** cupons vencidos que ainda constavam como ativos
3. **Reprocessa** leads que falharam no RD Station (últimos 7 dias)
4. **Apaga** na Hotmart os cupons marcados como `delete_pendente`

### app/estudante/page.tsx
- "Preciso enviar comprovante de matrícula? Não." virou "Como funciona a
  validação?", sem declarar que o comprovante é dispensado
- Prazo: "em até 5 minutos, depois da conferência"
- Passo 3: "toque no botão da mensagem", que é como funciona de verdade
  (a página mandava colar um código que a mensagem não mostra)

### app/estudante/solicitacaorecebida/page.tsx
Mesma correção de prazo e de instrução.

### app/api/setup/criar-template/route.js (apagar)
Cria uma versão do template de WhatsApp com 2 variáveis no corpo e botão fixo,
incompatível com o `lib/whatsapp.js` que está no ar (1 variável + botão de URL
dinâmica). Se alguém rodar essa rota, todos os envios passam a falhar.

---

## Banco de dados: já aplicado

Migration `estudante_003_envio_agendado`, aditiva, já rodou em produção.
Colunas novas em `cupons_estudante`: `enviar_em`, `whatsapp_enviado_em`,
`whatsapp_tentativas`, `whatsapp_erro`.
Os 3 cupons antigos foram marcados como já enviados, para o cron nunca
reenviar histórico.

---

## Sobre a HOTMART_OFFER_IDS

Pode deixar `gqu7p0mm` lá. O novo `lib/hotmart.js` descarta com aviso em vez
de quebrar.

E a restrição por oferta deixou de ser prioridade: o livro físico é um
**produto separado** na Hotmart, então o cupom do produto 8280315 não o
alcança. Dentro do produto só existem duas ofertas, e aplicar 44% na base de
R$ 197 daria R$ 110,32, mais caro que os R$ 77,22 da Founders. Sem risco de
margem. Fica como higiene, não como bloqueador.
