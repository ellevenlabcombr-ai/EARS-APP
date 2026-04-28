-- Migration: Add recurrence_days to agenda_events
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agenda_events' AND column_name = 'recurrence_days') THEN
        ALTER TABLE public.agenda_events ADD COLUMN recurrence_days INTEGER[] DEFAULT NULL;
    END IF;
END $$;
