-- Database Status Check
-- Run this in Supabase SQL Editor to see current data counts and verify setup

-- Check properties
SELECT 'Properties' as table_name, COUNT(*) as count FROM properties
UNION ALL
-- Check registered properties
SELECT 'Properties (Registered)' as table_name, COUNT(*) as count FROM properties WHERE is_registered = true
UNION ALL
-- Check payments
SELECT 'Payments' as table_name, COUNT(*) as count FROM payments
UNION ALL
-- Check dealers
SELECT 'Dealers' as table_name, COUNT(*) as count FROM dealers
UNION ALL
-- Check active dealers
SELECT 'Dealers (Active)' as table_name, COUNT(*) as count FROM dealers WHERE is_active = true
UNION ALL
-- Check sales
SELECT 'Sales' as table_name, COUNT(*) as count FROM sales
UNION ALL
-- Check buildings
SELECT 'Buildings' as table_name, COUNT(*) as count FROM buildings
UNION ALL
-- Check land
SELECT 'Land' as table_name, COUNT(*) as count FROM land
UNION ALL
-- Check property values
SELECT 'Property Values' as table_name, COUNT(*) as count FROM property_values
UNION ALL
-- Check exemptions
SELECT 'Exemptions' as table_name, COUNT(*) as count FROM exemptions;

-- Check compliance scenarios
SELECT '---' as table_name, '---' as count
UNION ALL
SELECT 'Compliance Scenario Breakdown' as table_name, '' as count
UNION ALL
SELECT 'Scenario 1 (Not reg, not paid)' as table_name, COUNT(*)::text as count FROM properties WHERE compliance_scenario = 1
UNION ALL
SELECT 'Scenario 2 (Not reg, paid)' as table_name, COUNT(*)::text as count FROM properties WHERE compliance_scenario = 2
UNION ALL
SELECT 'Scenario 3 (Reg, not paid)' as table_name, COUNT(*)::text as count FROM properties WHERE compliance_scenario = 3
UNION ALL
SELECT 'Scenario 4 (Reg, wrong amount)' as table_name, COUNT(*)::text as count FROM properties WHERE compliance_scenario = 4;

-- Check total TDT collected
SELECT '---' as table_name, '---' as count
UNION ALL
SELECT 'Total TDT Collected' as table_name, '$' || ROUND(SUM(amount)::numeric, 2)::text as count FROM payments;

-- Recent transactions
SELECT '---' as table_name, '---' as count
UNION ALL
SELECT 'Most Recent Payment Date' as table_name, MAX(payment_date)::text as count FROM payments;

