-- Migration: Add reminder_minutes to agenda_events

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agenda_events' AND column_name = 'reminder_minutes') THEN
        ALTER TABLE public.agenda_events ADD COLUMN reminder_minutes INTEGER DEFAULT NULL;
    END IF;
END $$;
