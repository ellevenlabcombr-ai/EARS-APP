-- MIGRATION: Adicionar colunas faltantes às tabelas check_ins e wellness_records
-- Execute este SQL no Editor SQL do seu painel Supabase

-- 1. Adicionar colunas à tabela check_ins
ALTER TABLE check_ins ADD COLUMN IF NOT EXISTS menstrual_cycle TEXT;
ALTER TABLE check_ins ADD COLUMN IF NOT EXISTS menstrual_symptoms TEXT[];
ALTER TABLE check_ins ADD COLUMN IF NOT EXISTS notes TEXT;

-- 2. Adicionar colunas à tabela wellness_records (caso não existam)
ALTER TABLE wellness_records ADD COLUMN IF NOT EXISTS menstrual_cycle TEXT;
ALTER TABLE wellness_records ADD COLUMN IF NOT EXISTS menstrual_symptoms TEXT[];
ALTER TABLE wellness_records ADD COLUMN IF NOT EXISTS hydration_perception NUMERIC;
ALTER TABLE wellness_records ADD COLUMN IF NOT EXISTS hydration_score NUMERIC;

-- Comentário: Estas colunas são necessárias para o novo Dashboard do Atleta e acompanhamento de Wellness.
