-- MIGRATION: Adicionar campo group_name à tabela athletes
-- Execute este SQL no Editor SQL do seu painel Supabase

-- 1. Adicionar a coluna group_name
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS group_name TEXT;

-- 2. Criar um índice para melhorar a performance de filtragem por grupo
CREATE INDEX IF NOT EXISTS idx_athletes_group_name ON athletes(group_name);

-- 3. (Opcional) Atualizar atletas existentes que não possuem grupo para 'all' ou null
-- UPDATE athletes SET group_name = NULL WHERE group_name IS NULL;

-- 3. Migração para Agenda (Smart Agenda)
-- Adiciona a tabela agenda_events e as novas colunas necessárias

CREATE TABLE IF NOT EXISTS public.agenda_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    subcategory TEXT,
    location TEXT,
    address TEXT,
    is_all_day BOOLEAN DEFAULT FALSE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    athlete_id UUID REFERENCES public.athletes(id),
    risk_score INTEGER DEFAULT 0,
    priority TEXT DEFAULT 'medium',
    origin TEXT DEFAULT 'manual',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Adicionar colunas caso a tabela já exista mas esteja incompleta
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agenda_events' AND column_name = 'location') THEN
        ALTER TABLE public.agenda_events ADD COLUMN location TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agenda_events' AND column_name = 'address') THEN
        ALTER TABLE public.agenda_events ADD COLUMN address TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agenda_events' AND column_name = 'is_all_day') THEN
        ALTER TABLE public.agenda_events ADD COLUMN is_all_day BOOLEAN DEFAULT FALSE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agenda_events' AND column_name = 'status') THEN
        ALTER TABLE public.agenda_events ADD COLUMN status TEXT DEFAULT 'pending';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agenda_events' AND column_name = 'reminder_minutes') THEN
        ALTER TABLE public.agenda_events ADD COLUMN reminder_minutes INTEGER DEFAULT NULL;
    END IF;

    -- Garantir que o ID tenha default automático
    ALTER TABLE public.agenda_events ALTER COLUMN id SET DEFAULT gen_random_uuid();
END $$;

ALTER TABLE public.agenda_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir tudo para todos" ON agenda_events;
CREATE POLICY "Permitir tudo para todos" ON agenda_events FOR ALL USING (true) WITH CHECK (true);
