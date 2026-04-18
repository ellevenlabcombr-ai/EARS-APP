-- Migration to fix the 'assessment_type' NOT NULL constraint violation
-- This migration makes the legacy 'assessment_type' column nullable if it exists,
-- as the application has moved to using the 'type' column.

DO $$
BEGIN
    -- Check if the column 'assessment_type' exists in 'clinical_assessments'
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'clinical_assessments' 
        AND column_name = 'assessment_type'
    ) THEN
        -- Make it nullable to prevent constraint violations
        ALTER TABLE public.clinical_assessments ALTER COLUMN assessment_type DROP NOT NULL;
        
        -- Set a default value so that if it's omitted in the insert (e.g. by PostgREST cache) it doesn't fail
        ALTER TABLE public.clinical_assessments ALTER COLUMN assessment_type SET DEFAULT 'functional';
        
        -- Optionally, if 'type' is empty but 'assessment_type' has data, we could migrate it
        -- UPDATE public.clinical_assessments SET type = assessment_type WHERE type IS NULL OR type = 'functional';
    END IF;

    -- Ensure 'type' column exists and is NOT NULL (should already be handled by other migrations)
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'clinical_assessments' 
        AND column_name = 'type'
    ) THEN
        ALTER TABLE public.clinical_assessments ADD COLUMN type TEXT NOT NULL DEFAULT 'functional';
    END IF;

    -- Ensure 'data' column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'clinical_assessments' 
        AND column_name = 'data'
    ) THEN
        ALTER TABLE public.clinical_assessments ADD COLUMN data JSONB NOT NULL DEFAULT '{}';
    END IF;
END $$;

-- Recarregar cache do PostgREST
NOTIFY pgrst, 'reload schema';
