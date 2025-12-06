const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const { supabase } = require('./netlify/functions/lib/supabase');
const { 
  jsonResponse, 
  errorResponse, 
  generateTdtNumber, 
  generateParcelId, 
  generateTransactionId 
} = require('./netlify/functions/lib/utils');

function wrapHandler(netlifyHandler) {
  return async (req, res) => {
    const event = {
      httpMethod: req.method,
      path: req.path,
      queryStringParameters: req.query,
      body: JSON.stringify(req.body),
      headers: req.headers
    };
    
    try {
      const result = await netlifyHandler(event, {});
      res.status(result.statusCode || 200);
      if (result.headers) {
        Object.entries(result.headers).forEach(([key, value]) => {
          res.setHeader(key, value);
        });
      }
      res.send(result.body);
    } catch (error) {
      console.error('Handler error:', error);
      res.status(500).json({ error: error.message });
    }
  };
}

app.get('/api/states', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('states')
      .select('*')
      .order('name');

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/states/:stateCode/counties', async (req, res) => {
  try {
    const stateCode = req.params.stateCode.toUpperCase();
    
    const { data: state, error: stateError } = await supabase
      .from('states')
      .select('id')
      .eq('code', stateCode)
      .single();

    if (stateError || !state) {
      return res.status(404).json({ error: 'State not found' });
    }

    const { data, error } = await supabase
      .from('counties')
      .select('*')
      .eq('state_id', state.id)
      .order('name');

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/states/:stateCode/municipalities', async (req, res) => {
  try {
    const stateCode = req.params.stateCode.toUpperCase();
    
    const { data: state, error: stateError } = await supabase
      .from('states')
      .select('id')
      .eq('code', stateCode)
      .single();

    if (stateError || !state) {
      return res.status(404).json({ error: 'State not found' });
    }

    const { data, error } = await supabase
      .from('municipalities')
      .select('*')
      .eq('state_id', state.id)
      .order('name');

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/dealers', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('dealers')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/payments', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*, properties(address, city), dealers(name)')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/payments/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*, properties(address, city, tdt_number), dealers(name)')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Payment not found' });
    res.json(data);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/payments', async (req, res) => {
  try {
    const body = req.body;

    if (!body.property_id || !body.amount || !body.period_start || !body.period_end) {
      return res.status(400).json({ 
        error: 'Missing required fields: property_id, amount, period_start, period_end' 
      });
    }

    const newPayment = {
      transaction_id: generateTransactionId(),
      property_id: body.property_id,
      dealer_id: body.dealer_id || null,
      amount: parseFloat(body.amount),
      expected_amount: body.expected_amount ? parseFloat(body.expected_amount) : null,
      period_start: body.period_start,
      period_end: body.period_end,
      payment_date: new Date().toISOString(),
      verified: false,
      notes: body.notes || null
    };

    const { data, error } = await supabase
      .from('payments')
      .insert(newPayment)
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/properties/lookup', async (req, res) => {
  try {
    const params = req.query;
    let query = supabase.from('properties').select('*');

    if (params.pid || params.parcel_id) {
      query = query.eq('parcel_id', params.pid || params.parcel_id);
    } else if (params.tdt || params.tdt_number) {
      query = query.eq('tdt_number', params.tdt || params.tdt_number);
    } else if (params.address) {
      query = query.ilike('address', `%${params.address}%`);
    } else {
      return res.status(400).json({ 
        error: 'Missing search parameter (pid, tdt, or address)' 
      });
    }

    const { data, error } = await query.limit(1).single();
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ property: null, message: 'Property not found' });
      }
      throw error;
    }
    res.json({ property: data });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/properties', async (req, res) => {
  try {
    const params = req.query;
    let query = supabase.from('properties').select('*');

    if (params.scenario) {
      query = query.eq('compliance_scenario', parseInt(params.scenario));
    }
    if (params.search) {
      query = query.or(`address.ilike.%${params.search}%,parcel_id.ilike.%${params.search}%,tdt_number.ilike.%${params.search}%,owner_name.ilike.%${params.search}%`);
    }
    if (params.land_use_code) {
      query = query.eq('land_use_code', params.land_use_code);
    }
    if (params.neighborhood_code) {
      query = query.eq('neighborhood_code', params.neighborhood_code);
    }
    if (params.zoning) {
      query = query.or(`zoning1.ilike.%${params.zoning}%,zoning2.ilike.%${params.zoning}%,zoning3.ilike.%${params.zoning}%`);
    }
    if (params.city) {
      query = query.ilike('city', `%${params.city}%`);
    }
    if (params.zip_code) {
      query = query.eq('zip_code', params.zip_code);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/properties/:id', async (req, res) => {
  try {
    const { data: property, error: propError } = await supabase
      .from('properties')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (propError) throw propError;
    if (!property) return res.status(404).json({ error: 'Property not found' });

    const { data: payments, error: payError } = await supabase
      .from('payments')
      .select('*, dealers(name)')
      .eq('property_id', req.params.id)
      .order('created_at', { ascending: false });

    if (payError) throw payError;

    const { data: sales } = await supabase
      .from('sales')
      .select('*')
      .eq('parcel_id', property.parcel_id)
      .order('sale_date', { ascending: false });

    const { data: buildings } = await supabase
      .from('buildings')
      .select('*')
      .eq('parcel_id', property.parcel_id);

    const { data: land } = await supabase
      .from('land')
      .select('*')
      .eq('parcel_id', property.parcel_id);

    const { data: values } = await supabase
      .from('property_values')
      .select('*')
      .eq('parcel_id', property.parcel_id);

    const { data: exemptions } = await supabase
      .from('exemptions')
      .select('*')
      .eq('parcel_id', property.parcel_id);

    res.json({ 
      ...property, 
      payments: payments || [],
      sales: sales || [],
      buildings: buildings || [],
      land: land || [],
      values: values || [],
      exemptions: exemptions || []
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/properties', async (req, res) => {
  try {
    const body = req.body;
    
    const newProperty = {
      owner_name: body.owner_name || null,
      address: body.address,
      city: body.city || 'Sarasota',
      county_name: body.county_name || 'Sarasota',
      zip_code: body.zip_code,
      parcel_id: body.parcel_id || generateParcelId(),
      lat: body.lat || null,
      lng: body.lng || null,
      homestead_status: body.homestead_status || false,
      zoning_type: body.zoning_type || 'residential',
      is_registered: body.is_registered || false,
      tdt_number: body.is_registered ? generateTdtNumber() : null,
      registration_date: body.is_registered ? new Date().toISOString() : null,
      is_active: body.is_active !== undefined ? body.is_active : true,
      active_date: body.active_date || (body.is_registered ? new Date().toISOString() : null),
      inactive_date: body.inactive_date || null,
      compliance_scenario: body.compliance_scenario || null
    };

    const { data, error } = await supabase
      .from('properties')
      .insert(newProperty)
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/properties/:id', async (req, res) => {
  try {
    const body = req.body;
    
    if (body.is_registered && !body.tdt_number) {
      const { data: existing } = await supabase
        .from('properties')
        .select('is_registered, tdt_number')
        .eq('id', req.params.id)
        .single();
      
      if (existing && !existing.is_registered) {
        body.tdt_number = generateTdtNumber();
        body.registration_date = new Date().toISOString();
      }
    }

    const { data, error } = await supabase
      .from('properties')
      .update(body)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/properties/:id/register', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('properties')
      .update({
        is_registered: true,
        tdt_number: generateTdtNumber(),
        registration_date: new Date().toISOString()
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/stats', async (req, res) => {
  try {
    const { count: totalProperties } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true });

    const { count: registeredCount } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .eq('is_registered', true);

    const scenarioCounts = {};
    for (let i = 1; i <= 4; i++) {
      const { count } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('compliance_scenario', i);
      scenarioCounts[i] = count || 0;
    }

    const { data: payments } = await supabase
      .from('payments')
      .select('amount');
    
    const totalCollected = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

    const { count: dealerCount } = await supabase
      .from('dealers')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    const { data: recentTransactions } = await supabase
      .from('payments')
      .select('*, properties(id, address), dealers(name)')
      .order('created_at', { ascending: false })
      .limit(10);

    res.json({
      totalProperties: totalProperties || 0,
      registeredCount: registeredCount || 0,
      scenarioCounts,
      totalCollected,
      dealerCount: dealerCount || 0,
      recentTransactions: recentTransactions || []
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/sync', async (req, res) => {
  const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
  
  if (!GOOGLE_API_KEY) {
    return res.status(500).json({ 
      error: 'Google API key not configured. Add GOOGLE_API_KEY to environment variables.' 
    });
  }

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
    if (data.status !== 'OK') return null;
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
    return null;
  }

  function assignComplianceScenario(isRegistered, hasPayments, paymentCorrect) {
    if (!isRegistered) return hasPayments ? 2 : 1;
    if (!hasPayments) return 3;
    if (!paymentCorrect) return 4;
    return null;
  }

  try {
    const { data: dealers } = await supabase.from('dealers').select('*');
    
    if (!dealers || dealers.length === 0) {
      await supabase.from('dealers').insert([
        { name: 'Airbnb', dealer_type: 'platform', contact_email: 'support@airbnb.com' },
        { name: 'VRBO', dealer_type: 'platform', contact_email: 'support@vrbo.com' },
        { name: 'Booking.com', dealer_type: 'platform', contact_email: 'support@bookingcom.com' },
        { name: 'Evolve', dealer_type: 'platform', contact_email: 'support@evolve.com' },
        { name: 'HomeAway', dealer_type: 'platform', contact_email: 'support@homeaway.com' },
      ]);
    }

    const results = { propertiesCreated: 0, paymentsCreated: 0, errors: [] };

    for (const area of SEARCH_AREAS) {
      console.log(`Searching ${area.name}...`);
      const places = await fetchPlacesNearby(area.lat, area.lng);
      
      for (const place of places.slice(0, 5)) {
        try {
          const details = await getPlaceDetails(place.place_id);
          if (!details) continue;

          const addrParts = parseAddressComponents(details.address_components);
          let streetAddress = `${addrParts.streetNumber} ${addrParts.route}`.trim();
          if (!streetAddress) streetAddress = place.name || 'Unknown Address';

          const city = addrParts.city || area.name.replace('Downtown ', '') || 'Sarasota';
          const zipCode = addrParts.zipCode || '34236';
          const geometry = details.geometry?.location || {};

          const { data: existing } = await supabase
            .from('properties')
            .select('id')
            .eq('google_place_id', place.place_id)
            .single();

          if (existing) continue;

          const isRegistered = Math.random() > 0.3;
          const hasPayments = Math.random() > 0.25;
          const paymentCorrect = Math.random() > 0.2;
          const scenario = assignComplianceScenario(isRegistered, hasPayments, paymentCorrect);

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

    res.json({
      success: true,
      message: `Sync complete! Created ${results.propertiesCreated} properties and ${results.paymentsCreated} payments.`,
      ...results
    });
  } catch (err) {
    console.error('Sync error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  const hasExtension = path.extname(req.path) !== '';
  if (hasExtension) {
    return next();
  }
  
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

