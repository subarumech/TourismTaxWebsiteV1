# Technical Documentation: Sarasota County Data Import System

## Overview

This document provides technical details about the database schema, import scripts, and lessons learned during the implementation of the Sarasota County property data import system for the TDT Tax Collection application.

**Date Created:** November 29, 2025
**Database:** Supabase (PostgreSQL)
**Data Source:** Sarasota County Property Appraiser SCPA Detailed Data files

---

## Database Architecture

### Core Tables

#### 1. `properties` (Main Entity)
The central table containing all property information from Sarasota County.

**Key Columns:**
- `parcel_id` (VARCHAR(50), UNIQUE, NOT NULL) - Primary identifier from county
- `owner_name`, `owner_name2`, `owner_name3` - Property owner information
- `address`, `city`, `zip_code` - Property location
- `land_use_code`, `neighborhood_code` - County classification codes
- `zoning1`, `zoning2`, `zoning3` - Zoning information (VARCHAR(100) to handle long codes)
- `tdt_number` - Tax Development Tax registration number
- `is_registered` - TDT registration status
- Legal description fields (`legal_description1` through `legal_description4`)

**Important Notes:**
- The original schema had VARCHAR(10) and VARCHAR(20) for many fields, but real data required VARCHAR(50) to VARCHAR(100)
- `parcel_id` is the link to all related tables (sales, buildings, land, values, exemptions)
- County data contains ~307K records but only ~91K unique `parcel_id` values

#### 2. `sales` (Transaction History)
Property sales transactions from the county.

**Structure:**
- Links to properties via `parcel_id`
- Contains 1.4+ million sales records
- Fields: `sale_date`, `sale_price`, `deed_type`, `recording_date`, etc.

#### 3. `buildings` (Building Characteristics)
Detailed building information for each property.

**Key Fields:**
- Physical characteristics: `year_built`, `full_bath`, `half_bath`, `units`
- Construction details: `roof_cover`, `foundation`, `frame`
- Condition ratings: `grade`, `view_type`

#### 4. `land` (Land Parcel Details)
Land-specific information.

**Fields:**
- `land_type`, `unit_type`, `num_of_units`
- `neigh_mod` (neighborhood modifier)

#### 5. `property_values` (Assessment Data)
Annual property valuations.

**Key Values:**
- `total_value`, `land_value`, `building_value`
- `assessed_value`, `taxable_value`
- `ag_credit`, `new_const`, `deletions`

#### 6. `exemptions` (Tax Exemptions)
Tax exemption records per property.

**Fields:**
- `exemption_code` - Links to `lookup_exemption_codes`
- `amount_off_total_assessment`
- `app_code`

#### 7. Lookup Tables
Reference tables for code translations:
- `lookup_land_use_codes` (319 records)
- `lookup_deed_types` (18 records)
- `lookup_neighborhood_codes` (1,265 records)
- `lookup_exemption_codes` (62 records)

---

## Import Scripts

### Location
`scripts/import_county_data.py` - Main ETL script
`scripts/supabase_client.py` - Database connection helper

### Script Architecture

#### `supabase_client.py`
Provides:
- `get_supabase_client()` - Creates authenticated Supabase connection
- `batch_insert(client, table_name, records, batch_size=1000)` - Handles batch insertions with error logging
- Uses environment variables from `.env` file

#### `import_county_data.py`
Main ETL script with modular import functions.

**Key Functions:**

1. **`read_csv_with_fallback(file_path)`**
   - Tries multiple encodings: utf-8, windows-1252, latin-1, iso-8859-1
   - Essential because county data uses windows-1252 encoding, not UTF-8
   - Returns pandas DataFrame

2. **`clean_value(value)`**
   - Strips whitespace and quotes
   - Converts empty strings to None
   - Handles pandas NaN values

3. **`parse_date(date_str)`**
   - Converts date strings to ISO format
   - Handles various date formats from county data
   - Returns None for invalid dates

4. **Import Functions:**
   - `import_properties()` - PropertyOwnerLegal.txt (307K records → 91K unique)
   - `import_sales()` - Sales.txt (1.4M records)
   - `import_buildings()` - Building.txt
   - `import_land()` - Land.txt
   - `import_values()` - Values.txt
   - `import_exemptions()` - Exemptions.txt
   - `import_lookups()` - All Lookup*.txt files

**Usage:**
```bash
# Import all data
python scripts/import_county_data.py --all

# Import specific table
python scripts/import_county_data.py --table properties

# Dry run (no actual insert)
python scripts/import_county_data.py --all --dry-run
```

---

## Data Files

### Location
`data/Sarasota County/SCPA_Detailed_Data/`

### Important Files
- `PropertyOwnerLegal.txt` (108MB) - Main property data
- `Sales.txt` (155MB) - Sales history
- `Building.txt` - Building characteristics
- `Land.txt` - Land details
- `Values.txt` - Property valuations
- `Exemptions.txt` - Tax exemptions
- `Lookup*.txt` - Reference tables

**Note:** These files are in `.gitignore` and should NOT be committed to Git (too large for GitHub).

---

## Lessons Learned

### 1. Character Encoding Issues
**Problem:** County data files use Windows-1252 encoding, not UTF-8.

**Solution:** Implemented `read_csv_with_fallback()` function that tries multiple encodings.

**Code:**
```python
encodings = ['utf-8', 'windows-1252', 'latin-1', 'iso-8859-1']
for encoding in encodings:
    try:
        df = pd.read_csv(file_path, dtype=str, encoding=encoding)
        return df
    except UnicodeDecodeError:
        continue
```

### 2. Column Size Limitations
**Problem:** Initial schema used VARCHAR(10) and VARCHAR(20), but real data had longer values.

**Examples:**
- Zoning codes: Expected 20 chars, actual up to 50+
- Census codes: Expected 20 chars, actual up to 50
- Prior parcel IDs: Expected 50 chars, actual up to 100

**Solution:** Ran migration script (`supabase/fix_column_sizes.sql`) to expand columns to VARCHAR(50) or VARCHAR(100).

**SQL Fix:**
```sql
ALTER TABLE properties ALTER COLUMN zoning1 TYPE VARCHAR(100);
ALTER TABLE properties ALTER COLUMN zoning2 TYPE VARCHAR(100);
ALTER TABLE properties ALTER COLUMN census TYPE VARCHAR(50);
-- etc.
```

### 3. Duplicate Records
**Problem:** County data contains ~307K records but only ~91K unique parcel_ids.

**Reason:** Historical records, multiple entries for same property, data quality issues.

**Solution:** 
- Use `parcel_id` as UNIQUE constraint in database
- Script automatically skips duplicates (logs error, continues)
- First occurrence is kept, subsequent duplicates are ignored

**Result:** 91,000 unique properties inserted, ~217,000 duplicates skipped

### 4. Row Level Security (RLS) Policies
**Problem:** Initial import failed with "row-level security policy" violations.

**Cause:** Tables had RLS enabled with only SELECT policies, no INSERT policies.

**Solution:** Created `supabase/add_insert_policies.sql`:
```sql
CREATE POLICY "Allow public insert on properties" 
ON properties FOR INSERT WITH CHECK (true);
```

**Important:** In production, restrict INSERT policies to authenticated users only.

### 5. Batch Insertion Strategy
**Problem:** Inserting 300K+ records one at a time is too slow.

**Solution:** Batch insert 1,000 records at a time using Supabase API.

**Benefits:**
- Faster insertion (reduced API calls)
- Better error handling (isolates failures to specific batches)
- Progress tracking every 1,000 records

**Code:**
```python
for i in range(0, total, batch_size):
    batch = records[i:i + batch_size]
    client.table(table_name).insert(batch).execute()
```

### 6. Foreign Key Constraints
**Problem:** Cannot use traditional foreign keys because `parcel_id` is in parent table's natural key, not primary key.

**Solution:** Use `parcel_id` as the linking field but don't enforce foreign key constraints in database.

**Risk Mitigation:**
- Validate `parcel_id` exists in properties table before inserting related records
- Use database indexes on `parcel_id` in all tables for query performance

### 7. Data Preparation Time
**Problem:** Large datasets (1.4M sales records) take several minutes just to read and prepare before insertion starts.

**Reason:**
- CSV parsing with encoding detection
- Data cleaning (strip whitespace, handle nulls)
- Date parsing and conversion
- DataFrame operations on millions of rows

**Observation:** Be patient - no output for 5-10 minutes is normal when preparing large datasets.

### 8. Git and Large Files
**Problem:** Cannot commit 100MB+ data files to GitHub.

**Solution:**
- Add `data/` directory to `.gitignore`
- Keep data files local only
- Document data source and location in README
- Provide import scripts so others can load their own data

**If accidentally committed:**
```bash
git rm -r --cached "data/"
git commit -m "Remove large files"
git push --force origin main
```

---

## Database Migration Files

### 1. `supabase/schema.sql`
Full schema including all tables. Run this for fresh database setup.

### 2. `supabase/migration_add_county_data.sql`
Safe migration for existing databases. Uses `IF NOT EXISTS` and `ADD COLUMN IF NOT EXISTS`.

### 3. `supabase/fix_column_sizes.sql`
Expands VARCHAR columns to handle real data. Run this if you encounter "value too long" errors.

**Usage:**
```sql
TRUNCATE properties CASCADE;
-- Then run all ALTER TABLE statements
```

### 4. `supabase/add_insert_policies.sql`
Adds INSERT policies for RLS-enabled tables. Required for data import to work.

---

## Performance Considerations

### Import Speed
- **Properties:** ~91K records in ~8-10 minutes (processing + insertion)
- **Sales:** 1.4M records estimated 30-40 minutes (not completed in final run)
- **Batch size:** 1,000 records per API call is optimal

### Database Indexes
Critical indexes for query performance:
```sql
CREATE INDEX idx_properties_parcel ON properties(parcel_id);
CREATE INDEX idx_properties_land_use ON properties(land_use_code);
CREATE INDEX idx_properties_neighborhood ON properties(neighborhood_code);
CREATE INDEX idx_sales_parcel ON sales(parcel_id);
CREATE INDEX idx_buildings_parcel ON buildings(parcel_id);
```

### Query Optimization Tips
- Always filter by indexed columns first
- Use `parcel_id` for joins between tables
- Limit result sets when displaying data
- Use pagination for large datasets

---

## API Integration

### Netlify Functions
Location: `netlify/functions/properties.js`

**Enhanced Endpoints:**
- `GET /api/properties/:id` - Now includes sales, buildings, land, values, exemptions
- `GET /api/properties?land_use_code=XXX` - Filter by land use
- `GET /api/properties?neighborhood_code=XXX` - Filter by neighborhood
- `GET /api/properties?zoning=XXX` - Filter by zoning

**Example Response:**
```json
{
  "id": 123,
  "parcel_id": "0123456789",
  "owner_name": "John Doe",
  "address": "123 Main St",
  "sales": [...],
  "buildings": [...],
  "land": [...],
  "values": [...],
  "exemptions": [...]
}
```

---

## Frontend Updates

### Property Detail View
Location: `app/templates/properties/view.html` (Flask)
Location: `public/property-detail.html` + `public/js/property-detail.js` (Static)

**New Sections:**
1. Expanded property details (owner, legal description, zoning)
2. Property valuation (total, land, building, assessed, taxable values)
3. Building information (year built, bathrooms, floors, etc.)
4. Sales history (last 10 sales with dates and prices)
5. Tax exemptions (codes and amounts)

**Conditional Rendering:**
- Sections only display if data exists
- Empty states for missing data
- Graceful handling of null values

---

## Environment Setup

### Required Environment Variables
Create `.env` file in project root:
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

### Python Dependencies
```bash
pip install -r requirements.txt
```

**Key packages:**
- `supabase==2.24.0` (updated from 2.3.0 for compatibility)
- `pandas>=2.2.0`
- `websockets==15.0.1` (required for supabase realtime)

**Dependency Issues Encountered:**
- Initial supabase 2.3.0 had proxy parameter issues
- Upgraded to 2.24.0 for better httpx compatibility
- websockets needed upgrade from 12.0 to 15.0.1 for asyncio module

---

## Future Improvements

### Recommended Enhancements

1. **Incremental Updates**
   - Add `last_updated` timestamp to track when records were imported
   - Implement update logic instead of full truncate/reload
   - Compare with existing data and only update changes

2. **Data Validation**
   - Pre-validate CSV files before import
   - Check for required columns
   - Validate data types before insertion
   - Generate validation report

3. **Progress UI**
   - Create web interface for import status
   - Real-time progress bars
   - Email notification on completion
   - Error summary dashboard

4. **Foreign Key Enforcement**
   - Add proper foreign key constraints after all data is loaded
   - Validate referential integrity
   - Clean up orphaned records

5. **Automated Imports**
   - Schedule periodic imports (monthly/quarterly)
   - Auto-detect new county data files
   - Compare checksums to detect changes
   - Automated testing after import

6. **Data Transformations**
   - Geocode addresses that don't have lat/lng
   - Normalize address formats
   - Parse owner names (split business/individual)
   - Calculate property age from year_built

7. **Performance Optimization**
   - Use COPY command for bulk inserts (faster than API)
   - Parallel processing for multiple tables
   - Streaming for very large files
   - Memory optimization for 1M+ record files

---

## Troubleshooting Guide

### Common Issues

#### 1. "Module not found: supabase"
```bash
pip install supabase==2.24.0
```

#### 2. "UnicodeDecodeError"
Already fixed in `read_csv_with_fallback()`, but if still occurs, check file encoding:
```bash
file -I data/Sarasota\ County/SCPA_Detailed_Data/PropertyOwnerLegal.txt
```

#### 3. "duplicate key value violates unique constraint"
This is expected for duplicate records. The script logs these and continues.

To clear and reimport:
```sql
TRUNCATE properties CASCADE;
```

#### 4. "value too long for type character varying(X)"
Run `supabase/fix_column_sizes.sql` to expand column sizes.

#### 5. "row-level security policy violation"
Run `supabase/add_insert_policies.sql` to add INSERT policies.

#### 6. Import hangs without output
For large files (1M+ records), the data preparation phase can take 5-10 minutes. Use:
```bash
python -u scripts/import_county_data.py --table properties 2>&1
```
The `-u` flag unbuffers output for real-time progress.

#### 7. "SUPABASE_URL not set"
Create `.env` file in project root with credentials.

---

## Security Considerations

### Production Recommendations

1. **RLS Policies:** Current policies allow public INSERT. Change to:
```sql
CREATE POLICY "Allow authenticated insert on properties" 
ON properties FOR INSERT 
TO authenticated 
WITH CHECK (true);
```

2. **API Keys:** Never commit `.env` to Git (already in `.gitignore`)

3. **Data Access:** Consider role-based access:
   - Property Appraiser: Read/Write all property data
   - Tax Collector: Read all, Write TDT status
   - Public: Read limited fields only

4. **Rate Limiting:** Implement rate limits on API endpoints

5. **Audit Logs:** Track who imported data and when

---

## Contact & Support

For questions or issues with this system:
1. Review this documentation
2. Check `README.md` for user-facing documentation
3. Review SQL migration files in `supabase/` directory
4. Check git commit history for implementation details

**Key Files to Reference:**
- `/scripts/import_county_data.py` - Import logic
- `/supabase/schema.sql` - Complete database structure
- `/supabase/migration_add_county_data.sql` - Safe migrations
- `/README.md` - User documentation

---

## Version History

**v1.0 - November 29, 2025**
- Initial implementation
- Imported 91,000 Sarasota County properties
- Expanded schema for comprehensive county data
- Created ETL scripts with encoding fallback
- Updated frontend for enhanced property display
- Resolved column size and RLS policy issues

---

## Appendix: File Formats

### County Data CSV Format
All files are CSV with double-quoted fields:
```
"ColumnName1","ColumnName2","ColumnName3"
"Value1","Value2","Value3"
```

### Field Separators
- Delimiter: Comma (`,`)
- Quote character: Double quote (`"`)
- Encoding: Windows-1252

### Date Formats
Dates appear in various formats:
- `2024-01-15 00:00:00` (most common)
- `2024-01-15`
- `01/15/2024`

Script handles all via pandas `pd.to_datetime()`.

---

**End of Technical Documentation**

