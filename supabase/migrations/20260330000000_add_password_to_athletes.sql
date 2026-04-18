-- Migration to add password column to athletes table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'athletes' AND column_name = 'password') THEN
        ALTER TABLE public.athletes ADD COLUMN password TEXT;
    END IF;
END $$;

-- Notify PostgREST to reload the schema cache
NOTIFY pgrst, 'reload schema';
