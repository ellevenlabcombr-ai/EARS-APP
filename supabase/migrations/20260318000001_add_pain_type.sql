-- Add pain_type column to pain_reports
DO $$ 
BEGIN
    BEGIN
        ALTER TABLE pain_reports ADD COLUMN pain_type TEXT;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;
END $$;
