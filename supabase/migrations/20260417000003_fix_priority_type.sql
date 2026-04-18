-- Adjust priority column to match the number-based priority from the frontend
ALTER TABLE agenda_events DROP COLUMN IF EXISTS priority;
ALTER TABLE agenda_events ADD COLUMN priority FLOAT DEFAULT 5.0;
