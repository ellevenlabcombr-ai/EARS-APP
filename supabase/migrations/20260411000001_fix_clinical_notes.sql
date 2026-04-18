-- Migration to add missing columns to clinical_notes
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clinical_notes' AND column_name='note_date') THEN
        ALTER TABLE clinical_notes ADD COLUMN note_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;
