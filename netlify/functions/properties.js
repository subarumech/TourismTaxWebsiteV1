const { supabase } = require('./lib/supabase');
const { jsonResponse, errorResponse, generateTdtNumber, generateParcelId, corsHeaders } = require('./lib/utils');

exports.handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders(), body: '' };
  }

  const path = event.path.replace('/.netlify/functions/properties', '').replace('/api/properties', '');
  const segments = path.split('/').filter(Boolean);
  const id = segments[0];

  try {
    // GET /properties - list all or search
    if (event.httpMethod === 'GET' && !id) {
      const params = event.queryStringParameters || {};
      let query = supabase.from('properties').select('*');

      if (params.scenario) {
        query = query.eq('compliance_scenario', parseInt(params.scenario));
      }
      if (params.search) {
        query = query.or(`address.ilike.%${params.search}%,parcel_id.ilike.%${params.search}%,tdt_number.ilike.%${params.search}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return jsonResponse(data);
    }

    // GET /properties/:id - get single property with payments
    if (event.httpMethod === 'GET' && id) {
      const { data: property, error: propError } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();

      if (propError) throw propError;
      if (!property) return errorResponse('Property not found', 404);

      const { data: payments, error: payError } = await supabase
        .from('payments')
        .select('*, dealers(name)')
        .eq('property_id', id)
        .order('created_at', { ascending: false });

      if (payError) throw payError;

      return jsonResponse({ ...property, payments: payments || [] });
    }

    // POST /properties - create new property
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body);
      
      const newProperty = {
        address: body.address,
        city: body.city || 'Sarasota',
        zip_code: body.zip_code,
        parcel_id: body.parcel_id || generateParcelId(),
        lat: body.lat || null,
        lng: body.lng || null,
        homestead_status: body.homestead_status || false,
        zoning_type: body.zoning_type || 'residential',
        is_registered: body.is_registered || false,
        tdt_number: body.is_registered ? generateTdtNumber() : null,
        registration_date: body.is_registered ? new Date().toISOString() : null,
        compliance_scenario: body.compliance_scenario || null
      };

      const { data, error } = await supabase
        .from('properties')
        .insert(newProperty)
        .select()
        .single();

      if (error) throw error;
      return jsonResponse(data, 201);
    }

    // PUT /properties/:id - update property
    if (event.httpMethod === 'PUT' && id) {
      const body = JSON.parse(event.body);
      
      // Check if registering for first time
      if (body.is_registered && !body.tdt_number) {
        const { data: existing } = await supabase
          .from('properties')
          .select('is_registered, tdt_number')
          .eq('id', id)
          .single();
        
        if (existing && !existing.is_registered) {
          body.tdt_number = generateTdtNumber();
          body.registration_date = new Date().toISOString();
        }
      }

      const { data, error } = await supabase
        .from('properties')
        .update(body)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return jsonResponse(data);
    }

    // POST /properties/:id/register - register property for TDT
    if (event.httpMethod === 'POST' && segments[1] === 'register') {
      const { data, error } = await supabase
        .from('properties')
        .update({
          is_registered: true,
          tdt_number: generateTdtNumber(),
          registration_date: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return jsonResponse(data);
    }

    return errorResponse('Not found', 404);
  } catch (err) {
    console.error('Error:', err);
    return errorResponse(err.message, 500);
  }
};

