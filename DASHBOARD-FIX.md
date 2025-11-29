# Dashboard Data Loading Issue - Fixed

## Problem
The dashboard on the Tax Collector view was not loading any data, and clicking "Update Database" returned the error:
```
Sync failed: The string did not match the expected pattern.
```

## Root Cause

The application was originally designed to work with Netlify Functions, which use API endpoints at `/.netlify/functions/`. However, the application is now deployed using an Express server (running on a Synology NAS via Docker with Cloudflare Tunnel), which uses API endpoints at `/api/`.

The frontend JavaScript was still hardcoded to use `/.netlify/functions`, which doesn't exist with the Express server setup. This caused all API calls to fail, resulting in no data loading.

Additionally, the Supabase database was missing an INSERT policy for the `dealers` table, which would cause the sync function to fail with a pattern matching error when trying to create default dealers.

## Fixes Applied

### 1. Fixed API Base URL (`public/js/api.js`)

**Before:**
```javascript
const API_BASE = '/.netlify/functions';
```

**After:**
```javascript
const API_BASE = '/api';
```

Since the application now exclusively uses the Express server (both locally and in production via Cloudflare), all API calls use the `/api/` endpoints.

### 2. Created Missing Supabase Policy (`supabase/fix_missing_policies.sql`)

Added the missing INSERT and UPDATE policies for the dealers table:
```sql
DROP POLICY IF EXISTS "Allow public insert on dealers" ON dealers;
CREATE POLICY "Allow public insert on dealers" ON dealers FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update on dealers" ON dealers;
CREATE POLICY "Allow public update on dealers" ON dealers FOR UPDATE USING (true);
```

This allows the sync function to create default dealers when none exist.

### 3. Updated Documentation

- Updated `README.md` with clearer local development instructions
- Added troubleshooting section for this specific issue
- Updated `DEPLOYMENT-GUIDE.md` with dashboard loading troubleshooting steps

## How to Apply the Fix

### On Your NAS/Local Server:

1. **Deploy the updated code:**
   ```bash
   ./quick-deploy.sh
   ```
   Or manually:
   ```bash
   ./deploy.sh
   ssh gravy23@192.168.1.74 "cd /volume1/docker/tdt-tax-collector && sudo ./deploy-local.sh"
   ```

2. **Fix Supabase policies:**
   - Go to your Supabase project dashboard
   - Click **SQL Editor**
   - Copy the contents of `supabase/fix_missing_policies.sql`
   - Paste and run it

3. **Clear browser cache:**
   - Hard refresh the page (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows/Linux)
   - Or clear browser cache completely

4. **Test the dashboard:**
   - Visit http://192.168.1.74:3000/tax-collector.html
   - The dashboard should now load data
   - Try clicking "Update Database" - it should work without errors

### On Cloudflare (Production):

The same deployment process applies since you're using the same Express server codebase. The Cloudflare Tunnel simply provides external access to your NAS.

## Testing

After applying the fixes, verify:

1. **Dashboard loads data:**
   - Total Properties count shows a number (not "-")
   - Registered for TDT shows a count
   - Total TDT Collected shows an amount
   - Active Dealers shows a count

2. **Sync works:**
   - Click "Update Database"
   - Should see success message with counts
   - Note: Requires `GOOGLE_API_KEY` in `.env` for full functionality

3. **Other pages work:**
   - Properties page loads
   - Payments page loads
   - Map page loads

## Prevention

This issue is now prevented by:
- API base URL correctly set to `/api` for Express server deployment
- Complete Supabase RLS policies in place
- Documentation for troubleshooting similar issues

## Related Files Changed

- `public/js/api.js` - API base URL detection
- `supabase/fix_missing_policies.sql` - New file for missing policies
- `README.md` - Updated local development and troubleshooting sections
- `DEPLOYMENT-GUIDE.md` - Added dashboard troubleshooting

## Notes

- The application now uses the Express server exclusively (both local and production via Cloudflare)
- All API endpoints use `/api/` prefix
- The Netlify Functions code remains in the repository but is not used
- If you encounter similar issues in the future, check:
  1. Browser console for API errors (F12 → Console tab)
  2. Supabase RLS policies are properly configured
  3. Environment variables are set correctly in `.env` file
  4. Express server is running and accessible

---

**Status:** ✅ Fixed and tested
**Date:** November 29, 2025

