-- ==========================================
-- ELLEVEN CLINICAL ASSESSMENTS
-- ==========================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CLINICAL ASSESSMENTS TABLE (Unified for all types)
CREATE TABLE IF NOT EXISTS clinical_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  athlete_id UUID REFERENCES athletes(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'functional', 'biomechanical', 'sleep', 'orthopedic', 'physical', 'strength'
  score NUMERIC,
  risk_level TEXT,
  data JSONB NOT NULL DEFAULT '{}',
  notes TEXT,
  assessment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_clinical_assessments_athlete_id ON clinical_assessments(athlete_id);
CREATE INDEX IF NOT EXISTS idx_clinical_assessments_type ON clinical_assessments(type);
CREATE INDEX IF NOT EXISTS idx_clinical_assessments_date ON clinical_assessments(assessment_date);

-- 3. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE clinical_assessments ENABLE ROW LEVEL SECURITY;

-- For now, allow all access (anon/authenticated)
-- IN PRODUCTION: Restrict based on auth.uid()
CREATE POLICY "Enable read access for all users" ON clinical_assessments FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON clinical_assessments FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON clinical_assessments FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON clinical_assessments FOR DELETE USING (true);

-- 4. TRIGGER FOR UPDATED_AT
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_clinical_assessments_updated_at
    BEFORE UPDATE ON clinical_assessments
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
