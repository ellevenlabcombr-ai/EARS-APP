-- Add athlete_code to athletes table
ALTER TABLE athletes
ADD COLUMN IF NOT EXISTS athlete_code TEXT UNIQUE;

-- Create an index for faster searching
CREATE INDEX IF NOT EXISTS idx_athletes_athlete_code ON athletes(athlete_code);
