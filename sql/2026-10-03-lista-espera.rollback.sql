-- Rollback de 2026-10-03-lista-espera.sql
-- ATENÇÃO: apaga a tabela e TODAS as inscrições. Exportar antes
-- (Table Editor, Export to CSV) se já houver linhas.
-- Sem a tabela, /api/lista-espera volta a gravar só no RD Station.

drop table if exists public.lista_espera;
