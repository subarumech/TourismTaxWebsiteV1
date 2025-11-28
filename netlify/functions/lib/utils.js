function generateTransactionId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 16; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${result.slice(0, 4)}-${result.slice(4, 8)}-${result.slice(8, 12)}-${result.slice(12, 16)}`;
}

function generateTdtNumber() {
  const year = new Date().getFullYear();
  const num = Math.floor(Math.random() * 900000) + 100000;
  return `TDT-${year}-${num}`;
}

function generateParcelId() {
  const p1 = Math.floor(Math.random() * 9000) + 1000;
  const p2 = Math.floor(Math.random() * 90) + 10;
  const p3 = Math.floor(Math.random() * 9000) + 1000;
  return `${p1}-${p2}-${p3}`;
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  };
}

function jsonResponse(data, statusCode = 200) {
  return {
    statusCode,
    headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  };
}

function errorResponse(message, statusCode = 400) {
  return jsonResponse({ error: message }, statusCode);
}

module.exports = {
  generateTransactionId,
  generateTdtNumber,
  generateParcelId,
  corsHeaders,
  jsonResponse,
  errorResponse
};

