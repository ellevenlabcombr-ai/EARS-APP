-- Migration to add RLS policies for athlete_attachments
ALTER TABLE athlete_attachments ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now to match the pattern of other tables in this project
DROP POLICY IF EXISTS "Enable all access for athlete_attachments" ON athlete_attachments;
CREATE POLICY "Enable all access for athlete_attachments" ON athlete_attachments FOR ALL USING (true) WITH CHECK (true);
