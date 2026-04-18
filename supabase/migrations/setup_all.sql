-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create the base table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.athletes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add all columns safely
DO $$ 
BEGIN
    -- Basic Info
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'athletes' AND column_name = 'category') THEN
        ALTER TABLE public.athletes ADD COLUMN category TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'athletes' AND column_name = 'nickname') THEN
        ALTER TABLE public.athletes ADD COLUMN nickname TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'athletes' AND column_name = 'email') THEN
        ALTER TABLE public.athletes ADD COLUMN email TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'athletes' AND column_name = 'phone') THEN
        ALTER TABLE public.athletes ADD COLUMN phone TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'athletes' AND column_name = 'gender') THEN
        ALTER TABLE public.athletes ADD COLUMN gender TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'athletes' AND column_name = 'rg') THEN
        ALTER TABLE public.athletes ADD COLUMN rg TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'athletes' AND column_name = 'birth_date') THEN
        ALTER TABLE public.athletes ADD COLUMN birth_date DATE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'athletes' AND column_name = 'weight') THEN
        ALTER TABLE public.athletes ADD COLUMN weight DECIMAL(5,2);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'athletes' AND column_name = 'height') THEN
        ALTER TABLE public.athletes ADD COLUMN height DECIMAL(5,2);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'athletes' AND column_name = 'avatar_url') THEN
        ALTER TABLE public.athletes ADD COLUMN avatar_url TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'athletes' AND column_name = 'club') THEN
        ALTER TABLE public.athletes ADD COLUMN club TEXT;
    END IF;

    -- Address
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'athletes' AND column_name = 'cep') THEN
        ALTER TABLE public.athletes ADD COLUMN cep TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'athletes' AND column_name = 'logradouro') THEN
        ALTER TABLE public.athletes ADD COLUMN logradouro TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'athletes' AND column_name = 'address_number') THEN
        ALTER TABLE public.athletes ADD COLUMN address_number TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'athletes' AND column_name = 'address_complement') THEN
        ALTER TABLE public.athletes ADD COLUMN address_complement TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'athletes' AND column_name = 'bairro') THEN
        ALTER TABLE public.athletes ADD COLUMN bairro TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'athletes' AND column_name = 'cidade') THEN
        ALTER TABLE public.athletes ADD COLUMN cidade TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'athletes' AND column_name = 'uf') THEN
        ALTER TABLE public.athletes ADD COLUMN uf TEXT;
    END IF;

    -- Health
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'athletes' AND column_name = 'convenio') THEN
        ALTER TABLE public.athletes ADD COLUMN convenio TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'athletes' AND column_name = 'carteirinha') THEN
        ALTER TABLE public.athletes ADD COLUMN carteirinha TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'athletes' AND column_name = 'hospital') THEN
        ALTER TABLE public.athletes ADD COLUMN hospital TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'athletes' AND column_name = 'has_allergy') THEN
        ALTER TABLE public.athletes ADD COLUMN has_allergy BOOLEAN DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'athletes' AND column_name = 'alergia_desc') THEN
        ALTER TABLE public.athletes ADD COLUMN alergia_desc TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'athletes' AND column_name = 'medicacao') THEN
        ALTER TABLE public.athletes ADD COLUMN medicacao TEXT;
    END IF;

    -- Sports
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'athletes' AND column_name = 'lado_dominante') THEN
        ALTER TABLE public.athletes ADD COLUMN lado_dominante TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'athletes' AND column_name = 'modalidade') THEN
        ALTER TABLE public.athletes ADD COLUMN modalidade TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'athletes' AND column_name = 'posicao') THEN
        ALTER TABLE public.athletes ADD COLUMN posicao TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'athletes' AND column_name = 'status') THEN
        ALTER TABLE public.athletes ADD COLUMN status TEXT;
    END IF;

    -- Guardian
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'athletes' AND column_name = 'guardian_name') THEN
        ALTER TABLE public.athletes ADD COLUMN guardian_name TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'athletes' AND column_name = 'guardian_cpf') THEN
        ALTER TABLE public.athletes ADD COLUMN guardian_cpf TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'athletes' AND column_name = 'guardian_phone') THEN
        ALTER TABLE public.athletes ADD COLUMN guardian_phone TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'athletes' AND column_name = 'guardian_email') THEN
        ALTER TABLE public.athletes ADD COLUMN guardian_email TEXT;
    END IF;

    -- System
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'athletes' AND column_name = 'readiness_score') THEN
        ALTER TABLE public.athletes ADD COLUMN readiness_score INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'athletes' AND column_name = 'risk_level') THEN
        ALTER TABLE public.athletes ADD COLUMN risk_level TEXT DEFAULT 'Baixo';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'athletes' AND column_name = 'xp') THEN
        ALTER TABLE public.athletes ADD COLUMN xp INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'athletes' AND column_name = 'coins') THEN
        ALTER TABLE public.athletes ADD COLUMN coins INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'athletes' AND column_name = 'updated_at') THEN
        ALTER TABLE public.athletes ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- 3. Enable RLS and create policy
ALTER TABLE public.athletes ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'athletes' AND policyname = 'Enable all operations for all users'
    ) THEN
        CREATE POLICY "Enable all operations for all users" ON public.athletes FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;
