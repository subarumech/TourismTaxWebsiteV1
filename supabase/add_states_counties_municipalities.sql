-- Add States, Counties, and Municipalities tables
-- Run this in the Supabase SQL Editor

-- Create States table
CREATE TABLE IF NOT EXISTS states (
    id SERIAL PRIMARY KEY,
    code VARCHAR(2) UNIQUE NOT NULL,
    name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Counties table
CREATE TABLE IF NOT EXISTS counties (
    id SERIAL PRIMARY KEY,
    state_id INTEGER NOT NULL REFERENCES states(id) ON DELETE CASCADE,
    code VARCHAR(10) NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(state_id, code)
);

-- Create Municipalities table
CREATE TABLE IF NOT EXISTS municipalities (
    id SERIAL PRIMARY KEY,
    state_id INTEGER NOT NULL REFERENCES states(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(state_id, name)
);

-- Create indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_counties_state ON counties(state_id);
CREATE INDEX IF NOT EXISTS idx_municipalities_state ON municipalities(state_id);

-- Enable Row Level Security
ALTER TABLE states ENABLE ROW LEVEL SECURITY;
ALTER TABLE counties ENABLE ROW LEVEL SECURITY;
ALTER TABLE municipalities ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access on states" ON states FOR SELECT USING (true);
CREATE POLICY "Allow public read access on counties" ON counties FOR SELECT USING (true);
CREATE POLICY "Allow public read access on municipalities" ON municipalities FOR SELECT USING (true);
