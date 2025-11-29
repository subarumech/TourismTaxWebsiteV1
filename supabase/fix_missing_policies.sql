-- Fix missing INSERT policy for dealers table
-- Run this in Supabase SQL Editor if you're getting permission errors

DROP POLICY IF EXISTS "Allow public insert on dealers" ON dealers;
CREATE POLICY "Allow public insert on dealers" ON dealers FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update on dealers" ON dealers;
CREATE POLICY "Allow public update on dealers" ON dealers FOR UPDATE USING (true);

