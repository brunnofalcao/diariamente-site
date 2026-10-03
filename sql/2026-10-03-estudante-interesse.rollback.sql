-- Rollback de 2026-10-03-estudante-interesse.sql
-- ATENÇÃO: apaga a tabela e TODOS os registros. Exportar antes
-- (Table Editor, Export to CSV) se já houver linhas.
-- Sem a tabela, /api/estudante/interesse volta a responder 500.

drop table if exists public.estudante_interesse;
