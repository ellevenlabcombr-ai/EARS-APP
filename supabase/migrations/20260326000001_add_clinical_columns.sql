-- Migration to add missing clinical columns to athletes and appointments

-- 1. Add readiness to athletes
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'athletes' AND column_name = 'readiness') THEN
        ALTER TABLE athletes ADD COLUMN readiness INTEGER DEFAULT 100;
    END IF;
END $$;

-- 2. Add missing columns to appointments
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'date') THEN
        ALTER TABLE appointments ADD COLUMN date DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'notes') THEN
        ALTER TABLE appointments ADD COLUMN notes TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'pain_level') THEN
        ALTER TABLE appointments ADD COLUMN pain_level INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'readiness_score') THEN
        ALTER TABLE appointments ADD COLUMN readiness_score INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'alert_flag') THEN
        ALTER TABLE appointments ADD COLUMN alert_flag BOOLEAN DEFAULT false;
    END IF;
END $$;
