
-- MIGRATION: Adicionar campos de RPE e carga de treinamento às tabelas check_ins e wellness_records

-- Adicionar colunas à tabela check_ins
ALTER TABLE check_ins ADD COLUMN IF NOT EXISTS rpe_simple INTEGER;
ALTER TABLE check_ins ADD COLUMN IF NOT EXISTS mapped_rpe INTEGER;
ALTER TABLE check_ins ADD COLUMN IF NOT EXISTS duration_minutes INTEGER;
ALTER TABLE check_ins ADD COLUMN IF NOT EXISTS session_load INTEGER;

-- Adicionar colunas à tabela wellness_records
ALTER TABLE wellness_records ADD COLUMN IF NOT EXISTS rpe_simple INTEGER;
ALTER TABLE wellness_records ADD COLUMN IF NOT EXISTS mapped_rpe INTEGER;
ALTER TABLE wellness_records ADD COLUMN IF NOT EXISTS duration_minutes INTEGER;
ALTER TABLE wellness_records ADD COLUMN IF NOT EXISTS session_load INTEGER;
