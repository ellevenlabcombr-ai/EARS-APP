-- Add menstrual_cycle column to check_ins and wellness_records
ALTER TABLE check_ins ADD COLUMN IF NOT EXISTS menstrual_cycle TEXT;
ALTER TABLE wellness_records ADD COLUMN IF NOT EXISTS menstrual_cycle TEXT;

-- Add other missing columns to wellness_records if they are missing from previous migrations
ALTER TABLE wellness_records ADD COLUMN IF NOT EXISTS hydration_perception NUMERIC;
ALTER TABLE wellness_records ADD COLUMN IF NOT EXISTS thirst_level NUMERIC;
ALTER TABLE wellness_records ADD COLUMN IF NOT EXISTS urine_color NUMERIC;
ALTER TABLE wellness_records ADD COLUMN IF NOT EXISTS hydration_symptoms JSONB DEFAULT '{}'::jsonb;
ALTER TABLE wellness_records ADD COLUMN IF NOT EXISTS hydration_score NUMERIC;
