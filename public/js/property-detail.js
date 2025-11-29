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
    renderSales(propertyData.sales);
    renderBuilding(propertyData.buildings);
    renderValues(propertyData.values);
    renderExemptions(propertyData.exemptions);
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
        <span class="detail-label">Owner</span>
        <span class="detail-value">${prop.owner_name || '-'}</span>
      </div>
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
        <span class="detail-value">${prop.zoning1 || prop.zoning_type ? (prop.zoning1 || prop.zoning_type).charAt(0).toUpperCase() + (prop.zoning1 || prop.zoning_type).slice(1) : '-'}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Land Use Code</span>
        <span class="detail-value">${prop.land_use_code || '-'}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Neighborhood Code</span>
        <span class="detail-value">${prop.neighborhood_code || '-'}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Homestead</span>
        <span class="detail-value">${prop.homestead_status ? 'Yes' : 'No'}</span>
      </div>
    </div>
    
    ${prop.legal_description1 ? `
      <div style="margin-top: 1rem;">
        <h4>Legal Description</h4>
        <p>${prop.legal_description1}</p>
        ${prop.legal_description2 ? `<p>${prop.legal_description2}</p>` : ''}
      </div>
    ` : ''}
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

function renderSales(sales) {
  const container = document.getElementById('sales-section');
  if (!container) return;
  
  if (!sales || sales.length === 0) {
    container.style.display = 'none';
    return;
  }
  
  container.style.display = 'block';
  const tableContainer = document.getElementById('sales-table');
  const html = `
    <table class="data-table">
      <thead>
        <tr>
          <th>Sale Date</th>
          <th>Sale Price</th>
          <th>Deed Type</th>
          <th>Legal Reference</th>
        </tr>
      </thead>
      <tbody>
        ${sales.slice(0, 10).map(sale => `
          <tr>
            <td>${formatDate(sale.sale_date)}</td>
            <td>${sale.sale_price ? formatCurrency(sale.sale_price) : '-'}</td>
            <td>${sale.deed_type || '-'}</td>
            <td>${sale.legal_reference || '-'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
  tableContainer.innerHTML = html;
}

function renderBuilding(buildings) {
  const container = document.getElementById('building-section');
  if (!container) return;
  
  if (!buildings || buildings.length === 0) {
    container.style.display = 'none';
    return;
  }
  
  container.style.display = 'block';
  const building = buildings[0];
  const detailsContainer = document.getElementById('building-details');
  const html = `
    <div class="details-grid">
      ${building.year_built ? `
        <div class="detail-item">
          <span class="detail-label">Year Built</span>
          <span class="detail-value">${building.year_built}</span>
        </div>
      ` : ''}
      ${building.full_bath ? `
        <div class="detail-item">
          <span class="detail-label">Full Bathrooms</span>
          <span class="detail-value">${building.full_bath}</span>
        </div>
      ` : ''}
      ${building.half_bath ? `
        <div class="detail-item">
          <span class="detail-label">Half Bathrooms</span>
          <span class="detail-value">${building.half_bath}</span>
        </div>
      ` : ''}
      ${building.primary_floors ? `
        <div class="detail-item">
          <span class="detail-label">Floors</span>
          <span class="detail-value">${building.primary_floors}</span>
        </div>
      ` : ''}
      ${building.units ? `
        <div class="detail-item">
          <span class="detail-label">Units</span>
          <span class="detail-value">${building.units}</span>
        </div>
      ` : ''}
      ${building.percent_air_conditioned ? `
        <div class="detail-item">
          <span class="detail-label">Air Conditioning</span>
          <span class="detail-value">${building.percent_air_conditioned}%</span>
        </div>
      ` : ''}
      ${building.grade ? `
        <div class="detail-item">
          <span class="detail-label">Grade</span>
          <span class="detail-value">${building.grade}</span>
        </div>
      ` : ''}
    </div>
  `;
  detailsContainer.innerHTML = html;
}

function renderValues(values) {
  const container = document.getElementById('values-section');
  if (!container) return;
  
  if (!values || values.length === 0) {
    container.style.display = 'none';
    return;
  }
  
  container.style.display = 'block';
  const value = values[0];
  const detailsContainer = document.getElementById('values-details');
  const html = `
    <div class="details-grid">
      <div class="detail-item">
        <span class="detail-label">Total Value</span>
        <span class="detail-value">${value.total_value ? formatCurrency(value.total_value) : '-'}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Land Value</span>
        <span class="detail-value">${value.land_value ? formatCurrency(value.land_value) : '-'}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Building Value</span>
        <span class="detail-value">${value.building_value ? formatCurrency(value.building_value) : '-'}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Assessed Value</span>
        <span class="detail-value">${value.assessed_value ? formatCurrency(value.assessed_value) : '-'}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Taxable Value</span>
        <span class="detail-value">${value.taxable_value ? formatCurrency(value.taxable_value) : '-'}</span>
      </div>
    </div>
  `;
  detailsContainer.innerHTML = html;
}

function renderExemptions(exemptions) {
  const container = document.getElementById('exemptions-section');
  if (!container) return;
  
  if (!exemptions || exemptions.length === 0) {
    container.style.display = 'none';
    return;
  }
  
  container.style.display = 'block';
  const tableContainer = document.getElementById('exemptions-table');
  const html = `
    <table class="data-table">
      <thead>
        <tr>
          <th>Exemption Code</th>
          <th>Amount</th>
          <th>App Code</th>
        </tr>
      </thead>
      <tbody>
        ${exemptions.map(exemption => `
          <tr>
            <td>${exemption.exemption_code}</td>
            <td>${exemption.amount_off_total_assessment ? formatCurrency(exemption.amount_off_total_assessment) : '-'}</td>
            <td>${exemption.app_code || '-'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
  tableContainer.innerHTML = html;
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

