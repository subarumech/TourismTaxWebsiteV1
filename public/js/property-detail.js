let propertyData = null;

document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  
  if (!id) {
    window.location.href = '/properties.html';
    return;
  }
  
  await loadProperty(id);
});

async function loadProperty(id) {
  try {
    propertyData = await fetchApi(`/properties/${id}`);
    renderProperty(propertyData);
    renderPayments(propertyData.payments);
    initMap(); // Initialize map after data loads
  } catch (err) {
    console.error('Failed to load property:', err);
    document.getElementById('property-info').innerHTML = 
      '<p class="empty-state">Failed to load property. Please try again.</p>';
  }
}

function renderProperty(prop) {
  const container = document.getElementById('property-info');
  
  const html = `
    <div class="card-header">
      <h3>${prop.address}</h3>
      <div class="card-actions">
        ${!prop.is_registered ? `
          <button onclick="registerProperty(${prop.id})" class="btn btn-primary">Register for TDT</button>
        ` : ''}
      </div>
    </div>
    
    <div class="details-grid">
      <div class="detail-item">
        <span class="detail-label">City</span>
        <span class="detail-value">${prop.city}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">ZIP Code</span>
        <span class="detail-value">${prop.zip_code}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Parcel ID</span>
        <span class="detail-value">${prop.parcel_id || 'Not assigned'}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">TDT Number</span>
        <span class="detail-value">${prop.tdt_number || 'Not registered'}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Registration Status</span>
        <span class="detail-value">${getStatusBadge(prop.is_registered)}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Registration Date</span>
        <span class="detail-value">${prop.registration_date ? formatDate(prop.registration_date) : '-'}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Compliance Scenario</span>
        <span class="detail-value">${getScenarioBadge(prop.compliance_scenario) || 'Not assessed'}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Zoning</span>
        <span class="detail-value">${prop.zoning_type ? prop.zoning_type.charAt(0).toUpperCase() + prop.zoning_type.slice(1) : '-'}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Homestead</span>
        <span class="detail-value">${prop.homestead_status ? 'Yes' : 'No'}</span>
      </div>
    </div>
  `;
  
  container.innerHTML = html;
  
  // Update map address
  document.getElementById('map-address').textContent = 
    `${prop.address}, ${prop.city}, FL ${prop.zip_code}`;
}

function renderPayments(payments) {
  const container = document.getElementById('payments-table');
  
  if (!payments || payments.length === 0) {
    container.innerHTML = '<p class="empty-state">No payments recorded for this property.</p>';
    return;
  }
  
  const html = `
    <table class="data-table">
      <thead>
        <tr>
          <th>Transaction ID</th>
          <th>Period</th>
          <th>Amount</th>
          <th>Dealer</th>
          <th>Payment Date</th>
          <th>Verified</th>
        </tr>
      </thead>
      <tbody>
        ${payments.map(payment => `
          <tr>
            <td><code>${payment.transaction_id}</code></td>
            <td>${formatDate(payment.period_start)} - ${formatDate(payment.period_end)}</td>
            <td>${formatCurrency(payment.amount)}</td>
            <td>${getDealerBadge(payment.dealers?.name)}</td>
            <td>${formatDate(payment.payment_date)}</td>
            <td>${payment.verified ? 'Yes' : 'No'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
  
  container.innerHTML = html;
}

async function registerProperty(id) {
  try {
    await fetchApi(`/properties/${id}/register`, { method: 'POST' });
    window.location.reload();
  } catch (err) {
    alert('Failed to register property: ' + err.message);
  }
}

function initMap() {
  if (!propertyData || !propertyData.lat || !propertyData.lng) {
    document.getElementById('property-map').innerHTML = 
      '<p class="empty-state" style="padding: 2rem;">No location data available.</p>';
    return;
  }
  
  const location = { lat: propertyData.lat, lng: propertyData.lng };
  const map = new google.maps.Map(document.getElementById('property-map'), {
    zoom: 16,
    center: location,
    mapTypeId: 'roadmap',
    disableDefaultUI: true,
    zoomControl: true
  });
  
  new google.maps.Marker({
    position: location,
    map: map,
    title: propertyData.address
  });
}

