# Diariamente · rodapé com a rede da marca

23 arquivos. Consolidado: inclui tudo das entregas anteriores.
`tsc` limpo, `next build` com 21 rotas.

**Pré-condição mantida:** só suba depois que `diariamente.club` fizer
301 para `diariamente.app`.

---

## O QUE MUDOU

### Rodapé

Saíram as redes e o site da Science Play. Entrou:

```
Acompanhar
◉ @diariamente.app
```

Handle visível, não só ícone: o @ é o que a pessoa procura e o que ela
copia. Alvo de toque de 40px.

Novo em `config.ts`:

```ts
SITE.instagram = "diariamente.app"
```

O LinkedIn saiu junto (era da Science Play) e o ícone dele foi removido
do componente, não ficou código morto.

### O que NÃO tirei do rodapé

A linha legal continua: `© Science Play® · Science Play Cursos LTDA ·
CNPJ 33.612.911/0001-29`. Isso não é divulgação, é identificação do
fornecedor, exigida pelo CDC art. 31 e pelo Marco Civil. Se sair, o site
fica sem responsável identificável.

Os e-mails também continuam `@scienceplay.com`, porque são os endereços
reais que você passou.

---

## DOIS ACHADOS DURANTE A LIMPEZA

### 1. O schema dizia que a entidade era a Science Play

O `sameAs` do schema Organization apontava para o site, o Instagram e o
LinkedIn da Science Play. `sameAs` é **o principal sinal de entidade**
para buscadores e mecanismos generativos: com isso, você estava
ensinando ao Google que a entidade desta página é a empresa, não o
produto.

Corrigido. A entidade agora é o Diariamente:

```
name          Diariamente
url           https://diariamente.app
sameAs        instagram.com/diariamente.app
              App Store
              Google Play
parentOrganization   Science Play Cursos LTDA
```

`parentOrganization` é a relação correta em schema.org: a realizadora
aparece, sem disputar a identidade do produto.

### 2. Sobrou um schema Person do Brunno

A página declarava um `Person` com nome, bio, foto e Instagram do
Brunno, herdado da seção de autores que virou manifesto.

Dois problemas: declarar uma pessoa que não aparece em lugar nenhum do
conteúdo é sinal inconsistente para o buscador, e **reintroduzia por
metadado a autoria individual que foi retirada de propósito**. O
`instagram.com/brunnofalcao` estava no HTML renderizado.

Removido. No HTML agora existe **uma única rede**:
`instagram.com/diariamente.app`. E `Person: 0x`.

---

## AINDA ABERTO

| | O quê |
| --- | --- |
| **P0** | 301 de `.club` para `.app` |
| **P0** | Order bump do livro no checkout (painel Hotmart) |
| **P0** | Nomear o conselho editorial (array `CONSELHO`) |
| **P0** | Assinatura: webhook só trata `PURCHASE_APPROVED` |
| **P1** | Criar de fato o @diariamente.app no Instagram, se ainda não existir. Link para perfil inexistente é pior que link nenhum |
| **P1** | Hero mostra "Dia 235 de 365": reenquadrar como dia coletivo |
| **P1** | Decidir o contador de voltas |
| **P1** | `/estudante` com a voz nova |
| **P2** | `EMPRESA.endereco` ainda está `[TROCAR]` |
