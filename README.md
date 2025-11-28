# TDT Tax Collector

A web application for Sarasota County Tax Collectors to manage Tourist Development Tax (TDT) compliance.

**Live Demo:** Deploy to Netlify (see instructions below)

## Features

- Property lookup by address, parcel ID, or TDT number
- Automatic TDT number assignment on registration
- Compliance dashboard with four scenario tracking:
  1. Not registered, did not pay
  2. Not registered, but paid
  3. Registered, did not pay
  4. Registered, paid wrong amount
- Payment recording and tracking with unique transaction IDs
- Property location maps via Google Maps API
- API endpoints for dealer integration

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

## API Endpoints

All endpoints are available at `/.netlify/functions/` or `/api/`:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/properties` | GET | List all properties |
| `/api/properties/:id` | GET | Get property with payments |
| `/api/properties` | POST | Create new property |
| `/api/properties/:id` | PUT | Update property |
| `/api/properties/:id/register` | POST | Register property for TDT |
| `/api/payments` | GET | List all payments |
| `/api/payments` | POST | Record new payment |
| `/api/dealers` | GET | List active dealers |
| `/api/stats` | GET | Get dashboard statistics |

---

## Background Info

### Key Entities

**TDT (Tourist Development Tax):** A state-mandated "Bed Tax" collected on transient accommodations (rentals under 6 months).

**Dealers:** Platforms like Airbnb, VRBO, Booking.com that collect and remit TDT on behalf of property owners.

**Compliance Scenarios:**
1. Not registered and did not pay TDT
2. Not registered, but paid TDT anyway
3. Registered but did not pay TDT
4. Registered but paid the wrong amount of TDT
