-- Seed data for TDT Tax Collector
-- Run this after schema.sql to populate sample data

-- Clear existing data first (order matters due to foreign keys)
TRUNCATE payments, properties, dealers RESTART IDENTITY CASCADE;

-- Re-insert dealers
INSERT INTO dealers (name, dealer_type, contact_email) VALUES
    ('Airbnb', 'platform', 'support@airbnb.com'),
    ('VRBO', 'platform', 'support@vrbo.com'),
    ('Booking.com', 'platform', 'support@bookingcom.com'),
    ('Evolve', 'platform', 'support@evolve.com'),
    ('HomeAway', 'platform', 'support@homeaway.com');

-- Sample properties from Sarasota County
INSERT INTO properties (address, city, zip_code, lat, lng, parcel_id, is_registered, tdt_number, registration_date, compliance_scenario, homestead_status, zoning_type) VALUES
-- Siesta Key
('5311 Ocean Blvd', 'Sarasota', '34242', 27.2634, -82.5489, '1234-56-7890', true, 'TDT-2024-100001', NOW() - INTERVAL '180 days', NULL, false, 'residential'),
('6150 Midnight Pass Rd', 'Sarasota', '34242', 27.2456, -82.5401, '1234-56-7891', true, 'TDT-2024-100002', NOW() - INTERVAL '90 days', NULL, false, 'residential'),
('523 Beach Rd', 'Sarasota', '34242', 27.2701, -82.5512, '1234-56-7892', false, NULL, NULL, 1, false, 'residential'),
('625 Beach Rd', 'Siesta Key', '34242', 27.2698, -82.5508, '1234-56-7893', true, 'TDT-2024-100003', NOW() - INTERVAL '60 days', 4, false, 'residential'),

-- Longboat Key
('5841 Gulf of Mexico Dr', 'Longboat Key', '34228', 27.4012, -82.6523, '2345-67-8901', true, 'TDT-2024-100004', NOW() - INTERVAL '200 days', NULL, false, 'residential'),
('5451 Gulf of Mexico Dr', 'Longboat Key', '34228', 27.3978, -82.6501, '2345-67-8902', false, NULL, NULL, 2, false, 'residential'),
('4725 Gulf of Mexico Dr', 'Longboat Key', '34228', 27.3934, -82.6489, '2345-67-8903', true, 'TDT-2024-100005', NOW() - INTERVAL '120 days', 3, true, 'residential'),

-- Downtown Sarasota
('1350 Main St', 'Sarasota', '34236', 27.3362, -82.5412, '3456-78-9012', true, 'TDT-2024-100006', NOW() - INTERVAL '300 days', NULL, false, 'commercial'),
('111 S Pineapple Ave', 'Sarasota', '34236', 27.3345, -82.5378, '3456-78-9013', false, NULL, NULL, 2, false, 'mixed'),
('1515 Ringling Blvd', 'Sarasota', '34236', 27.3378, -82.5389, '3456-78-9014', true, 'TDT-2024-100007', NOW() - INTERVAL '45 days', NULL, false, 'residential'),

-- Venice
('455 W Venice Ave', 'Venice', '34285', 27.0987, -82.4534, '4567-89-0123', true, 'TDT-2024-100008', NOW() - INTERVAL '150 days', NULL, false, 'commercial'),
('101 The Esplanade N', 'Venice', '34285', 27.0945, -82.4512, '4567-89-0124', false, NULL, NULL, 1, false, 'residential'),
('700 Granada Ave', 'Venice', '34285', 27.0967, -82.4489, '4567-89-0125', true, 'TDT-2024-100009', NOW() - INTERVAL '80 days', 3, true, 'residential'),

-- North Port
('5850 Biscayne Dr', 'North Port', '34287', 27.0456, -82.2345, '5678-90-1234', true, 'TDT-2024-100010', NOW() - INTERVAL '220 days', NULL, true, 'residential'),
('1901 S Sumter Blvd', 'North Port', '34287', 27.0389, -82.2289, '5678-90-1235', false, NULL, NULL, 2, false, 'commercial');

-- Sample payments
INSERT INTO payments (transaction_id, property_id, dealer_id, amount, expected_amount, period_start, period_end, payment_date, verified) VALUES
-- Payments for property 1 (Airbnb)
('A1B2-C3D4-E5F6-G7H8', 1, 1, 245.50, 245.50, '2024-01-01', '2024-01-31', NOW() - INTERVAL '330 days', true),
('B2C3-D4E5-F6G7-H8I9', 1, 1, 312.00, 312.00, '2024-02-01', '2024-02-29', NOW() - INTERVAL '300 days', true),
('C3D4-E5F6-G7H8-I9J0', 1, 1, 189.75, 189.75, '2024-03-01', '2024-03-31', NOW() - INTERVAL '270 days', true),

-- Payments for property 2 (VRBO)
('D4E5-F6G7-H8I9-J0K1', 2, 2, 456.00, 456.00, '2024-01-01', '2024-01-31', NOW() - INTERVAL '330 days', true),
('E5F6-G7H8-I9J0-K1L2', 2, 2, 523.50, 523.50, '2024-02-01', '2024-02-29', NOW() - INTERVAL '300 days', true),

-- Payments for property 4 (wrong amount - scenario 4)
('F6G7-H8I9-J0K1-L2M3', 4, 1, 150.00, 225.00, '2024-03-01', '2024-03-31', NOW() - INTERVAL '270 days', false),
('G7H8-I9J0-K1L2-M3N4', 4, 2, 180.00, 250.00, '2024-04-01', '2024-04-30', NOW() - INTERVAL '240 days', false),

-- Payments for property 5 (Airbnb)
('H8I9-J0K1-L2M3-N4O5', 5, 1, 678.25, 678.25, '2024-01-01', '2024-01-31', NOW() - INTERVAL '330 days', true),
('I9J0-K1L2-M3N4-O5P6', 5, 1, 712.00, 712.00, '2024-02-01', '2024-02-29', NOW() - INTERVAL '300 days', true),

-- Payments for property 6 (not registered but paid - scenario 2)
('J0K1-L2M3-N4O5-P6Q7', 6, 2, 234.50, NULL, '2024-02-01', '2024-02-29', NOW() - INTERVAL '300 days', false),
('K1L2-M3N4-O5P6-Q7R8', 6, 2, 267.00, NULL, '2024-03-01', '2024-03-31', NOW() - INTERVAL '270 days', false),

-- Independent payments (no dealer)
('L2M3-N4O5-P6Q7-R8S9', 8, NULL, 125.00, 125.00, '2024-01-01', '2024-01-31', NOW() - INTERVAL '330 days', true),
('M3N4-O5P6-Q7R8-S9T0', 10, NULL, 89.50, 89.50, '2024-02-01', '2024-02-29', NOW() - INTERVAL '300 days', true),

-- More VRBO payments
('N4O5-P6Q7-R8S9-T0U1', 11, 2, 445.00, 445.00, '2024-01-01', '2024-01-31', NOW() - INTERVAL '330 days', true),
('O5P6-Q7R8-S9T0-U1V2', 14, 2, 167.25, 167.25, '2024-03-01', '2024-03-31', NOW() - INTERVAL '270 days', true);

