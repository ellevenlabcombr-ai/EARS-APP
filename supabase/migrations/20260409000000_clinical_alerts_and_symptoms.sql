-- Add symptoms column to wellness_records
ALTER TABLE wellness_records ADD COLUMN IF NOT EXISTS symptoms JSONB DEFAULT '{}';

-- Create clinical_alerts table
CREATE TABLE IF NOT EXISTS clinical_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  athlete_id UUID REFERENCES athletes(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'readiness_drop', 'sleep_deprivation', 'pain_increase', 'dehydration', 'symptom_alert', etc.
  message TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved')),
  source TEXT, -- 'wellness', 'assessment', 'manual'
  related_check_in_id UUID REFERENCES check_ins(id) ON DELETE SET NULL,
  related_assessment_id UUID REFERENCES clinical_assessments(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID -- If we had a professionals table, we could link it
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_clinical_alerts_athlete_id ON clinical_alerts(athlete_id);
CREATE INDEX IF NOT EXISTS idx_clinical_alerts_status ON clinical_alerts(status);
CREATE INDEX IF NOT EXISTS idx_clinical_alerts_severity ON clinical_alerts(severity);

-- Enable RLS
ALTER TABLE clinical_alerts ENABLE ROW LEVEL SECURITY;

-- Policies (simplified for now as per project pattern)
CREATE POLICY "Enable read access for all users" ON clinical_alerts FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON clinical_alerts FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON clinical_alerts FOR UPDATE USING (true);
