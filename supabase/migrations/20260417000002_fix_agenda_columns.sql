-- Add missing columns to agenda_events table
ALTER TABLE agenda_events ADD COLUMN IF NOT EXISTS subcategory TEXT;
ALTER TABLE agenda_events ADD COLUMN IF NOT EXISTS risk_score FLOAT DEFAULT 0;
