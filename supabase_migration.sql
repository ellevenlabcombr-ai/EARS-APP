CREATE TABLE IF NOT EXISTS public.athletes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    date_of_birth DATE,
    gender TEXT,
    category TEXT,
    modalidade TEXT,
    posicao TEXT,
    risk_level TEXT DEFAULT 'Baixo',
    status TEXT DEFAULT 'Ativo',
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.athlete_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    athlete_id UUID REFERENCES public.athletes(id) ON DELETE CASCADE,
    document_name TEXT NOT NULL,
    category TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT,
    mime_type TEXT,
    file_size BIGINT,
    file_url TEXT NOT NULL,
    version_group_id UUID NOT NULL,
    version_number INTEGER DEFAULT 1,
    is_current_version BOOLEAN DEFAULT true,
    version_note TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.wellness_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    athlete_id UUID REFERENCES public.athletes(id) ON DELETE CASCADE,
    record_date DATE NOT NULL,
    readiness_score NUMERIC,
    sleep_quality NUMERIC,
    sleep_hours NUMERIC,
    stress_level NUMERIC,
    fatigue_level NUMERIC,
    muscle_soreness NUMERIC,
    menstrual_cycle TEXT,
    menstrual_symptoms TEXT[],
    hydration_perception NUMERIC,
    hydration_score NUMERIC,
    urine_color NUMERIC,
    symptoms TEXT[],
    comments TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.clinical_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    athlete_id UUID REFERENCES public.athletes(id) ON DELETE CASCADE,
    note_date TIMESTAMPTZ DEFAULT now(),
    generated_text TEXT,
    observations TEXT,
    is_signed BOOLEAN DEFAULT false,
    professional_name TEXT,
    pain_level NUMERIC,
    feeling TEXT,
    regions TEXT[],
    treatments TEXT[],
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.clinical_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    athlete_id UUID REFERENCES public.athletes(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    severity TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT now(),
    resolved_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.sleep_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), athlete_id UUID REFERENCES public.athletes(id) ON DELETE CASCADE, assessment_date TIMESTAMPTZ DEFAULT now(), score NUMERIC, classification TEXT, classification_color TEXT, alerts TEXT[], raw_data JSONB, clinical_report TEXT, clinical_alerts JSONB, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.sleep_assessments ADD COLUMN IF NOT EXISTS clinical_report TEXT;
ALTER TABLE public.sleep_assessments ADD COLUMN IF NOT EXISTS clinical_alerts JSONB;

CREATE TABLE IF NOT EXISTS public.orthopedic_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), athlete_id UUID REFERENCES public.athletes(id) ON DELETE CASCADE, assessment_date TIMESTAMPTZ DEFAULT now(), score NUMERIC, classification TEXT, classification_color TEXT, alerts TEXT[], raw_data JSONB, clinical_report TEXT, clinical_alerts JSONB, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.orthopedic_assessments ADD COLUMN IF NOT EXISTS clinical_report TEXT;
ALTER TABLE public.orthopedic_assessments ADD COLUMN IF NOT EXISTS clinical_alerts JSONB;

CREATE TABLE IF NOT EXISTS public.biomechanical_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), athlete_id UUID REFERENCES public.athletes(id) ON DELETE CASCADE, assessment_date TIMESTAMPTZ DEFAULT now(), score NUMERIC, classification TEXT, classification_color TEXT, alerts TEXT[], raw_data JSONB, clinical_report TEXT, clinical_alerts JSONB, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.biomechanical_assessments ADD COLUMN IF NOT EXISTS clinical_report TEXT;
ALTER TABLE public.biomechanical_assessments ADD COLUMN IF NOT EXISTS clinical_alerts JSONB;

CREATE TABLE IF NOT EXISTS public.physical_load_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), athlete_id UUID REFERENCES public.athletes(id) ON DELETE CASCADE, assessment_date TIMESTAMPTZ DEFAULT now(), score NUMERIC, classification TEXT, classification_color TEXT, alerts TEXT[], raw_data JSONB, clinical_report TEXT, clinical_alerts JSONB, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.physical_load_assessments ADD COLUMN IF NOT EXISTS clinical_report TEXT;
ALTER TABLE public.physical_load_assessments ADD COLUMN IF NOT EXISTS clinical_alerts JSONB;

CREATE TABLE IF NOT EXISTS public.performance_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), athlete_id UUID REFERENCES public.athletes(id) ON DELETE CASCADE, assessment_date TIMESTAMPTZ DEFAULT now(), score NUMERIC, classification TEXT, classification_color TEXT, alerts TEXT[], raw_data JSONB, clinical_report TEXT, clinical_alerts JSONB, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.performance_assessments ADD COLUMN IF NOT EXISTS clinical_report TEXT;
ALTER TABLE public.performance_assessments ADD COLUMN IF NOT EXISTS clinical_alerts JSONB;

CREATE TABLE IF NOT EXISTS public.neurological_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), athlete_id UUID REFERENCES public.athletes(id) ON DELETE CASCADE, assessment_date TIMESTAMPTZ DEFAULT now(), score NUMERIC, classification TEXT, classification_color TEXT, alerts TEXT[], raw_data JSONB, clinical_report TEXT, clinical_alerts JSONB, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.neurological_assessments ADD COLUMN IF NOT EXISTS clinical_report TEXT;
ALTER TABLE public.neurological_assessments ADD COLUMN IF NOT EXISTS clinical_alerts JSONB;

CREATE TABLE IF NOT EXISTS public.psychological_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), athlete_id UUID REFERENCES public.athletes(id) ON DELETE CASCADE, assessment_date TIMESTAMPTZ DEFAULT now(), score NUMERIC, classification TEXT, classification_color TEXT, alerts TEXT[], raw_data JSONB, clinical_report TEXT, clinical_alerts JSONB, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.psychological_assessments ADD COLUMN IF NOT EXISTS clinical_report TEXT;
ALTER TABLE public.psychological_assessments ADD COLUMN IF NOT EXISTS clinical_alerts JSONB;

CREATE TABLE IF NOT EXISTS public.nutritional_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), athlete_id UUID REFERENCES public.athletes(id) ON DELETE CASCADE, assessment_date TIMESTAMPTZ DEFAULT now(), score NUMERIC, classification TEXT, classification_color TEXT, alerts TEXT[], raw_data JSONB, clinical_report TEXT, clinical_alerts JSONB, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.nutritional_assessments ADD COLUMN IF NOT EXISTS clinical_report TEXT;
ALTER TABLE public.nutritional_assessments ADD COLUMN IF NOT EXISTS clinical_alerts JSONB;

CREATE TABLE IF NOT EXISTS public.reds_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), athlete_id UUID REFERENCES public.athletes(id) ON DELETE CASCADE, assessment_date TIMESTAMPTZ DEFAULT now(), score NUMERIC, classification TEXT, classification_color TEXT, alerts TEXT[], raw_data JSONB, clinical_report TEXT, clinical_alerts JSONB, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.reds_assessments ADD COLUMN IF NOT EXISTS clinical_report TEXT;
ALTER TABLE public.reds_assessments ADD COLUMN IF NOT EXISTS clinical_alerts JSONB;

CREATE TABLE IF NOT EXISTS public.anthropometric_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), athlete_id UUID REFERENCES public.athletes(id) ON DELETE CASCADE, assessment_date TIMESTAMPTZ DEFAULT now(), score NUMERIC, classification TEXT, classification_color TEXT, alerts TEXT[], raw_data JSONB, clinical_report TEXT, clinical_alerts JSONB, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.anthropometric_assessments ADD COLUMN IF NOT EXISTS clinical_report TEXT;
ALTER TABLE public.anthropometric_assessments ADD COLUMN IF NOT EXISTS clinical_alerts JSONB;

CREATE TABLE IF NOT EXISTS public.maturation_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), athlete_id UUID REFERENCES public.athletes(id) ON DELETE CASCADE, assessment_date TIMESTAMPTZ DEFAULT now(), score NUMERIC, classification TEXT, classification_color TEXT, alerts TEXT[], raw_data JSONB, clinical_report TEXT, clinical_alerts JSONB, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.maturation_assessments ADD COLUMN IF NOT EXISTS clinical_report TEXT;
ALTER TABLE public.maturation_assessments ADD COLUMN IF NOT EXISTS clinical_alerts JSONB;

CREATE TABLE IF NOT EXISTS public.menstrual_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), athlete_id UUID REFERENCES public.athletes(id) ON DELETE CASCADE, assessment_date TIMESTAMPTZ DEFAULT now(), score NUMERIC, classification TEXT, classification_color TEXT, alerts TEXT[], raw_data JSONB, clinical_report TEXT, clinical_alerts JSONB, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.menstrual_assessments ADD COLUMN IF NOT EXISTS clinical_report TEXT;
ALTER TABLE public.menstrual_assessments ADD COLUMN IF NOT EXISTS clinical_alerts JSONB;

CREATE TABLE IF NOT EXISTS public.hydration_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), athlete_id UUID REFERENCES public.athletes(id) ON DELETE CASCADE, assessment_date TIMESTAMPTZ DEFAULT now(), score NUMERIC, classification TEXT, classification_color TEXT, alerts TEXT[], raw_data JSONB, clinical_report TEXT, clinical_alerts JSONB, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.hydration_assessments ADD COLUMN IF NOT EXISTS clinical_report TEXT;
ALTER TABLE public.hydration_assessments ADD COLUMN IF NOT EXISTS clinical_alerts JSONB;

CREATE TABLE IF NOT EXISTS public.functional_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), athlete_id UUID REFERENCES public.athletes(id) ON DELETE CASCADE, assessment_date TIMESTAMPTZ DEFAULT now(), score NUMERIC, classification TEXT, classification_color TEXT, alerts TEXT[], raw_data JSONB, clinical_report TEXT, clinical_alerts JSONB, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.functional_assessments ADD COLUMN IF NOT EXISTS clinical_report TEXT;
ALTER TABLE public.functional_assessments ADD COLUMN IF NOT EXISTS clinical_alerts JSONB;

CREATE TABLE IF NOT EXISTS public.dynamometry_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), athlete_id UUID REFERENCES public.athletes(id) ON DELETE CASCADE, assessment_date TIMESTAMPTZ DEFAULT now(), score NUMERIC, classification TEXT, classification_color TEXT, alerts TEXT[], raw_data JSONB, clinical_report TEXT, clinical_alerts JSONB, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.dynamometry_assessments ADD COLUMN IF NOT EXISTS clinical_report TEXT;
ALTER TABLE public.dynamometry_assessments ADD COLUMN IF NOT EXISTS clinical_alerts JSONB;

CREATE TABLE IF NOT EXISTS public.postural_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), athlete_id UUID REFERENCES public.athletes(id) ON DELETE CASCADE, assessment_date TIMESTAMPTZ DEFAULT now(), score NUMERIC, classification TEXT, classification_color TEXT, alerts TEXT[], raw_data JSONB, clinical_report TEXT, clinical_alerts JSONB, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.postural_assessments ADD COLUMN IF NOT EXISTS clinical_report TEXT;
ALTER TABLE public.postural_assessments ADD COLUMN IF NOT EXISTS clinical_alerts JSONB;

DROP VIEW IF EXISTS public.all_assessments;
CREATE OR REPLACE VIEW public.all_assessments AS
SELECT id, athlete_id, assessment_date, created_at, 'sleep' as assessment_type, score, classification, classification_color, alerts, raw_data, clinical_report, clinical_alerts, 'sleep_assessments' as source_table FROM public.sleep_assessments
UNION ALL
SELECT id, athlete_id, assessment_date, created_at, 'orthopedic' as assessment_type, score, classification, classification_color, alerts, raw_data, clinical_report, clinical_alerts, 'orthopedic_assessments' as source_table FROM public.orthopedic_assessments
UNION ALL
SELECT id, athlete_id, assessment_date, created_at, 'biomechanical' as assessment_type, score, classification, classification_color, alerts, raw_data, clinical_report, clinical_alerts, 'biomechanical_assessments' as source_table FROM public.biomechanical_assessments
UNION ALL
SELECT id, athlete_id, assessment_date, created_at, 'physical' as assessment_type, score, classification, classification_color, alerts, raw_data, clinical_report, clinical_alerts, 'physical_load_assessments' as source_table FROM public.physical_load_assessments
UNION ALL
SELECT id, athlete_id, assessment_date, created_at, 'performance' as assessment_type, score, classification, classification_color, alerts, raw_data, clinical_report, clinical_alerts, 'performance_assessments' as source_table FROM public.performance_assessments
UNION ALL
SELECT id, athlete_id, assessment_date, created_at, 'neurological' as assessment_type, score, classification, classification_color, alerts, raw_data, clinical_report, clinical_alerts, 'neurological_assessments' as source_table FROM public.neurological_assessments
UNION ALL
SELECT id, athlete_id, assessment_date, created_at, 'psychological' as assessment_type, score, classification, classification_color, alerts, raw_data, clinical_report, clinical_alerts, 'psychological_assessments' as source_table FROM public.psychological_assessments
UNION ALL
SELECT id, athlete_id, assessment_date, created_at, 'nutritional' as assessment_type, score, classification, classification_color, alerts, raw_data, clinical_report, clinical_alerts, 'nutritional_assessments' as source_table FROM public.nutritional_assessments
UNION ALL
SELECT id, athlete_id, assessment_date, created_at, 'reds' as assessment_type, score, classification, classification_color, alerts, raw_data, clinical_report, clinical_alerts, 'reds_assessments' as source_table FROM public.reds_assessments
UNION ALL
SELECT id, athlete_id, assessment_date, created_at, 'anthropometric' as assessment_type, score, classification, classification_color, alerts, raw_data, clinical_report, clinical_alerts, 'anthropometric_assessments' as source_table FROM public.anthropometric_assessments
UNION ALL
SELECT id, athlete_id, assessment_date, created_at, 'maturation' as assessment_type, score, classification, classification_color, alerts, raw_data, clinical_report, clinical_alerts, 'maturation_assessments' as source_table FROM public.maturation_assessments
UNION ALL
SELECT id, athlete_id, assessment_date, created_at, 'menstrual' as assessment_type, score, classification, classification_color, alerts, raw_data, clinical_report, clinical_alerts, 'menstrual_assessments' as source_table FROM public.menstrual_assessments
UNION ALL
SELECT id, athlete_id, assessment_date, created_at, 'hydration' as assessment_type, score, classification, classification_color, alerts, raw_data, clinical_report, clinical_alerts, 'hydration_assessments' as source_table FROM public.hydration_assessments
UNION ALL
SELECT id, athlete_id, assessment_date, created_at, 'functional' as assessment_type, score, classification, classification_color, alerts, raw_data, clinical_report, clinical_alerts, 'functional_assessments' as source_table FROM public.functional_assessments
UNION ALL
SELECT id, athlete_id, assessment_date, created_at, 'dynamometry' as assessment_type, score, classification, classification_color, alerts, raw_data, clinical_report, clinical_alerts, 'dynamometry_assessments' as source_table FROM public.dynamometry_assessments
UNION ALL
SELECT id, athlete_id, assessment_date, created_at, 'postural' as assessment_type, score, classification, classification_color, alerts, raw_data, clinical_report, clinical_alerts, 'postural_assessments' as source_table FROM public.postural_assessments;

CREATE TABLE IF NOT EXISTS public.sports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    positions TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.athletes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.athlete_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wellness_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sleep_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orthopedic_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.biomechanical_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.physical_load_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.neurological_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psychological_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutritional_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reds_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anthropometric_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maturation_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menstrual_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hydration_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.functional_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dynamometry_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.postural_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Access" ON public.athletes;
CREATE POLICY "Public Access" ON public.athletes FOR ALL USING (true);

DROP POLICY IF EXISTS "Public Access" ON public.athlete_attachments;
CREATE POLICY "Public Access" ON public.athlete_attachments FOR ALL USING (true);

DROP POLICY IF EXISTS "Public Access" ON public.wellness_records;
CREATE POLICY "Public Access" ON public.wellness_records FOR ALL USING (true);

DROP POLICY IF EXISTS "Public Access" ON public.clinical_notes;
CREATE POLICY "Public Access" ON public.clinical_notes FOR ALL USING (true);

DROP POLICY IF EXISTS "Public Access" ON public.clinical_alerts;
CREATE POLICY "Public Access" ON public.clinical_alerts FOR ALL USING (true);

DROP POLICY IF EXISTS "Public Access" ON public.sleep_assessments;
CREATE POLICY "Public Access" ON public.sleep_assessments FOR ALL USING (true);

DROP POLICY IF EXISTS "Public Access" ON public.orthopedic_assessments;
CREATE POLICY "Public Access" ON public.orthopedic_assessments FOR ALL USING (true);

DROP POLICY IF EXISTS "Public Access" ON public.biomechanical_assessments;
CREATE POLICY "Public Access" ON public.biomechanical_assessments FOR ALL USING (true);

DROP POLICY IF EXISTS "Public Access" ON public.physical_load_assessments;
CREATE POLICY "Public Access" ON public.physical_load_assessments FOR ALL USING (true);

DROP POLICY IF EXISTS "Public Access" ON public.performance_assessments;
CREATE POLICY "Public Access" ON public.performance_assessments FOR ALL USING (true);

DROP POLICY IF EXISTS "Public Access" ON public.neurological_assessments;
CREATE POLICY "Public Access" ON public.neurological_assessments FOR ALL USING (true);

DROP POLICY IF EXISTS "Public Access" ON public.psychological_assessments;
CREATE POLICY "Public Access" ON public.psychological_assessments FOR ALL USING (true);

DROP POLICY IF EXISTS "Public Access" ON public.nutritional_assessments;
CREATE POLICY "Public Access" ON public.nutritional_assessments FOR ALL USING (true);

DROP POLICY IF EXISTS "Public Access" ON public.reds_assessments;
CREATE POLICY "Public Access" ON public.reds_assessments FOR ALL USING (true);

DROP POLICY IF EXISTS "Public Access" ON public.anthropometric_assessments;
CREATE POLICY "Public Access" ON public.anthropometric_assessments FOR ALL USING (true);

DROP POLICY IF EXISTS "Public Access" ON public.maturation_assessments;
CREATE POLICY "Public Access" ON public.maturation_assessments FOR ALL USING (true);

DROP POLICY IF EXISTS "Public Access" ON public.menstrual_assessments;
CREATE POLICY "Public Access" ON public.menstrual_assessments FOR ALL USING (true);

DROP POLICY IF EXISTS "Public Access" ON public.hydration_assessments;
CREATE POLICY "Public Access" ON public.hydration_assessments FOR ALL USING (true);

DROP POLICY IF EXISTS "Public Access" ON public.functional_assessments;
CREATE POLICY "Public Access" ON public.functional_assessments FOR ALL USING (true);

DROP POLICY IF EXISTS "Public Access" ON public.dynamometry_assessments;
CREATE POLICY "Public Access" ON public.dynamometry_assessments FOR ALL USING (true);

DROP POLICY IF EXISTS "Public Access" ON public.postural_assessments;
CREATE POLICY "Public Access" ON public.postural_assessments FOR ALL USING (true);

DROP POLICY IF EXISTS "Public Access" ON public.sports;
CREATE POLICY "Public Access" ON public.sports FOR ALL USING (true);

CREATE TABLE IF NOT EXISTS public.agenda_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    subcategory TEXT,
    location TEXT,
    address TEXT,
    is_all_day BOOLEAN DEFAULT FALSE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    athlete_id UUID REFERENCES public.athletes(id),
    risk_score INTEGER DEFAULT 0,
    priority TEXT DEFAULT 'medium',
    origin TEXT DEFAULT 'manual',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Garantir colunas se já existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agenda_events' AND column_name = 'location') THEN
        ALTER TABLE public.agenda_events ADD COLUMN location TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agenda_events' AND column_name = 'address') THEN
        ALTER TABLE public.agenda_events ADD COLUMN address TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agenda_events' AND column_name = 'is_all_day') THEN
        ALTER TABLE public.agenda_events ADD COLUMN is_all_day BOOLEAN DEFAULT FALSE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agenda_events' AND column_name = 'status') THEN
        ALTER TABLE public.agenda_events ADD COLUMN status TEXT DEFAULT 'pending';
    END IF;
    -- Garantir default ID
    ALTER TABLE public.agenda_events ALTER COLUMN id SET DEFAULT gen_random_uuid();
END $$;

ALTER TABLE public.agenda_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Access" ON public.agenda_events;
CREATE POLICY "Public Access" ON public.agenda_events FOR ALL USING (true);
