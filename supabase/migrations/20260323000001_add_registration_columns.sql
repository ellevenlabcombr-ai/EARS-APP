-- Migration to add missing columns to athletes table for full registration flow
DO $$ 
BEGIN
    -- Add nickname column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'athletes' AND column_name = 'nickname') THEN
        ALTER TABLE public.athletes ADD COLUMN nickname TEXT;
    END IF;

    -- Add email column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'athletes' AND column_name = 'email') THEN
        ALTER TABLE public.athletes ADD COLUMN email TEXT;
    END IF;

    -- Add phone column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'athletes' AND column_name = 'phone') THEN
        ALTER TABLE public.athletes ADD COLUMN phone TEXT;
    END IF;

    -- Add gender column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'athletes' AND column_name = 'gender') THEN
        ALTER TABLE public.athletes ADD COLUMN gender TEXT;
    END IF;

    -- Add rg column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'athletes' AND column_name = 'rg') THEN
        ALTER TABLE public.athletes ADD COLUMN rg TEXT;
    END IF;

    -- Add club column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'athletes' AND column_name = 'club') THEN
        ALTER TABLE public.athletes ADD COLUMN club TEXT;
    END IF;

    -- Add address columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'athletes' AND column_name = 'address_number') THEN
        ALTER TABLE public.athletes ADD COLUMN address_number TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'athletes' AND column_name = 'address_complement') THEN
        ALTER TABLE public.athletes ADD COLUMN address_complement TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'athletes' AND column_name = 'cep') THEN
        ALTER TABLE public.athletes ADD COLUMN cep TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'athletes' AND column_name = 'logradouro') THEN
        ALTER TABLE public.athletes ADD COLUMN logradouro TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'athletes' AND column_name = 'bairro') THEN
        ALTER TABLE public.athletes ADD COLUMN bairro TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'athletes' AND column_name = 'cidade') THEN
        ALTER TABLE public.athletes ADD COLUMN cidade TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'athletes' AND column_name = 'estado') THEN
        ALTER TABLE public.athletes ADD COLUMN estado TEXT;
    END IF;

    -- Add health columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'athletes' AND column_name = 'convenio') THEN
        ALTER TABLE public.athletes ADD COLUMN convenio TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'athletes' AND column_name = 'carteirinha') THEN
        ALTER TABLE public.athletes ADD COLUMN carteirinha TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'athletes' AND column_name = 'hospital') THEN
        ALTER TABLE public.athletes ADD COLUMN hospital TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'athletes' AND column_name = 'alergia_desc') THEN
        ALTER TABLE public.athletes ADD COLUMN alergia_desc TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'athletes' AND column_name = 'medicacao') THEN
        ALTER TABLE public.athletes ADD COLUMN medicacao TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'athletes' AND column_name = 'has_allergy') THEN
        ALTER TABLE public.athletes ADD COLUMN has_allergy BOOLEAN DEFAULT FALSE;
    END IF;

    -- Add sports columns
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

    -- Add guardian columns
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

END $$;

-- Notify PostgREST to reload the schema cache
NOTIFY pgrst, 'reload schema';
