-- Migration: Garantir que a coluna id da tabela agenda_events tenha um valor padrão (UUID)
-- Execute este SQL no Editor SQL do seu painel Supabase

DO $$ 
BEGIN
    -- 1. Verificar se a tabela agenda_events existe
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'agenda_events') THEN
        
        -- 2. Garantir que a coluna id tenha um valor padrão (geração automática de UUID)
        -- Tentamos usar gen_random_uuid() que é padrão no PostgreSQL 13+ e Supabase
        ALTER TABLE public.agenda_events ALTER COLUMN id SET DEFAULT gen_random_uuid();

        -- 3. Caso o id atual tenha valores nulos (o que não deveria ocorrer por ser PK),
        -- mas garantimos que futuras inserções funcionem.
        
    END IF;
END $$;

-- Comentário: Esta migração resolve o erro "null value in column 'id' violates not-null constraint".
