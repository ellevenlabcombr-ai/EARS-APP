-- Migration to add all new columns to check_ins and pain_reports
-- This script uses DO blocks to safely add columns only if they don't exist

DO $$ 
BEGIN
    -- Add columns to check_ins
    BEGIN
        ALTER TABLE public.check_ins ADD COLUMN hydration INTEGER DEFAULT 3 CHECK (hydration >= 1 AND hydration <= 5);
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE public.check_ins ADD COLUMN nutrition INTEGER DEFAULT 3 CHECK (nutrition >= 1 AND nutrition <= 5);
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE public.check_ins ADD COLUMN mood INTEGER DEFAULT 3 CHECK (mood >= 1 AND mood <= 5);
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE public.check_ins ADD COLUMN sleep_hours NUMERIC DEFAULT 8;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE public.check_ins ADD COLUMN pre_training_meal INTEGER DEFAULT 3 CHECK (pre_training_meal >= 1 AND pre_training_meal <= 5);
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE public.check_ins ADD COLUMN training_recovery INTEGER DEFAULT 3 CHECK (training_recovery >= 1 AND training_recovery <= 5);
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE public.check_ins ADD COLUMN confidence INTEGER DEFAULT 3 CHECK (confidence >= 1 AND confidence <= 5);
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE public.check_ins ADD COLUMN leg_heaviness INTEGER DEFAULT 3 CHECK (leg_heaviness >= 1 AND leg_heaviness <= 5);
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE public.check_ins ADD COLUMN overall_wellbeing INTEGER DEFAULT 3 CHECK (overall_wellbeing >= 1 AND overall_wellbeing <= 5);
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    -- Add columns to pain_reports
    BEGIN
        ALTER TABLE public.pain_reports ADD COLUMN pain_type TEXT;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

END $$;

-- Notify PostgREST to reload the schema cache
NOTIFY pgrst, 'reload schema';
