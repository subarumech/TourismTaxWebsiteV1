-- Supabase Schema for TDT Tax Collector
-- Run this in the Supabase SQL Editor to set up your database

-- Dealers table
CREATE TABLE dealers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    dealer_type VARCHAR(20) NOT NULL CHECK (dealer_type IN ('platform', 'mom_and_pop')),
    contact_email VARCHAR(100),
    contact_phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Properties table
CREATE TABLE properties (
    id SERIAL PRIMARY KEY,
    parcel_id VARCHAR(50) UNIQUE,
    address VARCHAR(200) NOT NULL,
    city VARCHAR(100) NOT NULL,
    zip_code VARCHAR(10) NOT NULL,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    google_place_id VARCHAR(200),
    tdt_number VARCHAR(20) UNIQUE,
    homestead_status BOOLEAN DEFAULT false,
    zoning_type VARCHAR(50) DEFAULT 'residential',
    is_registered BOOLEAN DEFAULT false,
    registration_date TIMESTAMP WITH TIME ZONE,
    compliance_scenario INTEGER CHECK (compliance_scenario IN (1, 2, 3, 4)),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments table
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    transaction_id VARCHAR(19) UNIQUE NOT NULL,
    property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    dealer_id INTEGER REFERENCES dealers(id) ON DELETE SET NULL,
    amount DECIMAL(10, 2) NOT NULL,
    expected_amount DECIMAL(10, 2),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    payment_date TIMESTAMP WITH TIME ZONE,
    verified BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_properties_compliance ON properties(compliance_scenario);
CREATE INDEX idx_properties_registered ON properties(is_registered);
CREATE INDEX idx_payments_property ON payments(property_id);
CREATE INDEX idx_payments_dealer ON payments(dealer_id);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE dealers ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (adjust as needed for your security requirements)
CREATE POLICY "Allow public read access on dealers" ON dealers FOR SELECT USING (true);
CREATE POLICY "Allow public read access on properties" ON properties FOR SELECT USING (true);
CREATE POLICY "Allow public read access on payments" ON payments FOR SELECT USING (true);

-- Create policies for insert/update (you may want to restrict this in production)
CREATE POLICY "Allow public insert on properties" ON properties FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on properties" ON properties FOR UPDATE USING (true);
CREATE POLICY "Allow public insert on payments" ON payments FOR INSERT WITH CHECK (true);

