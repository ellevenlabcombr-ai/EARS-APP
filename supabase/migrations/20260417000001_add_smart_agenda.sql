-- Migration to add agenda_events table
CREATE TABLE IF NOT EXISTS public.agenda_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL, -- clinical, professional, personal, etc.
    subcategory TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    athlete_id UUID REFERENCES public.athletes(id),
    risk_score INTEGER DEFAULT 0,
    priority TEXT DEFAULT 'medium',
    origin TEXT DEFAULT 'manual', -- manual, auto, engine
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.agenda_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read agenda events" 
ON public.agenda_events FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Allow authenticated users to write agenda events" 
ON public.agenda_events FOR ALL 
TO authenticated 
USING (true)
WITH CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_agenda_events_start_time ON public.agenda_events(start_time);
CREATE INDEX IF NOT EXISTS idx_agenda_events_athlete_id ON public.agenda_events(athlete_id);
