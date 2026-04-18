-- ==========================================
-- ELLEVEN WELLNESS & ATHLETE DASHBOARD
-- Initial Database Schema
-- ==========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ATHLETES TABLE
CREATE TABLE athletes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT,
  birth_date DATE,
  weight DECIMAL(5,2),
  height DECIMAL(5,2),
  avatar_url TEXT,
  readiness_score INTEGER DEFAULT 0,
  risk_level TEXT DEFAULT 'Baixo',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. WELLNESS RECORDS (Daily Questionnaire)
CREATE TABLE wellness_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  athlete_id UUID REFERENCES athletes(id) ON DELETE CASCADE,
  record_date DATE NOT NULL DEFAULT CURRENT_DATE,
  sleep_hours DECIMAL(4,2),
  sleep_quality INTEGER CHECK (sleep_quality BETWEEN 1 AND 5),
  fatigue_level INTEGER CHECK (fatigue_level BETWEEN 1 AND 5),
  muscle_soreness INTEGER CHECK (muscle_soreness BETWEEN 1 AND 5),
  soreness_location TEXT,
  stress_level INTEGER CHECK (stress_level BETWEEN 1 AND 5),
  readiness_score INTEGER,
  comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CLINICAL NOTES (Prontuário & Evolução Rápida)
CREATE TABLE clinical_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  athlete_id UUID REFERENCES athletes(id) ON DELETE CASCADE,
  note_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  pain_level INTEGER CHECK (pain_level BETWEEN 0 AND 10),
  feeling TEXT,
  regions TEXT[],
  treatments TEXT[],
  observations TEXT,
  generated_text TEXT,
  is_signed BOOLEAN DEFAULT FALSE,
  professional_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. MEDICAL TIMELINE (Injuries, Surgeries, Exams)
CREATE TABLE medical_timeline (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  athlete_id UUID REFERENCES athletes(id) ON DELETE CASCADE,
  event_date DATE NOT NULL DEFAULT CURRENT_DATE,
  category TEXT CHECK (category IN ('injury', 'surgery', 'exam', 'status', 'other')),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. POSTURAL ASSESSMENTS
CREATE TABLE postural_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  athlete_id UUID REFERENCES athletes(id) ON DELETE CASCADE,
  assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  image_url TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

ALTER TABLE athletes ENABLE ROW LEVEL SECURITY;
ALTER TABLE wellness_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE postural_assessments ENABLE ROW LEVEL SECURITY;

-- For now, we allow anon/authenticated users to read and write.
-- IN PRODUCTION: You should restrict this based on auth.uid() and roles.

-- Athletes
CREATE POLICY "Enable read access for all users" ON athletes FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON athletes FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON athletes FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON athletes FOR DELETE USING (true);

-- Wellness Records
CREATE POLICY "Enable read access for all users" ON wellness_records FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON wellness_records FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON wellness_records FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON wellness_records FOR DELETE USING (true);

-- Clinical Notes
CREATE POLICY "Enable read access for all users" ON clinical_notes FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON clinical_notes FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON clinical_notes FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON clinical_notes FOR DELETE USING (true);

-- Medical Timeline
CREATE POLICY "Enable read access for all users" ON medical_timeline FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON medical_timeline FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON medical_timeline FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON medical_timeline FOR DELETE USING (true);

-- Postural Assessments
CREATE POLICY "Enable read access for all users" ON postural_assessments FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON postural_assessments FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON postural_assessments FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON postural_assessments FOR DELETE USING (true);
