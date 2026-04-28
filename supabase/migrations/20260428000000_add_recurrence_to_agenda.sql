-- Migration: Add recurrence features to agenda_events
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agenda_events' AND column_name = 'recurrence_rule') THEN
        ALTER TABLE public.agenda_events ADD COLUMN recurrence_rule TEXT DEFAULT 'none';
        ALTER TABLE public.agenda_events ADD COLUMN recurrence_group_id UUID DEFAULT NULL;
    END IF;
END $$;
