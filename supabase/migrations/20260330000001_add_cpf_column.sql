-- Add cpf column to athletes table
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'athletes' AND column_name = 'cpf') THEN
        ALTER TABLE public.athletes ADD COLUMN cpf TEXT;
    END IF;
END $$;
