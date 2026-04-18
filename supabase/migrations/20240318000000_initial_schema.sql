-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. Create Tables
-- ==========================================

-- Athletes Table
CREATE TABLE IF NOT EXISTS public.athletes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    xp INTEGER DEFAULT 0,
    coins INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Check-ins Table
CREATE TABLE IF NOT EXISTS public.check_ins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    athlete_id UUID REFERENCES public.athletes(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Core metrics (1-5 scale)
    sleep_quality INTEGER NOT NULL CHECK (sleep_quality >= 1 AND sleep_quality <= 5),
    stress_level INTEGER NOT NULL CHECK (stress_level >= 1 AND stress_level <= 5),
    muscle_soreness INTEGER NOT NULL CHECK (muscle_soreness >= 1 AND muscle_soreness <= 5),
    energy_level INTEGER NOT NULL CHECK (energy_level >= 1 AND energy_level <= 5),
    
    -- Additional metrics (1-5 scale)
    hydration INTEGER DEFAULT 3 CHECK (hydration >= 1 AND hydration <= 5),
    nutrition INTEGER DEFAULT 3 CHECK (nutrition >= 1 AND nutrition <= 5),
    mood INTEGER DEFAULT 3 CHECK (mood >= 1 AND mood <= 5),
    pre_training_meal INTEGER DEFAULT 3 CHECK (pre_training_meal >= 1 AND pre_training_meal <= 5),
    training_recovery INTEGER DEFAULT 3 CHECK (training_recovery >= 1 AND training_recovery <= 5),
    confidence INTEGER DEFAULT 3 CHECK (confidence >= 1 AND confidence <= 5),
    leg_heaviness INTEGER DEFAULT 3 CHECK (leg_heaviness >= 1 AND leg_heaviness <= 5),
    overall_wellbeing INTEGER DEFAULT 3 CHECK (overall_wellbeing >= 1 AND overall_wellbeing <= 5),
    
    -- Other metrics
    sleep_hours NUMERIC DEFAULT 8,
    readiness_score INTEGER NOT NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Pain Reports Table
CREATE TABLE IF NOT EXISTS public.pain_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    check_in_id UUID REFERENCES public.check_ins(id) ON DELETE CASCADE,
    athlete_id UUID REFERENCES public.athletes(id) ON DELETE CASCADE,
    body_part_id TEXT NOT NULL,
    pain_level INTEGER NOT NULL CHECK (pain_level >= 1 AND pain_level <= 10),
    pain_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Protocols Table
CREATE TABLE IF NOT EXISTS public.protocols (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    athlete_id UUID REFERENCES public.athletes(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    date_assigned DATE NOT NULL DEFAULT CURRENT_DATE,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);


-- ==========================================
-- 2. Row Level Security (RLS) Policies
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE public.athletes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pain_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.protocols ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to allow re-running this script safely)
DROP POLICY IF EXISTS "Allow public access to athletes" ON public.athletes;
DROP POLICY IF EXISTS "Allow public access to check_ins" ON public.check_ins;
DROP POLICY IF EXISTS "Allow public access to pain_reports" ON public.pain_reports;
DROP POLICY IF EXISTS "Allow public access to protocols" ON public.protocols;

-- Create policies allowing full access for the prototype
-- Note: In a production app with authentication, you would restrict this using auth.uid()
CREATE POLICY "Allow public access to athletes" ON public.athletes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to check_ins" ON public.check_ins FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to pain_reports" ON public.pain_reports FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to protocols" ON public.protocols FOR ALL USING (true) WITH CHECK (true);


-- ==========================================
-- 3. Seed Data (Initial Athletes)
-- ==========================================

-- Insert the default test athlete (João) so the hardcoded ID in AthleteDashboard works
INSERT INTO public.athletes (id, name, category) 
VALUES ('11111111-1111-1111-1111-111111111111', 'João Silva', 'Profissional')
ON CONFLICT (id) DO NOTHING;

-- Insert some additional mock athletes for the PhysioDashboard
INSERT INTO public.athletes (id, name, category) 
VALUES 
    ('22222222-2222-2222-2222-222222222222', 'Maria Santos', 'Sub-15'),
    ('33333333-3333-3333-3333-333333333333', 'Pedro Costa', 'Sub-19'),
    ('44444444-4444-4444-4444-444444444444', 'Ana Oliveira', 'Sub-13')
ON CONFLICT (id) DO NOTHING;
