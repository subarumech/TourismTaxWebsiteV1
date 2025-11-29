-- Migration: Add County Data Tables and Expand Properties
-- Run this in Supabase SQL Editor if you already have existing tables

-- First, let's add new columns to the existing properties table
ALTER TABLE properties 
  ADD COLUMN IF NOT EXISTS user_account VARCHAR(50),
  ADD COLUMN IF NOT EXISTS owner_name VARCHAR(200),
  ADD COLUMN IF NOT EXISTS owner_name2 VARCHAR(200),
  ADD COLUMN IF NOT EXISTS owner_name3 VARCHAR(200),
  ADD COLUMN IF NOT EXISTS owner_street1 VARCHAR(200),
  ADD COLUMN IF NOT EXISTS owner_street2 VARCHAR(200),
  ADD COLUMN IF NOT EXISTS owner_city VARCHAR(100),
  ADD COLUMN IF NOT EXISTS owner_state VARCHAR(10),
  ADD COLUMN IF NOT EXISTS owner_postal VARCHAR(20),
  ADD COLUMN IF NOT EXISTS owner_county_code VARCHAR(10),
  ADD COLUMN IF NOT EXISTS street_number VARCHAR(20),
  ADD COLUMN IF NOT EXISTS loc_description VARCHAR(100),
  ADD COLUMN IF NOT EXISTS loc_unit VARCHAR(20),
  ADD COLUMN IF NOT EXISTS loc_dir_prefix VARCHAR(10),
  ADD COLUMN IF NOT EXISTS loc_dir_suffix VARCHAR(10),
  ADD COLUMN IF NOT EXISTS loc_state VARCHAR(10),
  ADD COLUMN IF NOT EXISTS land_use_code VARCHAR(10),
  ADD COLUMN IF NOT EXISTS neighborhood_code VARCHAR(10),
  ADD COLUMN IF NOT EXISTS location_state VARCHAR(10),
  ADD COLUMN IF NOT EXISTS prior_id1 VARCHAR(50),
  ADD COLUMN IF NOT EXISTS prior_id2 VARCHAR(50),
  ADD COLUMN IF NOT EXISTS prior_id3 VARCHAR(50),
  ADD COLUMN IF NOT EXISTS census VARCHAR(20),
  ADD COLUMN IF NOT EXISTS utilities1 VARCHAR(10),
  ADD COLUMN IF NOT EXISTS utilities2 VARCHAR(10),
  ADD COLUMN IF NOT EXISTS gulf_bay VARCHAR(10),
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS legal_description1 TEXT,
  ADD COLUMN IF NOT EXISTS legal_description2 TEXT,
  ADD COLUMN IF NOT EXISTS legal_description3 TEXT,
  ADD COLUMN IF NOT EXISTS legal_description4 TEXT,
  ADD COLUMN IF NOT EXISTS total_land DECIMAL(12, 2),
  ADD COLUMN IF NOT EXISTS land_unit_type VARCHAR(10),
  ADD COLUMN IF NOT EXISTS zoning1 VARCHAR(20),
  ADD COLUMN IF NOT EXISTS zoning2 VARCHAR(20),
  ADD COLUMN IF NOT EXISTS zoning3 VARCHAR(20),
  ADD COLUMN IF NOT EXISTS property_status VARCHAR(20),
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS active_date TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS inactive_date TIMESTAMP WITH TIME ZONE;

-- Make parcel_id NOT NULL if it isn't already
-- Note: This will fail if there are NULL values. If so, update them first.
-- ALTER TABLE properties ALTER COLUMN parcel_id SET NOT NULL;

-- Create sales table
CREATE TABLE IF NOT EXISTS sales (
    id SERIAL PRIMARY KEY,
    parcel_id VARCHAR(50) NOT NULL,
    sale_date TIMESTAMP WITH TIME ZONE,
    sequence INTEGER,
    sale_price DECIMAL(12, 2),
    legal_reference VARCHAR(50),
    book VARCHAR(20),
    page VARCHAR(20),
    nal_code VARCHAR(10),
    deed_type VARCHAR(10),
    recording_date TIMESTAMP WITH TIME ZONE,
    doc_stamps DECIMAL(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create buildings table
CREATE TABLE IF NOT EXISTS buildings (
    id SERIAL PRIMARY KEY,
    parcel_id VARCHAR(50) NOT NULL,
    card_number VARCHAR(10),
    avg_height_floor DECIMAL(6, 2),
    prime_int_wall VARCHAR(10),
    sec_int_wall VARCHAR(10),
    sec_int_wall_percent DECIMAL(5, 2),
    primary_floors VARCHAR(10),
    sec_floors VARCHAR(10),
    sec_floors_percent DECIMAL(5, 2),
    insulation VARCHAR(10),
    heat_type VARCHAR(10),
    percent_air_conditioned DECIMAL(5, 2),
    ext_type VARCHAR(10),
    story_height DECIMAL(6, 2),
    foundation VARCHAR(10),
    units DECIMAL(6, 2),
    frame VARCHAR(10),
    prime_wall VARCHAR(10),
    sec_wall VARCHAR(10),
    sec_wall_percent DECIMAL(5, 2),
    roof_struct VARCHAR(10),
    roof_cover VARCHAR(10),
    view_type VARCHAR(10),
    grade VARCHAR(10),
    year_built INTEGER,
    eff_year_built INTEGER,
    condo_floor VARCHAR(10),
    condo_complex_name VARCHAR(200),
    full_bath DECIMAL(4, 1),
    full_bath_rating VARCHAR(10),
    half_bath DECIMAL(4, 1),
    half_bath_rating VARCHAR(10),
    other_fixtures DECIMAL(4, 1),
    other_fixtures_rating VARCHAR(10),
    fireplaces VARCHAR(10),
    fireplace_rating VARCHAR(10),
    parking_spaces VARCHAR(10),
    percent_sprinkled VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create land table
CREATE TABLE IF NOT EXISTS land (
    id SERIAL PRIMARY KEY,
    parcel_id VARCHAR(50) NOT NULL,
    seq_number VARCHAR(10),
    line_type VARCHAR(10),
    num_of_units DECIMAL(12, 4),
    unit_type VARCHAR(10),
    land_type VARCHAR(10),
    neigh_mod VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create property_values table
CREATE TABLE IF NOT EXISTS property_values (
    id SERIAL PRIMARY KEY,
    parcel_id VARCHAR(50) NOT NULL,
    total_value DECIMAL(12, 2),
    land_value DECIMAL(12, 2),
    building_value DECIMAL(12, 2),
    sfyi_value DECIMAL(12, 2),
    assessed_value DECIMAL(12, 2),
    taxable_value DECIMAL(12, 2),
    deletions DECIMAL(12, 2),
    new_const DECIMAL(12, 2),
    new_land DECIMAL(12, 2),
    ag_credit DECIMAL(12, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create exemptions table
CREATE TABLE IF NOT EXISTS exemptions (
    id SERIAL PRIMARY KEY,
    parcel_id VARCHAR(50) NOT NULL,
    exemption_code VARCHAR(10),
    amount_off_total_assessment DECIMAL(12, 2),
    app_code VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create lookup tables
CREATE TABLE IF NOT EXISTS lookup_land_use_codes (
    code VARCHAR(10) PRIMARY KEY,
    description VARCHAR(200)
);

CREATE TABLE IF NOT EXISTS lookup_deed_types (
    code VARCHAR(10) PRIMARY KEY,
    description VARCHAR(200)
);

CREATE TABLE IF NOT EXISTS lookup_neighborhood_codes (
    code VARCHAR(10) PRIMARY KEY,
    description VARCHAR(200)
);

CREATE TABLE IF NOT EXISTS lookup_exemption_codes (
    code VARCHAR(10) PRIMARY KEY,
    description VARCHAR(200)
);

-- Create indexes (using IF NOT EXISTS where supported, or wrap in DO block)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_properties_parcel') THEN
        CREATE INDEX idx_properties_parcel ON properties(parcel_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_properties_land_use') THEN
        CREATE INDEX idx_properties_land_use ON properties(land_use_code);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_properties_neighborhood') THEN
        CREATE INDEX idx_properties_neighborhood ON properties(neighborhood_code);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_sales_parcel') THEN
        CREATE INDEX idx_sales_parcel ON sales(parcel_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_sales_date') THEN
        CREATE INDEX idx_sales_date ON sales(sale_date);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_buildings_parcel') THEN
        CREATE INDEX idx_buildings_parcel ON buildings(parcel_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_land_parcel') THEN
        CREATE INDEX idx_land_parcel ON land(parcel_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_values_parcel') THEN
        CREATE INDEX idx_values_parcel ON property_values(parcel_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_exemptions_parcel') THEN
        CREATE INDEX idx_exemptions_parcel ON exemptions(parcel_id);
    END IF;
END $$;

-- Enable Row Level Security for new tables
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE land ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE exemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE lookup_land_use_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE lookup_deed_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE lookup_neighborhood_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE lookup_exemption_codes ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
DROP POLICY IF EXISTS "Allow public read access on sales" ON sales;
CREATE POLICY "Allow public read access on sales" ON sales FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access on buildings" ON buildings;
CREATE POLICY "Allow public read access on buildings" ON buildings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access on land" ON land;
CREATE POLICY "Allow public read access on land" ON land FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access on property_values" ON property_values;
CREATE POLICY "Allow public read access on property_values" ON property_values FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access on exemptions" ON exemptions;
CREATE POLICY "Allow public read access on exemptions" ON exemptions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access on lookup_land_use_codes" ON lookup_land_use_codes;
CREATE POLICY "Allow public read access on lookup_land_use_codes" ON lookup_land_use_codes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access on lookup_deed_types" ON lookup_deed_types;
CREATE POLICY "Allow public read access on lookup_deed_types" ON lookup_deed_types FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access on lookup_neighborhood_codes" ON lookup_neighborhood_codes;
CREATE POLICY "Allow public read access on lookup_neighborhood_codes" ON lookup_neighborhood_codes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access on lookup_exemption_codes" ON lookup_exemption_codes;
CREATE POLICY "Allow public read access on lookup_exemption_codes" ON lookup_exemption_codes FOR SELECT USING (true);

