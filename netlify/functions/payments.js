const { supabase } = require('./lib/supabase');
const { jsonResponse, errorResponse, generateTransactionId, corsHeaders } = require('./lib/utils');

exports.handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders(), body: '' };
  }

  const path = event.path.replace('/.netlify/functions/payments', '').replace('/api/payments', '');
  const segments = path.split('/').filter(Boolean);
  const id = segments[0];

  try {
    // GET /payments - list all payments
    if (event.httpMethod === 'GET' && !id) {
      const { data, error } = await supabase
        .from('payments')
        .select('*, properties(address, city), dealers(name)')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return jsonResponse(data);
    }

    // GET /payments/:id - get single payment
    if (event.httpMethod === 'GET' && id) {
      const { data, error } = await supabase
        .from('payments')
        .select('*, properties(address, city, tdt_number), dealers(name)')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) return errorResponse('Payment not found', 404);
      return jsonResponse(data);
    }

    // POST /payments - create new payment
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body);

      if (!body.property_id || !body.amount || !body.period_start || !body.period_end) {
        return errorResponse('Missing required fields: property_id, amount, period_start, period_end');
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
      return jsonResponse(data, 201);
    }

    return errorResponse('Not found', 404);
  } catch (err) {
    console.error('Error:', err);
    return errorResponse(err.message, 500);
  }
};

