-- Migration para corrigir e padronizar a tabela de agendamentos (appointments)

-- 1. Criar a tabela se ela não existir
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    athlete_id UUID REFERENCES public.athletes(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL DEFAULT 'Atendimento',
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    type TEXT,
    session_type TEXT NOT NULL DEFAULT 'clinical',
    status TEXT DEFAULT 'scheduled',
    notes TEXT,
    pain_level INTEGER,
    readiness_score INTEGER,
    alert_flag BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Bloco seguro para adicionar colunas caso a tabela já exista, mas falte algo
DO $$ 
BEGIN
    -- Adicionar 'title' se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'title') THEN
        ALTER TABLE public.appointments ADD COLUMN title TEXT NOT NULL DEFAULT 'Atendimento';
    END IF;

    -- Renomear 'appointment_date' para 'date' se necessário, ou criar 'date'
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'date') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'appointment_date') THEN
            ALTER TABLE public.appointments RENAME COLUMN appointment_date TO date;
        ELSE
            ALTER TABLE public.appointments ADD COLUMN date DATE NOT NULL DEFAULT CURRENT_DATE;
        END IF;
    END IF;

    -- Adicionar 'session_type' se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'session_type') THEN
        ALTER TABLE public.appointments ADD COLUMN session_type TEXT NOT NULL DEFAULT 'clinical';
    END IF;

    -- Adicionar 'notes' se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'notes') THEN
        ALTER TABLE public.appointments ADD COLUMN notes TEXT;
    END IF;
    
    -- Adicionar 'type' se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'type') THEN
        ALTER TABLE public.appointments ADD COLUMN type TEXT;
    END IF;
END $$;

-- 3. Configurar Políticas de Segurança (RLS - Row Level Security)
-- Habilitar RLS
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas para evitar conflitos (opcional, mas recomendado para limpar)
DROP POLICY IF EXISTS "Enable read access for all users" ON public.appointments;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.appointments;
DROP POLICY IF EXISTS "Enable update for all users" ON public.appointments;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.appointments;
DROP POLICY IF EXISTS "Allow all operations" ON public.appointments;

-- Criar política permissiva para desenvolvimento (Permite TUDO)
-- NOTA: Em produção, você deve restringir isso apenas para usuários autenticados (auth.uid() = user_id)
CREATE POLICY "Allow all operations" ON public.appointments
    FOR ALL
    USING (true)
    WITH CHECK (true);
