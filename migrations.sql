-- MIGRATION: Adicionar campo group_name à tabela athletes
-- Execute este SQL no Editor SQL do seu painel Supabase

-- 1. Adicionar a coluna group_name
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS group_name TEXT;

-- 2. Criar um índice para melhorar a performance de filtragem por grupo
CREATE INDEX IF NOT EXISTS idx_athletes_group_name ON athletes(group_name);

-- 3. (Opcional) Atualizar atletas existentes que não possuem grupo para 'all' ou null
-- UPDATE athletes SET group_name = NULL WHERE group_name IS NULL;

-- Comentário: Esta migração permite que o sistema filtre atletas pelo projeto social "ÁGUIAS"
-- ou qualquer outro grupo futuro.
