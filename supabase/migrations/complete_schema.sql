-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Athletes Table
CREATE TABLE IF NOT EXISTS athletes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    xp INTEGER DEFAULT 0,
    coins INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create Check-ins Table
CREATE TABLE IF NOT EXISTS check_ins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    athlete_id UUID REFERENCES athletes(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    sleep_quality INTEGER NOT NULL CHECK (sleep_quality >= 1 AND sleep_quality <= 5),
    stress_level INTEGER NOT NULL CHECK (stress_level >= 1 AND stress_level <= 5),
    muscle_soreness INTEGER NOT NULL CHECK (muscle_soreness >= 1 AND muscle_soreness <= 5),
    energy_level INTEGER NOT NULL CHECK (energy_level >= 1 AND energy_level <= 5),
    hydration INTEGER DEFAULT 3 CHECK (hydration >= 1 AND hydration <= 5),
    nutrition INTEGER DEFAULT 3 CHECK (nutrition >= 1 AND nutrition <= 5),
    mood INTEGER DEFAULT 3 CHECK (mood >= 1 AND mood <= 5),
    sleep_hours NUMERIC DEFAULT 8,
    pre_training_meal INTEGER DEFAULT 3 CHECK (pre_training_meal >= 1 AND pre_training_meal <= 5),
    training_recovery INTEGER DEFAULT 3 CHECK (training_recovery >= 1 AND training_recovery <= 5),
    confidence INTEGER DEFAULT 3 CHECK (confidence >= 1 AND confidence <= 5),
    leg_heaviness INTEGER DEFAULT 3 CHECK (leg_heaviness >= 1 AND leg_heaviness <= 5),
    overall_wellbeing INTEGER DEFAULT 3 CHECK (overall_wellbeing >= 1 AND overall_wellbeing <= 5),
    readiness_score INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create Pain Reports Table
CREATE TABLE IF NOT EXISTS pain_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    check_in_id UUID REFERENCES check_ins(id) ON DELETE CASCADE,
    athlete_id UUID REFERENCES athletes(id) ON DELETE CASCADE,
    body_part_id TEXT NOT NULL,
    pain_level INTEGER NOT NULL CHECK (pain_level >= 1 AND pain_level <= 10),
    pain_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create Protocols Table
CREATE TABLE IF NOT EXISTS protocols (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    athlete_id UUID REFERENCES athletes(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    date_assigned DATE NOT NULL DEFAULT CURRENT_DATE,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Insert some initial mock data for testing
INSERT INTO athletes (id, name, category) VALUES
('11111111-1111-1111-1111-111111111111', 'João Silva', 'Sub-20'),
('22222222-2222-2222-2222-222222222222', 'Pedro Santos', 'Profissional'),
('33333333-3333-3333-3333-333333333333', 'Lucas Oliveira', 'Sub-17'),
('44444444-4444-4444-4444-444444444444', 'Marcos Costa', 'Sub-20'),
('55555555-5555-5555-5555-555555555555', 'Rafael Souza', 'Profissional')
ON CONFLICT (id) DO NOTHING;

-- Insert some initial check-in data
INSERT INTO check_ins (id, athlete_id, sleep_quality, stress_level, muscle_soreness, energy_level, readiness_score) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 4, 3, 2, 4, 85),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 2, 4, 4, 2, 45),
('cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333', 5, 2, 1, 5, 95)
ON CONFLICT (id) DO NOTHING;

-- Insert some initial pain reports
INSERT INTO pain_reports (id, check_in_id, athlete_id, body_part_id, pain_level, pain_type) VALUES
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'knee_r_f', 4, 'joint'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'shoulder_l_f', 7, 'muscle'),
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'calf_r_f', 6, 'sharp')
ON CONFLICT (id) DO NOTHING;

-- Create financial tables

-- Transactions table (for revenues and expenses)
CREATE TABLE IF NOT EXISTS transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type VARCHAR(20) NOT NULL CHECK (type IN ('revenue', 'expense')),
    description TEXT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    date DATE NOT NULL,
    category VARCHAR(100),
    status VARCHAR(20) NOT NULL CHECK (status IN ('paid', 'pending', 'cancelled')),
    athlete_id UUID REFERENCES athletes(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Billings table (for recurring or scheduled payments)
CREATE TABLE IF NOT EXISTS billings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
    plan_name VARCHAR(100) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for financial tables
CREATE INDEX IF NOT EXISTS idx_transactions_athlete_id ON transactions(athlete_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_billings_athlete_id ON billings(athlete_id);
CREATE INDEX IF NOT EXISTS idx_billings_due_date ON billings(due_date);
CREATE INDEX IF NOT EXISTS idx_billings_status ON billings(status);
