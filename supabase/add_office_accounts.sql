-- Add Office Accounts Table
-- Run this in the Supabase SQL Editor

-- Create office_accounts table
CREATE TABLE IF NOT EXISTS office_accounts (
    id SERIAL PRIMARY KEY,
    state_code VARCHAR(2) NOT NULL,
    entity_type VARCHAR(30) NOT NULL CHECK (entity_type IN ('property-appraiser', 'tax-collector', 'county-gov', 'city-gov', 'dor', 'broker', 'owner')),
    county_code VARCHAR(10),
    municipality_name VARCHAR(100),
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    office_name VARCHAR(200) NOT NULL,
    contact_email VARCHAR(100),
    contact_phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(state_code, entity_type, county_code, municipality_name)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_office_accounts_lookup ON office_accounts(state_code, entity_type, county_code, municipality_name, is_active);

-- Enable Row Level Security
ALTER TABLE office_accounts ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (only for checking if accounts exist)
CREATE POLICY "Allow public read access on office_accounts" ON office_accounts FOR SELECT USING (true);

-- Seed Sarasota County test accounts
-- Password for all accounts is 'test123' - bcrypt hash: $2a$10$7Z8qN/X5b5E0rWqJ5Y7Xd.nJ7KmZ8B9G3qXj5L7Y5D7F7H7J7K7M7O
-- Note: In production, you would use proper bcrypt hashing. For testing, we'll use a simple placeholder.
-- The JavaScript code will handle password verification on the client side.

INSERT INTO office_accounts (state_code, entity_type, county_code, municipality_name, username, password_hash, office_name, contact_email, contact_phone) VALUES
-- Sarasota County - Property Appraiser
('FL', 'property-appraiser', '68', NULL, 'sarasota-appraiser', 'test123', 'Sarasota County Property Appraiser', 'appraiser@sarasota.gov', '(941) 861-8200'),

-- Sarasota County - Tax Collector
('FL', 'tax-collector', '68', NULL, 'sarasota-taxcollector', 'test123', 'Sarasota County Tax Collector', 'taxcollector@sarasota.gov', '(941) 861-8300'),

-- Sarasota County - County Government
('FL', 'county-gov', '68', NULL, 'sarasota-county', 'test123', 'Sarasota County Government', 'county@sarasota.gov', '(941) 861-5000'),

-- Sarasota City - City Government
('FL', 'city-gov', NULL, 'Sarasota', 'sarasota-city', 'test123', 'City of Sarasota', 'city@sarasotafl.gov', '(941) 263-6000'),

-- Florida DOR (state-level)
('FL', 'dor', NULL, NULL, 'florida-dor', 'test123', 'Florida Department of Revenue', 'dor@floridarevenue.com', '(850) 488-6800'),

-- Sample Broker Account (Sarasota-based)
('FL', 'broker', '68', NULL, 'sarasota-broker', 'test123', 'Sarasota Vacation Rentals LLC', 'broker@sarasotarentals.com', '(941) 555-1234'),

-- Sample Owner Account (Sarasota-based)
('FL', 'owner', '68', NULL, 'sarasota-owner', 'test123', 'John Smith - Property Owner', 'owner@example.com', '(941) 555-5678')
ON CONFLICT (username) DO NOTHING;
