-- Fix column sizes for actual data
-- Run this in Supabase SQL Editor

-- First, let's clear the existing property data since we're importing fresh
TRUNCATE properties CASCADE;

-- Now expand the columns that are too small
ALTER TABLE properties ALTER COLUMN loc_state TYPE VARCHAR(50);
ALTER TABLE properties ALTER COLUMN location_state TYPE VARCHAR(50);
ALTER TABLE properties ALTER COLUMN prior_id1 TYPE VARCHAR(100);
ALTER TABLE properties ALTER COLUMN prior_id2 TYPE VARCHAR(100);
ALTER TABLE properties ALTER COLUMN prior_id3 TYPE VARCHAR(100);
ALTER TABLE properties ALTER COLUMN utilities1 TYPE VARCHAR(50);
ALTER TABLE properties ALTER COLUMN utilities2 TYPE VARCHAR(50);
ALTER TABLE properties ALTER COLUMN gulf_bay TYPE VARCHAR(50);
ALTER TABLE properties ALTER COLUMN land_unit_type TYPE VARCHAR(50);
ALTER TABLE properties ALTER COLUMN owner_postal TYPE VARCHAR(50);
ALTER TABLE properties ALTER COLUMN owner_state TYPE VARCHAR(50);
ALTER TABLE properties ALTER COLUMN owner_county_code TYPE VARCHAR(50);
ALTER TABLE properties ALTER COLUMN census TYPE VARCHAR(50);
ALTER TABLE properties ALTER COLUMN loc_unit TYPE VARCHAR(50);
ALTER TABLE properties ALTER COLUMN loc_dir_prefix TYPE VARCHAR(50);
ALTER TABLE properties ALTER COLUMN loc_dir_suffix TYPE VARCHAR(50);
ALTER TABLE properties ALTER COLUMN street_number TYPE VARCHAR(50);
ALTER TABLE properties ALTER COLUMN user_account TYPE VARCHAR(100);

-- Expand VARCHAR(20) columns that are causing errors
ALTER TABLE properties ALTER COLUMN zoning1 TYPE VARCHAR(100);
ALTER TABLE properties ALTER COLUMN zoning2 TYPE VARCHAR(100);
ALTER TABLE properties ALTER COLUMN zoning3 TYPE VARCHAR(100);
ALTER TABLE properties ALTER COLUMN property_status TYPE VARCHAR(50);

