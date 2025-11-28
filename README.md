# Tax Collector Info

A web application for Sarasota County Tax Collectors to manage Tourist Development Tax (TDT) compliance.

## Quick Start

```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Seed database with sample data
python scripts/seed_data.py

# Run the server
python run.py
```

Then open http://127.0.0.1:5000 in your browser.

## Features

- Property lookup by address, parcel ID, or TDT number
- Automatic TDT number assignment on registration
- Compliance dashboard with four scenario tracking:
  1. Not registered, did not pay
  2. Not registered, but paid
  3. Registered, did not pay
  4. Registered, paid wrong amount
- Payment recording and tracking
- API endpoints for dealer integration (`/api/v1/`)

## Google Places API (Optional)

To fetch real addresses from Google:
1. Go to https://console.cloud.google.com/
2. Enable the Places API
3. Enable billing on your project
4. Add your API key to `.env`:
   ```
   GOOGLE_API_KEY=your-key-here
   ```

Without billing enabled, the seed script uses realistic fallback addresses.

---

## Background Info

Here is a cleaned-up, organized, and clearer version of your notes while keeping all the original information:

⸻

### Tax Collector Software Information – Clean Notes

#### Key Entities & Definitions

**TDT — Tourist Development Tax**

- A state-mandated tax, commonly called the "Bed Tax."
- Considered a sales tax.
- Platforms like Airbnb are supposed to collect and remit this tax.
- Small independent hosts ("Mom and Pop" rentals) must collect and remit it themselves.

**TDC — Tourist Development Council**

- Determines how TDT funds are allocated and spent.

**SCTC — Sarasota County Tax Collector**

- Responsible for collecting the TDT.
- Sometimes receives large, lump-sum checks from platforms ("dealers") without any way to verify accuracy.

**ORD — Ordinances**

- Local laws that include rules such as the number of trash cans allowed, zoning rules, etc.

**Zoning**

- Defines land use categories such as commercial and residential.

**Dealers**

- Platforms like Airbnb, VRBO, HomeAway, etc.
- "Mom and Pop" = hosts who do not use these platforms.
- Issues:
  - Some dealers fail to collect or remit TDT.
  - If a dealer doesn't remit the tax, the homeowner becomes liable—often without knowing.
  - Law enforcement (e.g., Sheriff's Office) may need to know whether a property is a rental, such as in noise complaints.

**PID — Parcel ID Number**

- Identifies properties for tax and zoning purposes.

**Transient Accommodation**

- A rental period under 6 months.

⸻

#### Lobbying Groups Involved

- Professional Vacation Rental Coalition
- Hotel lobby
- Individual platform/dealer lobbyists
- Florida Tax Collectors
- Florida Property Appraiser Association

⸻

#### Platforms

- Look into Evolve—many hosts use it, similar to other dealer platforms.

⸻

#### State-Level Authority

- Florida Legislature has "Forced Collection" provisions that empower enforcement—failure to comply can fall under tax evasion.
- **Department of Revenue (DOR):**
  - "Mothership" agency for tax law.
  - Defines the statewide 6% Sales and Use Tax.

⸻

#### PA — Property Appraiser

- Determines homestead status for properties.
- Contracts with LexisNexis to detect illegal multiple-homestead claims nationwide.
- LexisNexis compiles data from public records.
- If someone illegally claims multiple homesteads:
  - A judge grants the PA a homestead lien.
  - Owner must pay fees, back taxes, etc.
  - Information is sent to the SCTC, which places it onto the property tax bill.
- Unpaid property tax bills can be bought by investors:
  - If not repaid in time, the investor may acquire the property.
- Barbara Ford-Coates reportedly avoided enforcing certain actions because "it's mean."
- Homestead liens expire after 20 years.

⸻

#### SCGOV (Sarasota County Government)

- Grants the SCTC authority to collect TDT instead of performing collections itself.
- The Clerk audits these collections.
- SCTC keeps 1.5% of collected TDT revenue.

⸻

#### TDT# — Tourist Development Tax ID

- Required by SCGOV ordinance for anyone renting their property.
- Defined and assigned directly by the county.

⸻

#### Four Main Compliance Scenarios

1. Not registered and did not pay TDT.
2. Not registered, but paid TDT anyway.
   - Could be a dealer or a homeowner sending the tax directly.
3. Registered but did not pay TDT.
4. Registered but paid the wrong amount of TDT.

