-- Migration to add group_name and performance indexes
-- Safely add group_name if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'athletes' AND column_name = 'group_name') THEN
        ALTER TABLE public.athletes ADD COLUMN group_name TEXT;
    END IF;
END $$;

-- Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_athletes_name ON athletes(name);
CREATE INDEX IF NOT EXISTS idx_athletes_group_name ON athletes(group_name);
CREATE INDEX IF NOT EXISTS idx_athletes_modalidade ON athletes(modalidade);
CREATE INDEX IF NOT EXISTS idx_athletes_category ON athletes(category);
CREATE INDEX IF NOT EXISTS idx_athletes_status ON athletes(status);
CREATE INDEX IF NOT EXISTS idx_wellness_records_athlete_id ON wellness_records(athlete_id);
CREATE INDEX IF NOT EXISTS idx_wellness_records_record_date ON wellness_records(record_date);
CREATE INDEX IF NOT EXISTS idx_clinical_notes_athlete_id ON clinical_notes(athlete_id);
CREATE INDEX IF NOT EXISTS idx_clinical_notes_note_date ON clinical_notes(note_date);

-- Notify PostgREST to reload the schema cache
NOTIFY pgrst, 'reload schema';
