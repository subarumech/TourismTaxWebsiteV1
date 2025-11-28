const { supabase } = require('./lib/supabase');
const { jsonResponse, errorResponse, corsHeaders, generateTdtNumber, generateParcelId, generateTransactionId } = require('./lib/utils');

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

// Sarasota County areas to search
const SEARCH_AREAS = [
  { name: 'Siesta Key', lat: 27.2678, lng: -82.5462 },
  { name: 'Longboat Key', lat: 27.4103, lng: -82.6584 },
  { name: 'Lido Key', lat: 27.3156, lng: -82.5773 },
  { name: 'Downtown Sarasota', lat: 27.3364, lng: -82.5307 },
  { name: 'Venice', lat: 27.0998, lng: -82.4543 },
  { name: 'North Port', lat: 27.0442, lng: -82.2359 },
  { name: 'Osprey', lat: 27.1964, lng: -82.4920 },
  { name: 'Nokomis', lat: 27.1192, lng: -82.4437 },
];

async function fetchPlacesNearby(lat, lng, radius = 2000) {
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=lodging&key=${GOOGLE_API_KEY}`;
  
  const response = await fetch(url);
  const data = await response.json();
  
  if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
    console.error(`Google API Error: ${data.status} - ${data.error_message || ''}`);
    return [];
  }
  
  return data.results || [];
}

async function getPlaceDetails(placeId) {
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=formatted_address,address_components,geometry&key=${GOOGLE_API_KEY}`;
  
  const response = await fetch(url);
  const data = await response.json();
  
  if (data.status !== 'OK') {
    return null;
  }
  
  return data.result;
}

function parseAddressComponents(components) {
  const result = { streetNumber: '', route: '', city: '', zipCode: '' };
  
  for (const comp of components || []) {
    const types = comp.types || [];
    if (types.includes('street_number')) result.streetNumber = comp.short_name;
    else if (types.includes('route')) result.route = comp.short_name;
    else if (types.includes('locality')) result.city = comp.short_name;
    else if (types.includes('postal_code')) result.zipCode = comp.short_name;
  }
  
  return result;
}

function pickDealer(dealers) {
  const roll = Math.random();
  if (roll < 0.45) return dealers.find(d => d.name === 'Airbnb')?.id;
  if (roll < 0.90) return dealers.find(d => d.name === 'VRBO')?.id;
  if (roll < 0.95) {
    const others = dealers.filter(d => !['Airbnb', 'VRBO'].includes(d.name));
    return others.length ? others[Math.floor(Math.random() * others.length)].id : null;
  }
  return null; // Independent
}

function assignComplianceScenario(isRegistered, hasPayments, paymentCorrect) {
  if (!isRegistered) return hasPayments ? 2 : 1;
  if (!hasPayments) return 3;
  if (!paymentCorrect) return 4;
  return null; // Compliant
}

exports.handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders(), body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return errorResponse('Method not allowed', 405);
  }

  if (!GOOGLE_API_KEY) {
    return errorResponse('Google API key not configured. Add GOOGLE_API_KEY to Netlify environment variables.', 500);
  }

  try {
    // Get existing dealers
    const { data: dealers } = await supabase.from('dealers').select('*');
    
    if (!dealers || dealers.length === 0) {
      // Insert default dealers if none exist
      await supabase.from('dealers').insert([
        { name: 'Airbnb', dealer_type: 'platform', contact_email: 'support@airbnb.com' },
        { name: 'VRBO', dealer_type: 'platform', contact_email: 'support@vrbo.com' },
        { name: 'Booking.com', dealer_type: 'platform', contact_email: 'support@bookingcom.com' },
        { name: 'Evolve', dealer_type: 'platform', contact_email: 'support@evolve.com' },
        { name: 'HomeAway', dealer_type: 'platform', contact_email: 'support@homeaway.com' },
      ]);
      const { data: newDealers } = await supabase.from('dealers').select('*');
      dealers.push(...(newDealers || []));
    }

    const results = { propertiesCreated: 0, paymentsCreated: 0, errors: [] };

    // Fetch properties from each area
    for (const area of SEARCH_AREAS) {
      console.log(`Searching ${area.name}...`);
      const places = await fetchPlacesNearby(area.lat, area.lng);
      
      for (const place of places.slice(0, 5)) { // Limit 5 per area
        try {
          const details = await getPlaceDetails(place.place_id);
          if (!details) continue;

          const addrParts = parseAddressComponents(details.address_components);
          let streetAddress = `${addrParts.streetNumber} ${addrParts.route}`.trim();
          if (!streetAddress) streetAddress = place.name || 'Unknown Address';

          const city = addrParts.city || area.name.replace('Downtown ', '') || 'Sarasota';
          const zipCode = addrParts.zipCode || '34236';
          const geometry = details.geometry?.location || {};

          // Check if property already exists
          const { data: existing } = await supabase
            .from('properties')
            .select('id')
            .eq('google_place_id', place.place_id)
            .single();

          if (existing) continue; // Skip if already exists

          // Random compliance status
          const isRegistered = Math.random() > 0.3;
          const hasPayments = Math.random() > 0.25;
          const paymentCorrect = Math.random() > 0.2;
          const scenario = assignComplianceScenario(isRegistered, hasPayments, paymentCorrect);

          // Insert property
          const { data: newProperty, error: propError } = await supabase
            .from('properties')
            .insert({
              address: streetAddress,
              city: city,
              zip_code: zipCode,
              lat: geometry.lat,
              lng: geometry.lng,
              google_place_id: place.place_id,
              parcel_id: generateParcelId(),
              is_registered: isRegistered,
              tdt_number: isRegistered ? generateTdtNumber() : null,
              registration_date: isRegistered ? new Date().toISOString() : null,
              homestead_status: Math.random() > 0.7,
              zoning_type: ['residential', 'commercial', 'mixed'][Math.floor(Math.random() * 3)],
              compliance_scenario: scenario
            })
            .select()
            .single();

          if (propError) {
            results.errors.push(`Property ${streetAddress}: ${propError.message}`);
            continue;
          }

          results.propertiesCreated++;

          // Generate payments if applicable
          if (hasPayments && newProperty) {
            const numPayments = Math.floor(Math.random() * 6) + 1;
            
            for (let i = 0; i < numPayments; i++) {
              const periodStart = new Date();
              periodStart.setMonth(periodStart.getMonth() - (i + 1));
              const periodEnd = new Date(periodStart);
              periodEnd.setMonth(periodEnd.getMonth() + 1);

              const expected = Math.random() * 450 + 50;
              const actual = paymentCorrect ? expected : expected * (Math.random() * 0.5 + 0.5);

              const { error: payError } = await supabase
                .from('payments')
                .insert({
                  transaction_id: generateTransactionId(),
                  property_id: newProperty.id,
                  dealer_id: pickDealer(dealers || []),
                  amount: Math.round(actual * 100) / 100,
                  expected_amount: Math.round(expected * 100) / 100,
                  period_start: periodStart.toISOString().split('T')[0],
                  period_end: periodEnd.toISOString().split('T')[0],
                  payment_date: new Date().toISOString(),
                  verified: Math.random() > 0.4
                });

              if (!payError) results.paymentsCreated++;
            }
          }

        } catch (err) {
          results.errors.push(`Place ${place.name}: ${err.message}`);
        }
      }
    }

    return jsonResponse({
      success: true,
      message: `Sync complete! Created ${results.propertiesCreated} properties and ${results.paymentsCreated} payments.`,
      ...results
    });

  } catch (err) {
    console.error('Sync error:', err);
    return errorResponse(err.message, 500);
  }
};

