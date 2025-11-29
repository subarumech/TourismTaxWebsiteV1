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

-- Properties table (expanded with county data fields)
CREATE TABLE properties (
    id SERIAL PRIMARY KEY,
    parcel_id VARCHAR(50) UNIQUE NOT NULL,
    user_account VARCHAR(50),
    owner_name VARCHAR(200),
    owner_name2 VARCHAR(200),
    owner_name3 VARCHAR(200),
    owner_street1 VARCHAR(200),
    owner_street2 VARCHAR(200),
    owner_city VARCHAR(100),
    owner_state VARCHAR(10),
    owner_postal VARCHAR(20),
    owner_county_code VARCHAR(10),
    address VARCHAR(200) NOT NULL,
    street_number VARCHAR(20),
    loc_description VARCHAR(100),
    loc_unit VARCHAR(20),
    loc_dir_prefix VARCHAR(10),
    loc_dir_suffix VARCHAR(10),
    city VARCHAR(100) NOT NULL,
    loc_state VARCHAR(10),
    zip_code VARCHAR(10) NOT NULL,
    county_name VARCHAR(100) DEFAULT 'Sarasota',
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    google_place_id VARCHAR(200),
    land_use_code VARCHAR(10),
    neighborhood_code VARCHAR(10),
    location_state VARCHAR(10),
    prior_id1 VARCHAR(50),
    prior_id2 VARCHAR(50),
    prior_id3 VARCHAR(50),
    census VARCHAR(20),
    utilities1 VARCHAR(10),
    utilities2 VARCHAR(10),
    gulf_bay VARCHAR(10),
    description TEXT,
    legal_description1 TEXT,
    legal_description2 TEXT,
    legal_description3 TEXT,
    legal_description4 TEXT,
    total_land DECIMAL(12, 2),
    land_unit_type VARCHAR(10),
    zoning1 VARCHAR(20),
    zoning2 VARCHAR(20),
    zoning3 VARCHAR(20),
    zoning_type VARCHAR(50) DEFAULT 'residential',
    property_status VARCHAR(20),
    tdt_number VARCHAR(20) UNIQUE,
    homestead_status BOOLEAN DEFAULT false,
    is_registered BOOLEAN DEFAULT false,
    registration_date TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    active_date TIMESTAMP WITH TIME ZONE,
    inactive_date TIMESTAMP WITH TIME ZONE,
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

-- Sales table
CREATE TABLE sales (
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (parcel_id) REFERENCES properties(parcel_id) ON DELETE CASCADE
);

-- Buildings table
CREATE TABLE buildings (
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (parcel_id) REFERENCES properties(parcel_id) ON DELETE CASCADE
);

-- Land table
CREATE TABLE land (
    id SERIAL PRIMARY KEY,
    parcel_id VARCHAR(50) NOT NULL,
    seq_number VARCHAR(10),
    line_type VARCHAR(10),
    num_of_units DECIMAL(12, 4),
    unit_type VARCHAR(10),
    land_type VARCHAR(10),
    neigh_mod VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (parcel_id) REFERENCES properties(parcel_id) ON DELETE CASCADE
);

-- Values table
CREATE TABLE property_values (
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (parcel_id) REFERENCES properties(parcel_id) ON DELETE CASCADE
);

-- Exemptions table
CREATE TABLE exemptions (
    id SERIAL PRIMARY KEY,
    parcel_id VARCHAR(50) NOT NULL,
    exemption_code VARCHAR(10),
    amount_off_total_assessment DECIMAL(12, 2),
    app_code VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (parcel_id) REFERENCES properties(parcel_id) ON DELETE CASCADE
);

-- Lookup tables
CREATE TABLE lookup_land_use_codes (
    code VARCHAR(10) PRIMARY KEY,
    description VARCHAR(200)
);

CREATE TABLE lookup_deed_types (
    code VARCHAR(10) PRIMARY KEY,
    description VARCHAR(200)
);

CREATE TABLE lookup_neighborhood_codes (
    code VARCHAR(10) PRIMARY KEY,
    description VARCHAR(200)
);

CREATE TABLE lookup_exemption_codes (
    code VARCHAR(10) PRIMARY KEY,
    description VARCHAR(200)
);

-- Create indexes
CREATE INDEX idx_properties_compliance ON properties(compliance_scenario);
CREATE INDEX idx_properties_registered ON properties(is_registered);
CREATE INDEX idx_properties_parcel ON properties(parcel_id);
CREATE INDEX idx_properties_land_use ON properties(land_use_code);
CREATE INDEX idx_properties_neighborhood ON properties(neighborhood_code);
CREATE INDEX idx_payments_property ON payments(property_id);
CREATE INDEX idx_payments_dealer ON payments(dealer_id);
CREATE INDEX idx_sales_parcel ON sales(parcel_id);
CREATE INDEX idx_sales_date ON sales(sale_date);
CREATE INDEX idx_buildings_parcel ON buildings(parcel_id);
CREATE INDEX idx_land_parcel ON land(parcel_id);
CREATE INDEX idx_values_parcel ON property_values(parcel_id);
CREATE INDEX idx_exemptions_parcel ON exemptions(parcel_id);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE dealers ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE land ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE exemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE lookup_land_use_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE lookup_deed_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE lookup_neighborhood_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE lookup_exemption_codes ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (adjust as needed for your security requirements)
CREATE POLICY "Allow public read access on dealers" ON dealers FOR SELECT USING (true);
CREATE POLICY "Allow public read access on properties" ON properties FOR SELECT USING (true);
CREATE POLICY "Allow public read access on payments" ON payments FOR SELECT USING (true);
CREATE POLICY "Allow public read access on sales" ON sales FOR SELECT USING (true);
CREATE POLICY "Allow public read access on buildings" ON buildings FOR SELECT USING (true);
CREATE POLICY "Allow public read access on land" ON land FOR SELECT USING (true);
CREATE POLICY "Allow public read access on property_values" ON property_values FOR SELECT USING (true);
CREATE POLICY "Allow public read access on exemptions" ON exemptions FOR SELECT USING (true);
CREATE POLICY "Allow public read access on lookup_land_use_codes" ON lookup_land_use_codes FOR SELECT USING (true);
CREATE POLICY "Allow public read access on lookup_deed_types" ON lookup_deed_types FOR SELECT USING (true);
CREATE POLICY "Allow public read access on lookup_neighborhood_codes" ON lookup_neighborhood_codes FOR SELECT USING (true);
CREATE POLICY "Allow public read access on lookup_exemption_codes" ON lookup_exemption_codes FOR SELECT USING (true);

-- Create policies for insert/update (you may want to restrict this in production)
CREATE POLICY "Allow public insert on properties" ON properties FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on properties" ON properties FOR UPDATE USING (true);
CREATE POLICY "Allow public insert on payments" ON payments FOR INSERT WITH CHECK (true);

