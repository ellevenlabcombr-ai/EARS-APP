-- Migration to add gamification columns to athletes table

DO $$ 
BEGIN
    -- Add xp column
    BEGIN
        ALTER TABLE public.athletes ADD COLUMN xp INTEGER DEFAULT 0;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    -- Add coins column
    BEGIN
        ALTER TABLE public.athletes ADD COLUMN coins INTEGER DEFAULT 0;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;
END $$;

-- Notify PostgREST to reload the schema cache
NOTIFY pgrst, 'reload schema';
