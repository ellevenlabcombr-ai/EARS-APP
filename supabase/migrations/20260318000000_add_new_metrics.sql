-- Add new columns for the updated questionnaire
DO $$ 
BEGIN
    BEGIN
        ALTER TABLE check_ins ADD COLUMN pre_training_meal INTEGER DEFAULT 3 CHECK (pre_training_meal >= 1 AND pre_training_meal <= 5);
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;
    BEGIN
        ALTER TABLE check_ins ADD COLUMN training_recovery INTEGER DEFAULT 3 CHECK (training_recovery >= 1 AND training_recovery <= 5);
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;
    BEGIN
        ALTER TABLE check_ins ADD COLUMN confidence INTEGER DEFAULT 3 CHECK (confidence >= 1 AND confidence <= 5);
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;
    BEGIN
        ALTER TABLE check_ins ADD COLUMN leg_heaviness INTEGER DEFAULT 3 CHECK (leg_heaviness >= 1 AND leg_heaviness <= 5);
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;
    BEGIN
        ALTER TABLE check_ins ADD COLUMN overall_wellbeing INTEGER DEFAULT 3 CHECK (overall_wellbeing >= 1 AND overall_wellbeing <= 5);
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;
END $$;
