-- Migration to enhance athlete_attachments table with versioning and metadata
DO $$ 
BEGIN 
    -- Add document_name
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='athlete_attachments' AND column_name='document_name') THEN
        ALTER TABLE athlete_attachments ADD COLUMN document_name TEXT;
        -- Backfill document_name from file_name for existing records
        UPDATE athlete_attachments SET document_name = file_name WHERE document_name IS NULL;
        ALTER TABLE athlete_attachments ALTER COLUMN document_name SET NOT NULL;
    END IF;

    -- Add category
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='athlete_attachments' AND column_name='category') THEN
        ALTER TABLE athlete_attachments ADD COLUMN category TEXT NOT NULL DEFAULT 'Outros';
    END IF;

    -- Add version_group_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='athlete_attachments' AND column_name='version_group_id') THEN
        ALTER TABLE athlete_attachments ADD COLUMN version_group_id UUID;
        -- Generate version_group_id for existing records
        UPDATE athlete_attachments SET version_group_id = uuid_generate_v4() WHERE version_group_id IS NULL;
    END IF;

    -- Add version_number
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='athlete_attachments' AND column_name='version_number') THEN
        ALTER TABLE athlete_attachments ADD COLUMN version_number INTEGER NOT NULL DEFAULT 1;
    END IF;

    -- Add is_current_version
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='athlete_attachments' AND column_name='is_current_version') THEN
        ALTER TABLE athlete_attachments ADD COLUMN is_current_version BOOLEAN NOT NULL DEFAULT true;
    END IF;

    -- Add mime_type
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='athlete_attachments' AND column_name='mime_type') THEN
        ALTER TABLE athlete_attachments ADD COLUMN mime_type TEXT;
        -- Backfill mime_type from file_type if possible
        UPDATE athlete_attachments SET mime_type = file_type WHERE mime_type IS NULL;
    END IF;

    -- Add updated_at
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='athlete_attachments' AND column_name='updated_at') THEN
        ALTER TABLE athlete_attachments ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;

    -- Add version_note
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='athlete_attachments' AND column_name='version_note') THEN
        ALTER TABLE athlete_attachments ADD COLUMN version_note TEXT;
    END IF;

END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_attachments_athlete_id ON athlete_attachments(athlete_id);
CREATE INDEX IF NOT EXISTS idx_attachments_version_group_id ON athlete_attachments(version_group_id);
CREATE INDEX IF NOT EXISTS idx_attachments_is_current_version ON athlete_attachments(is_current_version);
CREATE INDEX IF NOT EXISTS idx_attachments_category ON athlete_attachments(category);
CREATE INDEX IF NOT EXISTS idx_attachments_created_at_desc ON athlete_attachments(created_at DESC);
