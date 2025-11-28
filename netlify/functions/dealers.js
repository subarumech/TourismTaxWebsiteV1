const { supabase } = require('./lib/supabase');
const { jsonResponse, errorResponse, corsHeaders } = require('./lib/utils');

exports.handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders(), body: '' };
  }

  try {
    // GET /dealers - list all dealers
    if (event.httpMethod === 'GET') {
      const { data, error } = await supabase
        .from('dealers')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return jsonResponse(data);
    }

    return errorResponse('Method not allowed', 405);
  } catch (err) {
    console.error('Error:', err);
    return errorResponse(err.message, 500);
  }
};

