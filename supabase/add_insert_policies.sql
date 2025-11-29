-- Add INSERT policies for new tables
-- Run this in Supabase SQL Editor to allow data insertion

-- Create policies for insert (adjust for production security)
DROP POLICY IF EXISTS "Allow public insert on sales" ON sales;
CREATE POLICY "Allow public insert on sales" ON sales FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public insert on buildings" ON buildings;
CREATE POLICY "Allow public insert on buildings" ON buildings FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public insert on land" ON land;
CREATE POLICY "Allow public insert on land" ON land FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public insert on property_values" ON property_values;
CREATE POLICY "Allow public insert on property_values" ON property_values FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public insert on exemptions" ON exemptions;
CREATE POLICY "Allow public insert on exemptions" ON exemptions FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public insert on lookup_land_use_codes" ON lookup_land_use_codes;
CREATE POLICY "Allow public insert on lookup_land_use_codes" ON lookup_land_use_codes FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public insert on lookup_deed_types" ON lookup_deed_types;
CREATE POLICY "Allow public insert on lookup_deed_types" ON lookup_deed_types FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public insert on lookup_neighborhood_codes" ON lookup_neighborhood_codes;
CREATE POLICY "Allow public insert on lookup_neighborhood_codes" ON lookup_neighborhood_codes FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public insert on lookup_exemption_codes" ON lookup_exemption_codes;
CREATE POLICY "Allow public insert on lookup_exemption_codes" ON lookup_exemption_codes FOR INSERT WITH CHECK (true);

