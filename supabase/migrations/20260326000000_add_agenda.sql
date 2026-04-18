-- Create appointments table for the Agenda module
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    athlete_id UUID REFERENCES athletes(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    type TEXT NOT NULL DEFAULT 'clinical', -- 'clinical', 'training', 'evaluation', 'other'
    status TEXT NOT NULL DEFAULT 'scheduled', -- 'scheduled', 'completed', 'cancelled'
    location TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_appointments_athlete_id ON appointments(athlete_id);
CREATE INDEX IF NOT EXISTS idx_appointments_start_time ON appointments(start_time);

-- Enable RLS
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Enable read access for all users" ON appointments;
CREATE POLICY "Enable read access for all users" ON appointments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert access for all users" ON appointments;
CREATE POLICY "Enable insert access for all users" ON appointments FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update access for all users" ON appointments;
CREATE POLICY "Enable update access for all users" ON appointments FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Enable delete access for all users" ON appointments;
CREATE POLICY "Enable delete access for all users" ON appointments FOR DELETE USING (true);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_appointments_updated_at ON appointments;
CREATE TRIGGER update_appointments_updated_at
    BEFORE UPDATE ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
