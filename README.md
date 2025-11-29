# TDT Tax Collection System

A multi-stakeholder web application for managing Tourist Development Tax (TDT) compliance across Florida. The system serves Property Appraisers, Tax Collectors, County and City Governments, Department of Revenue, Vacation Rental Brokers, and Property Owners.

**Live Demo:** Deploy to Netlify (see instructions below)

## User Types & Features

### Property Appraiser
- **PID to TDT# Mapping Report**: Export list of Property Identification Numbers (PID) matched with TDT numbers
- **Homestead Exemption Audit**: Identify properties with TDT# that should NOT have Homestead Exemption
- **CSV Export**: Export reports for auditing purposes

### Tax Collector
- **Compliance Dashboard**: Track four compliance scenarios:
  1. Parcel does NOT have TDT# and someone sent in money
  2. Parcel DOES have TDT# and no money was collected
  3. Parcel DOES have TDT# but wrong amount of money was sent
  4. Parcel does NOT have TDT# and NO money was sent
- **Payment Tracking**: Record and track TDT payments with transaction IDs
- **Property Management**: Full property and payment history

### County Government
- **Property Reports**: View all properties with TDT numbers in the county
- **Map Lookup**: Check zones for TDT# conducting transient accommodations in restricted areas
- **Zoning Enforcement**: Identify potential zoning violations
- **CSV Export**: Export county property reports

### City Government
- **Property Reports**: View all properties with TDT numbers in the city
- **Map Lookup**: Check zones for TDT# in restricted areas
- **Zoning Compliance**: Monitor short-term rental compliance
- **CSV Export**: Export city property reports

### Department of Revenue (DOR)
- **TDT# Generation**: System automatically generates random TDT# with first two digits matching Florida County Number Map
- **State-wide Reporting**: View all properties and TDT numbers across counties
- **Active/Inactive Tracking**: Monitor TDT status with effective dates
- **CSV Export**: Export comprehensive state reports

### Vacation Rental Brokers
- **TDT Lookup API**: Verify TDT registration before collecting payments
- **Property Owner Registration**: Direct property owners to register for TDT#
- **API Integration**: Integrate TDT lookup into rental platforms
- **Compliance Requirements**: Mandated to require TDT# for all transactions

### Property Owner
- **Public Registration**: Register properties for TDT number
- **Automatic TDT# Assignment**: Receive TDT number immediately upon registration
- **FREE Access**: No cost to register or check TDT status

## Tech Stack

- **Frontend:** Static HTML/CSS/JavaScript
- **Backend:** Netlify Functions (serverless)
- **Database:** Supabase (PostgreSQL)
- **Hosting:** Netlify

---

## Deployment Instructions

### 1. Set Up Supabase Database

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to **SQL Editor** and run the contents of `supabase/schema.sql`
4. Then run `supabase/seed.sql` to add sample data
5. Go to **Settings > API** and copy:
   - Project URL (e.g., `https://xxxxx.supabase.co`)
   - `anon` public key

### 2. Deploy to Netlify

1. Go to [netlify.com](https://netlify.com) and sign in with GitHub
2. Click **"Add new site"** > **"Import an existing project"**
3. Select this GitHub repository
4. Configure build settings:
   - **Build command:** (leave empty)
   - **Publish directory:** `public`
5. Click **"Deploy site"**

### 3. Set Environment Variables

In Netlify dashboard:
1. Go to **Site settings** > **Environment variables**
2. Add these variables:
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   ```
3. Trigger a redeploy

### 4. (Optional) Set Up Google Maps

To enable property location maps:
1. Get a Google Maps API key from [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the **Maps JavaScript API**
3. Update the API key in `public/property-detail.html`

---

## Local Development

```bash
# Install dependencies
npm install

# Install Netlify CLI globally
npm install -g netlify-cli

# Create .env file with your Supabase credentials
echo "SUPABASE_URL=your-url" > .env
echo "SUPABASE_ANON_KEY=your-key" >> .env

# Run local dev server
netlify dev
```

Then open http://localhost:8888

---

## Importing County Data

This system supports importing comprehensive property data from county property appraiser offices. The data includes property ownership, sales history, building details, land information, property valuations, and tax exemptions.

### Prerequisites

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Set up Supabase credentials in `.env`:
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

3. Place data files in `data/Sarasota County/SCPA_Detailed_Data/`

### Running the Import

The import script supports importing all data or specific tables:

```bash
# Import all data (properties, sales, buildings, land, values, exemptions, lookups)
python scripts/import_county_data.py --all

# Import specific table
python scripts/import_county_data.py --table properties
python scripts/import_county_data.py --table sales
python scripts/import_county_data.py --table buildings
python scripts/import_county_data.py --table lookups

# Dry run (preview without inserting data)
python scripts/import_county_data.py --all --dry-run
```

### Expected Data Files

Place these files in `data/Sarasota County/SCPA_Detailed_Data/`:
- `PropertyOwnerLegal.txt` - Property ownership and location data
- `Sales.txt` - Property sales history
- `Building.txt` - Building characteristics
- `Land.txt` - Land parcel information
- `Values.txt` - Property valuations
- `Exemptions.txt` - Tax exemptions
- `LookupLandUseCodes.txt` - Land use code definitions
- `LookupDeedType.txt` - Deed type definitions
- `LookupNeighborhoodCode.txt` - Neighborhood code definitions
- `LookupExemptionCode.txt` - Exemption code definitions

### Import Performance

- Full import of ~300K+ records typically takes 30-60 minutes
- Data is inserted in batches of 1000 records
- Progress is logged to console
- Errors are captured and reported

### Data Updates

To update data periodically (e.g., monthly when county releases new data):

1. Download latest data files from county property appraiser
2. Replace files in `data/Sarasota County/SCPA_Detailed_Data/`
3. Truncate existing tables in Supabase (or the script will append)
4. Run import script again

---

## System Access

The system uses a login portal where users select their entity type:
- Property Appraiser
- Tax Collector
- County Government
- City Government
- Department of Revenue
- Vacation Rental Broker
- Property Owner

Each user type is directed to a customized dashboard with role-specific features.

## API Endpoints

All endpoints are available at `/.netlify/functions/` or `/api/`:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/properties` | GET | List all properties (supports ?search and ?scenario) |
| `/api/properties/lookup` | GET | Broker TDT lookup (?pid, ?tdt, or ?address) |
| `/api/properties/:id` | GET | Get property with payments |
| `/api/properties` | POST | Create new property (register for TDT) |
| `/api/properties/:id` | PUT | Update property |
| `/api/properties/:id/register` | POST | Register property for TDT |
| `/api/payments` | GET | List all payments |
| `/api/payments` | POST | Record new payment |
| `/api/dealers` | GET | List active dealers |
| `/api/stats` | GET | Get dashboard statistics |

### Property Data Fields

Properties include the following fields:
- **Owner Information**: owner_name
- **Location**: address, city, county_name, zip_code, lat, lng
- **Identification**: parcel_id (PID), tdt_number
- **Status**: is_registered, is_active, active_date, inactive_date
- **Compliance**: homestead_status, zoning_type, compliance_scenario
- **Dates**: registration_date, created_at, updated_at

---

## Background Info

### Key Entities

**TDT (Tourist Development Tax):** A state-mandated "Bed Tax" collected on transient accommodations (rentals under 6 months).

**PID (Property Identification Number):** Also known as Assessor's Parcel Number (APN), used by Property Appraisers.

**Dealers/Brokers:** Platforms like Airbnb, VRBO, Booking.com that collect and remit TDT on behalf of property owners.

**Transient Accommodations:** Short-term rentals (less than 6 months) subject to TDT.

### Compliance Scenarios

Tax Collectors monitor four key scenarios:
1. Parcel does NOT have TDT# and someone sent in money
2. Parcel DOES have TDT# and no money was collected
3. Parcel DOES have TDT# but wrong amount of money was sent
4. Parcel does NOT have TDT# and NO money was sent

### Legislative Requirements

Florida legislation mandates:
- All Vacation Rental Brokers must make customers register for a TDT#
- When Vacation Rental Brokers send funds to Tax Collector, it must have TDT#
- All Property Owners must have a TDT# if renting transient accommodations

### Potential Users/Customers

- Property Appraiser
- Tax Collector
- County Government
- Sheriff's Department
- Zoning Enforcement
- EMS (Safety Inspections)
- City Government
- Department of Revenue (DOR)
- Vacation Rental Brokers
- Property Owners (FREE ACCESS)
