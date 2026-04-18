-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Trigger function for updated_at if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Helper macro to create assessment tables
-- We will just write them out for clarity

-- 1. sleep_assessments
CREATE TABLE IF NOT EXISTS sleep_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  assessment_date DATE DEFAULT CURRENT_DATE,
  score NUMERIC,
  classification TEXT,
  classification_color TEXT,
  alerts JSONB DEFAULT '[]'::jsonb,
  clinical_notes TEXT,
  raw_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_sleep_assessments_athlete_id ON sleep_assessments(athlete_id);
CREATE INDEX IF NOT EXISTS idx_sleep_assessments_date ON sleep_assessments(assessment_date);
CREATE INDEX IF NOT EXISTS idx_sleep_assessments_athlete_date ON sleep_assessments(athlete_id, assessment_date DESC);
DROP TRIGGER IF EXISTS update_sleep_assessments_updated_at ON sleep_assessments;
CREATE TRIGGER update_sleep_assessments_updated_at BEFORE UPDATE ON sleep_assessments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 2. orthopedic_assessments
CREATE TABLE IF NOT EXISTS orthopedic_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  assessment_date DATE DEFAULT CURRENT_DATE,
  score NUMERIC,
  classification TEXT,
  classification_color TEXT,
  alerts JSONB DEFAULT '[]'::jsonb,
  clinical_notes TEXT,
  raw_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_orthopedic_assessments_athlete_id ON orthopedic_assessments(athlete_id);
CREATE INDEX IF NOT EXISTS idx_orthopedic_assessments_date ON orthopedic_assessments(assessment_date);
CREATE INDEX IF NOT EXISTS idx_orthopedic_assessments_athlete_date ON orthopedic_assessments(athlete_id, assessment_date DESC);
DROP TRIGGER IF EXISTS update_orthopedic_assessments_updated_at ON orthopedic_assessments;
CREATE TRIGGER update_orthopedic_assessments_updated_at BEFORE UPDATE ON orthopedic_assessments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 3. biomechanical_assessments
CREATE TABLE IF NOT EXISTS biomechanical_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  assessment_date DATE DEFAULT CURRENT_DATE,
  score NUMERIC,
  classification TEXT,
  classification_color TEXT,
  alerts JSONB DEFAULT '[]'::jsonb,
  clinical_notes TEXT,
  raw_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_biomechanical_assessments_athlete_id ON biomechanical_assessments(athlete_id);
CREATE INDEX IF NOT EXISTS idx_biomechanical_assessments_date ON biomechanical_assessments(assessment_date);
CREATE INDEX IF NOT EXISTS idx_biomechanical_assessments_athlete_date ON biomechanical_assessments(athlete_id, assessment_date DESC);
DROP TRIGGER IF EXISTS update_biomechanical_assessments_updated_at ON biomechanical_assessments;
CREATE TRIGGER update_biomechanical_assessments_updated_at BEFORE UPDATE ON biomechanical_assessments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 4. physical_load_assessments
CREATE TABLE IF NOT EXISTS physical_load_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  assessment_date DATE DEFAULT CURRENT_DATE,
  score NUMERIC,
  classification TEXT,
  classification_color TEXT,
  alerts JSONB DEFAULT '[]'::jsonb,
  clinical_notes TEXT,
  raw_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_physical_load_assessments_athlete_id ON physical_load_assessments(athlete_id);
CREATE INDEX IF NOT EXISTS idx_physical_load_assessments_date ON physical_load_assessments(assessment_date);
CREATE INDEX IF NOT EXISTS idx_physical_load_assessments_athlete_date ON physical_load_assessments(athlete_id, assessment_date DESC);
DROP TRIGGER IF EXISTS update_physical_load_assessments_updated_at ON physical_load_assessments;
CREATE TRIGGER update_physical_load_assessments_updated_at BEFORE UPDATE ON physical_load_assessments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 5. performance_assessments
CREATE TABLE IF NOT EXISTS performance_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  assessment_date DATE DEFAULT CURRENT_DATE,
  score NUMERIC,
  classification TEXT,
  classification_color TEXT,
  alerts JSONB DEFAULT '[]'::jsonb,
  clinical_notes TEXT,
  raw_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_performance_assessments_athlete_id ON performance_assessments(athlete_id);
CREATE INDEX IF NOT EXISTS idx_performance_assessments_date ON performance_assessments(assessment_date);
CREATE INDEX IF NOT EXISTS idx_performance_assessments_athlete_date ON performance_assessments(athlete_id, assessment_date DESC);
DROP TRIGGER IF EXISTS update_performance_assessments_updated_at ON performance_assessments;
CREATE TRIGGER update_performance_assessments_updated_at BEFORE UPDATE ON performance_assessments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 6. neurological_assessments
CREATE TABLE IF NOT EXISTS neurological_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  assessment_date DATE DEFAULT CURRENT_DATE,
  score NUMERIC,
  classification TEXT,
  classification_color TEXT,
  alerts JSONB DEFAULT '[]'::jsonb,
  clinical_notes TEXT,
  raw_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_neurological_assessments_athlete_id ON neurological_assessments(athlete_id);
CREATE INDEX IF NOT EXISTS idx_neurological_assessments_date ON neurological_assessments(assessment_date);
CREATE INDEX IF NOT EXISTS idx_neurological_assessments_athlete_date ON neurological_assessments(athlete_id, assessment_date DESC);
DROP TRIGGER IF EXISTS update_neurological_assessments_updated_at ON neurological_assessments;
CREATE TRIGGER update_neurological_assessments_updated_at BEFORE UPDATE ON neurological_assessments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 7. psychological_assessments
CREATE TABLE IF NOT EXISTS psychological_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  assessment_date DATE DEFAULT CURRENT_DATE,
  score NUMERIC,
  classification TEXT,
  classification_color TEXT,
  alerts JSONB DEFAULT '[]'::jsonb,
  clinical_notes TEXT,
  raw_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_psychological_assessments_athlete_id ON psychological_assessments(athlete_id);
CREATE INDEX IF NOT EXISTS idx_psychological_assessments_date ON psychological_assessments(assessment_date);
CREATE INDEX IF NOT EXISTS idx_psychological_assessments_athlete_date ON psychological_assessments(athlete_id, assessment_date DESC);
DROP TRIGGER IF EXISTS update_psychological_assessments_updated_at ON psychological_assessments;
CREATE TRIGGER update_psychological_assessments_updated_at BEFORE UPDATE ON psychological_assessments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 8. nutritional_assessments
CREATE TABLE IF NOT EXISTS nutritional_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  assessment_date DATE DEFAULT CURRENT_DATE,
  score NUMERIC,
  classification TEXT,
  classification_color TEXT,
  alerts JSONB DEFAULT '[]'::jsonb,
  clinical_notes TEXT,
  raw_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_nutritional_assessments_athlete_id ON nutritional_assessments(athlete_id);
CREATE INDEX IF NOT EXISTS idx_nutritional_assessments_date ON nutritional_assessments(assessment_date);
CREATE INDEX IF NOT EXISTS idx_nutritional_assessments_athlete_date ON nutritional_assessments(athlete_id, assessment_date DESC);
DROP TRIGGER IF EXISTS update_nutritional_assessments_updated_at ON nutritional_assessments;
CREATE TRIGGER update_nutritional_assessments_updated_at BEFORE UPDATE ON nutritional_assessments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 9. reds_assessments
CREATE TABLE IF NOT EXISTS reds_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  assessment_date DATE DEFAULT CURRENT_DATE,
  score NUMERIC,
  classification TEXT,
  classification_color TEXT,
  alerts JSONB DEFAULT '[]'::jsonb,
  clinical_notes TEXT,
  raw_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_reds_assessments_athlete_id ON reds_assessments(athlete_id);
CREATE INDEX IF NOT EXISTS idx_reds_assessments_date ON reds_assessments(assessment_date);
CREATE INDEX IF NOT EXISTS idx_reds_assessments_athlete_date ON reds_assessments(athlete_id, assessment_date DESC);
DROP TRIGGER IF EXISTS update_reds_assessments_updated_at ON reds_assessments;
CREATE TRIGGER update_reds_assessments_updated_at BEFORE UPDATE ON reds_assessments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 10. anthropometric_assessments
CREATE TABLE IF NOT EXISTS anthropometric_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  assessment_date DATE DEFAULT CURRENT_DATE,
  score NUMERIC,
  classification TEXT,
  classification_color TEXT,
  alerts JSONB DEFAULT '[]'::jsonb,
  clinical_notes TEXT,
  raw_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_anthropometric_assessments_athlete_id ON anthropometric_assessments(athlete_id);
CREATE INDEX IF NOT EXISTS idx_anthropometric_assessments_date ON anthropometric_assessments(assessment_date);
CREATE INDEX IF NOT EXISTS idx_anthropometric_assessments_athlete_date ON anthropometric_assessments(athlete_id, assessment_date DESC);
DROP TRIGGER IF EXISTS update_anthropometric_assessments_updated_at ON anthropometric_assessments;
CREATE TRIGGER update_anthropometric_assessments_updated_at BEFORE UPDATE ON anthropometric_assessments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 11. maturation_assessments
CREATE TABLE IF NOT EXISTS maturation_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  assessment_date DATE DEFAULT CURRENT_DATE,
  score NUMERIC,
  classification TEXT,
  classification_color TEXT,
  alerts JSONB DEFAULT '[]'::jsonb,
  clinical_notes TEXT,
  raw_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_maturation_assessments_athlete_id ON maturation_assessments(athlete_id);
CREATE INDEX IF NOT EXISTS idx_maturation_assessments_date ON maturation_assessments(assessment_date);
CREATE INDEX IF NOT EXISTS idx_maturation_assessments_athlete_date ON maturation_assessments(athlete_id, assessment_date DESC);
DROP TRIGGER IF EXISTS update_maturation_assessments_updated_at ON maturation_assessments;
CREATE TRIGGER update_maturation_assessments_updated_at BEFORE UPDATE ON maturation_assessments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 12. menstrual_assessments
CREATE TABLE IF NOT EXISTS menstrual_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  assessment_date DATE DEFAULT CURRENT_DATE,
  score NUMERIC,
  classification TEXT,
  classification_color TEXT,
  alerts JSONB DEFAULT '[]'::jsonb,
  clinical_notes TEXT,
  raw_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_menstrual_assessments_athlete_id ON menstrual_assessments(athlete_id);
CREATE INDEX IF NOT EXISTS idx_menstrual_assessments_date ON menstrual_assessments(assessment_date);
CREATE INDEX IF NOT EXISTS idx_menstrual_assessments_athlete_date ON menstrual_assessments(athlete_id, assessment_date DESC);
DROP TRIGGER IF EXISTS update_menstrual_assessments_updated_at ON menstrual_assessments;
CREATE TRIGGER update_menstrual_assessments_updated_at BEFORE UPDATE ON menstrual_assessments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 13. hydration_assessments
CREATE TABLE IF NOT EXISTS hydration_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  assessment_date DATE DEFAULT CURRENT_DATE,
  score NUMERIC,
  classification TEXT,
  classification_color TEXT,
  alerts JSONB DEFAULT '[]'::jsonb,
  clinical_notes TEXT,
  raw_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_hydration_assessments_athlete_id ON hydration_assessments(athlete_id);
CREATE INDEX IF NOT EXISTS idx_hydration_assessments_date ON hydration_assessments(assessment_date);
CREATE INDEX IF NOT EXISTS idx_hydration_assessments_athlete_date ON hydration_assessments(athlete_id, assessment_date DESC);
DROP TRIGGER IF EXISTS update_hydration_assessments_updated_at ON hydration_assessments;
CREATE TRIGGER update_hydration_assessments_updated_at BEFORE UPDATE ON hydration_assessments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 14. postural_assessments (already exists, adding missing columns)
ALTER TABLE postural_assessments
ADD COLUMN IF NOT EXISTS score NUMERIC,
ADD COLUMN IF NOT EXISTS classification TEXT,
ADD COLUMN IF NOT EXISTS classification_color TEXT,
ADD COLUMN IF NOT EXISTS alerts JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS clinical_notes TEXT,
ADD COLUMN IF NOT EXISTS raw_data JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_postural_assessments_athlete_id ON postural_assessments(athlete_id);
CREATE INDEX IF NOT EXISTS idx_postural_assessments_date ON postural_assessments(assessment_date);
CREATE INDEX IF NOT EXISTS idx_postural_assessments_athlete_date ON postural_assessments(athlete_id, assessment_date DESC);
DROP TRIGGER IF EXISTS update_postural_assessments_updated_at ON postural_assessments;
CREATE TRIGGER update_postural_assessments_updated_at BEFORE UPDATE ON postural_assessments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 15. functional_assessments
CREATE TABLE IF NOT EXISTS functional_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  assessment_date DATE DEFAULT CURRENT_DATE,
  score NUMERIC,
  classification TEXT,
  classification_color TEXT,
  alerts JSONB DEFAULT '[]'::jsonb,
  clinical_notes TEXT,
  raw_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_functional_assessments_athlete_id ON functional_assessments(athlete_id);
CREATE INDEX IF NOT EXISTS idx_functional_assessments_date ON functional_assessments(assessment_date);
CREATE INDEX IF NOT EXISTS idx_functional_assessments_athlete_date ON functional_assessments(athlete_id, assessment_date DESC);
DROP TRIGGER IF EXISTS update_functional_assessments_updated_at ON functional_assessments;
CREATE TRIGGER update_functional_assessments_updated_at BEFORE UPDATE ON functional_assessments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 16. dynamometry_assessments
CREATE TABLE IF NOT EXISTS dynamometry_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  assessment_date DATE DEFAULT CURRENT_DATE,
  score NUMERIC,
  classification TEXT,
  classification_color TEXT,
  alerts JSONB DEFAULT '[]'::jsonb,
  clinical_notes TEXT,
  raw_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_dynamometry_assessments_athlete_id ON dynamometry_assessments(athlete_id);
CREATE INDEX IF NOT EXISTS idx_dynamometry_assessments_date ON dynamometry_assessments(assessment_date);
CREATE INDEX IF NOT EXISTS idx_dynamometry_assessments_athlete_date ON dynamometry_assessments(athlete_id, assessment_date DESC);
DROP TRIGGER IF EXISTS update_dynamometry_assessments_updated_at ON dynamometry_assessments;
CREATE TRIGGER update_dynamometry_assessments_updated_at BEFORE UPDATE ON dynamometry_assessments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Update daily_wellness table with hydration fields
ALTER TABLE wellness_records
ADD COLUMN IF NOT EXISTS hydration_perception NUMERIC,
ADD COLUMN IF NOT EXISTS thirst_level NUMERIC,
ADD COLUMN IF NOT EXISTS urine_color NUMERIC,
ADD COLUMN IF NOT EXISTS hydration_symptoms JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS hydration_score NUMERIC;

-- Create unified view all_assessments
CREATE OR REPLACE VIEW all_assessments AS
SELECT id, athlete_id, type as assessment_type, score, risk_level as classification, NULL as classification_color, '[]'::jsonb as alerts, data, created_at, assessment_date, 'clinical_assessments' as source_table FROM clinical_assessments
UNION ALL
SELECT id, athlete_id, 'sleep' as assessment_type, score, classification, classification_color, alerts, raw_data as data, created_at, assessment_date, 'sleep_assessments' as source_table FROM sleep_assessments
UNION ALL
SELECT id, athlete_id, 'orthopedic' as assessment_type, score, classification, classification_color, alerts, raw_data as data, created_at, assessment_date, 'orthopedic_assessments' as source_table FROM orthopedic_assessments
UNION ALL
SELECT id, athlete_id, 'biomechanical' as assessment_type, score, classification, classification_color, alerts, raw_data as data, created_at, assessment_date, 'biomechanical_assessments' as source_table FROM biomechanical_assessments
UNION ALL
SELECT id, athlete_id, 'physical' as assessment_type, score, classification, classification_color, alerts, raw_data as data, created_at, assessment_date, 'physical_load_assessments' as source_table FROM physical_load_assessments
UNION ALL
SELECT id, athlete_id, 'performance' as assessment_type, score, classification, classification_color, alerts, raw_data as data, created_at, assessment_date, 'performance_assessments' as source_table FROM performance_assessments
UNION ALL
SELECT id, athlete_id, 'neurological' as assessment_type, score, classification, classification_color, alerts, raw_data as data, created_at, assessment_date, 'neurological_assessments' as source_table FROM neurological_assessments
UNION ALL
SELECT id, athlete_id, 'psychological' as assessment_type, score, classification, classification_color, alerts, raw_data as data, created_at, assessment_date, 'psychological_assessments' as source_table FROM psychological_assessments
UNION ALL
SELECT id, athlete_id, 'nutritional' as assessment_type, score, classification, classification_color, alerts, raw_data as data, created_at, assessment_date, 'nutritional_assessments' as source_table FROM nutritional_assessments
UNION ALL
SELECT id, athlete_id, 'reds' as assessment_type, score, classification, classification_color, alerts, raw_data as data, created_at, assessment_date, 'reds_assessments' as source_table FROM reds_assessments
UNION ALL
SELECT id, athlete_id, 'anthropometric' as assessment_type, score, classification, classification_color, alerts, raw_data as data, created_at, assessment_date, 'anthropometric_assessments' as source_table FROM anthropometric_assessments
UNION ALL
SELECT id, athlete_id, 'maturation' as assessment_type, score, classification, classification_color, alerts, raw_data as data, created_at, assessment_date, 'maturation_assessments' as source_table FROM maturation_assessments
UNION ALL
SELECT id, athlete_id, 'menstrual' as assessment_type, score, classification, classification_color, alerts, raw_data as data, created_at, assessment_date, 'menstrual_assessments' as source_table FROM menstrual_assessments
UNION ALL
SELECT id, athlete_id, 'hydration' as assessment_type, score, classification, classification_color, alerts, raw_data as data, created_at, assessment_date, 'hydration_assessments' as source_table FROM hydration_assessments
UNION ALL
SELECT id, athlete_id, 'functional' as assessment_type, score, classification, classification_color, alerts, raw_data as data, created_at, assessment_date, 'functional_assessments' as source_table FROM functional_assessments
UNION ALL
SELECT id, athlete_id, 'dynamometry' as assessment_type, score, classification, classification_color, alerts, raw_data as data, created_at, assessment_date, 'dynamometry_assessments' as source_table FROM dynamometry_assessments
UNION ALL
SELECT id, athlete_id, 'postural' as assessment_type, score, classification, classification_color, alerts, raw_data as data, created_at, assessment_date, 'postural_assessments' as source_table FROM postural_assessments;

-- Enable RLS for all new tables
ALTER TABLE sleep_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE orthopedic_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE biomechanical_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE physical_load_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE neurological_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE psychological_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutritional_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reds_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE anthropometric_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE maturation_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE menstrual_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE hydration_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE postural_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE functional_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE dynamometry_assessments ENABLE ROW LEVEL SECURITY;

-- Create basic policies (allow all for now, matching existing schema)
DROP POLICY IF EXISTS "Enable all access for sleep_assessments" ON sleep_assessments;
CREATE POLICY "Enable all access for sleep_assessments" ON sleep_assessments FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Enable all access for orthopedic_assessments" ON orthopedic_assessments;
CREATE POLICY "Enable all access for orthopedic_assessments" ON orthopedic_assessments FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Enable all access for biomechanical_assessments" ON biomechanical_assessments;
CREATE POLICY "Enable all access for biomechanical_assessments" ON biomechanical_assessments FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Enable all access for physical_load_assessments" ON physical_load_assessments;
CREATE POLICY "Enable all access for physical_load_assessments" ON physical_load_assessments FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Enable all access for performance_assessments" ON performance_assessments;
CREATE POLICY "Enable all access for performance_assessments" ON performance_assessments FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Enable all access for neurological_assessments" ON neurological_assessments;
CREATE POLICY "Enable all access for neurological_assessments" ON neurological_assessments FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Enable all access for psychological_assessments" ON psychological_assessments;
CREATE POLICY "Enable all access for psychological_assessments" ON psychological_assessments FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Enable all access for nutritional_assessments" ON nutritional_assessments;
CREATE POLICY "Enable all access for nutritional_assessments" ON nutritional_assessments FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Enable all access for reds_assessments" ON reds_assessments;
CREATE POLICY "Enable all access for reds_assessments" ON reds_assessments FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Enable all access for anthropometric_assessments" ON anthropometric_assessments;
CREATE POLICY "Enable all access for anthropometric_assessments" ON anthropometric_assessments FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Enable all access for maturation_assessments" ON maturation_assessments;
CREATE POLICY "Enable all access for maturation_assessments" ON maturation_assessments FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Enable all access for menstrual_assessments" ON menstrual_assessments;
CREATE POLICY "Enable all access for menstrual_assessments" ON menstrual_assessments FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Enable all access for hydration_assessments" ON hydration_assessments;
CREATE POLICY "Enable all access for hydration_assessments" ON hydration_assessments FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Enable all access for postural_assessments" ON postural_assessments;
CREATE POLICY "Enable all access for postural_assessments" ON postural_assessments FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Enable all access for functional_assessments" ON functional_assessments;
CREATE POLICY "Enable all access for functional_assessments" ON functional_assessments FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Enable all access for dynamometry_assessments" ON dynamometry_assessments;
CREATE POLICY "Enable all access for dynamometry_assessments" ON dynamometry_assessments FOR ALL USING (true) WITH CHECK (true);
