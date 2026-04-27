-- Migration: Adicionar campo address à tabela agenda_events
-- Execute este SQL no Editor SQL do seu painel Supabase

DO $$ 
BEGIN
    -- 1. Verificar se a tabela agenda_events existe
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'agenda_events') THEN
        
        -- 2. Adicionar a coluna location se não existir
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agenda_events' AND column_name = 'location') THEN
            ALTER TABLE public.agenda_events ADD COLUMN location TEXT;
        END IF;

        -- 3. Adicionar a coluna address se não existir
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agenda_events' AND column_name = 'address') THEN
            ALTER TABLE public.agenda_events ADD COLUMN address TEXT;
        END IF;

        -- 4. Adicionar a coluna is_all_day se não existir
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agenda_events' AND column_name = 'is_all_day') THEN
            ALTER TABLE public.agenda_events ADD COLUMN is_all_day BOOLEAN DEFAULT FALSE;
        END IF;

    END IF;
END $$;

-- Comentário: Esta migração corrige o erro de "coluna address não encontrada" no calendário.
