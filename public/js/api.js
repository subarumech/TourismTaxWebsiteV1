const API_BASE = '/api';

async function fetchApi(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API request failed');
  }
  
  return response.json();
}

async function apiGet(endpoint) {
  return fetchApi(endpoint, {
    method: 'GET'
  });
}

async function apiPost(endpoint, data) {
  return fetchApi(endpoint, {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

async function apiPut(endpoint, data) {
  return fetchApi(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

async function apiDelete(endpoint) {
  return fetchApi(endpoint, {
    method: 'DELETE'
  });
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: '2-digit', 
    day: '2-digit', 
    year: '2-digit' 
  });
}

function getScenarioBadge(scenario) {
  const scenarios = {
    1: { class: 'badge-scenario-1', text: 'Not registered, did not pay' },
    2: { class: 'badge-scenario-2', text: 'Not registered, but paid' },
    3: { class: 'badge-scenario-3', text: 'Registered, did not pay' },
    4: { class: 'badge-scenario-4', text: 'Registered, paid wrong amount' }
  };
  
  if (!scenario) return '-';
  const s = scenarios[scenario];
  return `<span class="badge ${s.class}">${s.text}</span>`;
}

function getStatusBadge(isRegistered) {
  if (isRegistered) {
    return '<span class="badge badge-success">Registered</span>';
  }
  return '<span class="badge badge-warning">Not Registered</span>';
}

function getDealerBadge(dealerName) {
  if (dealerName) {
    return `<span class="badge badge-dealer">${dealerName}</span>`;
  }
  return '<span class="badge badge-independent">Independent</span>';
}

