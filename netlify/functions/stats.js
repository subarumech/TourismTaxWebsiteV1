const { supabase } = require('./lib/supabase');
const { jsonResponse, errorResponse, corsHeaders } = require('./lib/utils');

exports.handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders(), body: '' };
  }

  try {
    if (event.httpMethod === 'GET') {
      // Get total properties
      const { count: totalProperties } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true });

      // Get registered count
      const { count: registeredCount } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('is_registered', true);

      // Get scenario counts
      const scenarioCounts = {};
      for (let i = 1; i <= 4; i++) {
        const { count } = await supabase
          .from('properties')
          .select('*', { count: 'exact', head: true })
          .eq('compliance_scenario', i);
        scenarioCounts[i] = count || 0;
      }

      // Get total TDT collected
      const { data: payments } = await supabase
        .from('payments')
        .select('amount');
      
      const totalCollected = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

      // Get dealer count
      const { count: dealerCount } = await supabase
        .from('dealers')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Get recent transactions
      const { data: recentTransactions } = await supabase
        .from('payments')
        .select('*, properties(id, address), dealers(name)')
        .order('created_at', { ascending: false })
        .limit(10);

      return jsonResponse({
        totalProperties: totalProperties || 0,
        registeredCount: registeredCount || 0,
        scenarioCounts,
        totalCollected,
        dealerCount: dealerCount || 0,
        recentTransactions: recentTransactions || []
      });
    }

    return errorResponse('Method not allowed', 405);
  } catch (err) {
    console.error('Error:', err);
    return errorResponse(err.message, 500);
  }
};

