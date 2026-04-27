-- Migration: Adicionar coluna status à tabela agenda_events
-- Execute este SQL no Editor SQL do seu painel Supabase

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'agenda_events') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agenda_events' AND column_name = 'status') THEN
            ALTER TABLE public.agenda_events ADD COLUMN status TEXT DEFAULT 'pending';
        END IF;

        -- Migrar registros de origin pwa que possam existir (opcional)
        -- UPDATE public.agenda_events SET status = 'pending' WHERE status IS NULL;
    END IF;
END $$;

-- Comentário: Esta migração permite gerenciar o estado dos eventos na agenda.
