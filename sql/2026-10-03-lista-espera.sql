-- =====================================================================
-- lista_espera: inscrições do formulário "em breve" (/ e /es)
-- ---------------------------------------------------------------------
-- NÃO APLICADO. Rodar uma vez no Supabase do Diariamente (projeto
-- xycwmtsicuqjswfiohbc), no SQL Editor, por quem cuida do banco.
-- Rollback: 2026-10-03-lista-espera.rollback.sql
--
-- Por que agora: em 03/10/2026 a tabela não existe no banco (conferido
-- com SELECT em pg_class). Sem ela, /api/lista-espera grava só no RD
-- Station, e cada envio com um e-mail já inscrito troca nome e telefone
-- desse contato no RD. Com a tabela, o e-mail repetido é ignorado e o
-- RD não é chamado de novo (ver app/api/lista-espera/route.js).
--
-- Quem grava é a rota do site, com a chave de serviço. Navegador e
-- usuários do app não leem nem gravam: RLS ligado, sem política, e
-- nenhum privilégio para anon e authenticated.
-- =====================================================================

create table if not exists public.lista_espera (
  id                 uuid primary key default gen_random_uuid(),
  criado_em          timestamptz not null default now(),
  nome               text not null,
  -- UNIQUE na coluna (a rota manda sempre em minúsculas): é o alvo do
  -- "on conflict (email) do nothing". Índice por expressão, como
  -- lower(email), não serve de alvo para o on_conflict do Supabase.
  email              text not null unique,
  whatsapp           text not null,
  origem             text not null default 'em-breve',
  consent_versao     text not null,
  consent_aceito_em  timestamptz not null,
  consent_parceiros  boolean not null default false,
  ip_hash            text,
  user_agent         text,
  utm                jsonb,
  -- marca quem já recebeu a comunicação de abertura
  avisado_em         timestamptz
);

alter table public.lista_espera enable row level security;

revoke all on table public.lista_espera from public, anon, authenticated;

comment on table public.lista_espera is
  'Lista de espera do site diariamente.app. Só a rota /api/lista-espera grava (chave de serviço). E-mail repetido é ignorado, nunca sobrescrito.';
