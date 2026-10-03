-- =====================================================================
-- estudante_interesse: formulário de estudante fora do Brasil
-- (/es/estudiantes, components/FormularioGlobal.tsx)
-- ---------------------------------------------------------------------
-- NÃO APLICADO. Rodar uma vez no Supabase do Diariamente (projeto
-- xycwmtsicuqjswfiohbc), no SQL Editor, por quem cuida do banco.
-- Rollback: 2026-10-03-estudante-interesse.rollback.sql
--
-- Por que: em 03/10/2026 a tabela não existe no banco (conferido com
-- SELECT em pg_class). Sem ela, /api/estudante/interesse responde 500
-- para todo envio e o formulário mostra erro: nenhum interessado de fora
-- do Brasil fica registrado. (Exceção: se a variável
-- SUPABASE_TABELA_INTERESSE na Vercel apontar outra tabela; não
-- verificado, mas nenhuma tabela com "interesse" no nome existe.)
-- Definição igual à do topo de app/api/estudante/interesse/route.js.
--
-- A rota só insere (não existe upsert): um envio nunca altera o de outra
-- pessoa. Navegador e usuários do app não leem nem gravam: RLS ligado,
-- sem política, e nenhum privilégio para anon e authenticated.
-- =====================================================================

create table if not exists public.estudante_interesse (
  id                 uuid primary key default gen_random_uuid(),
  criado_em          timestamptz not null default now(),
  nome               text not null,
  email              text not null,
  telefone           text,
  pais               text not null,
  instituicao        text not null,
  curso              text,
  idioma             text not null default 'es',
  -- consentimento: separado por finalidade, com prova
  consent_versao     text not null,
  consent_aceito_em  timestamptz not null,
  consent_origem     text not null,
  consent_marketing  boolean not null default false,
  consent_parceiros  boolean not null default false,
  -- prova adicional do consentimento (IP só em hash)
  ip_hash            text,
  user_agent         text,
  utm                jsonb
);

create index if not exists estudante_interesse_email_idx
  on public.estudante_interesse (email);

alter table public.estudante_interesse enable row level security;

revoke all on table public.estudante_interesse from public, anon, authenticated;

comment on table public.estudante_interesse is
  'Interesse na condição de estudante fora do Brasil (site diariamente.app). Só a rota /api/estudante/interesse grava (chave de serviço).';
