document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const scenario = params.get('scenario');
  const search = params.get('search');
  
  if (scenario) {
    document.getElementById('scenario-select').value = scenario;
  }
  if (search) {
    document.getElementById('search-input').value = search;
  }
  
  document.getElementById('search-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const params = new URLSearchParams();
    
    const searchVal = formData.get('search');
    const scenarioVal = formData.get('scenario');
    
    if (searchVal) params.set('search', searchVal);
    if (scenarioVal) params.set('scenario', scenarioVal);
    
    window.location.href = `/properties.html?${params.toString()}`;
  });
  
  await loadProperties();
});

async function loadProperties() {
  try {
    const params = new URLSearchParams(window.location.search);
    let endpoint = '/properties';
    
    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }
    
    const properties = await fetchApi(endpoint);
    renderProperties(properties);
  } catch (err) {
    console.error('Failed to load properties:', err);
    document.getElementById('properties-table').innerHTML = 
      '<p class="empty-state">Failed to load properties. Please try again.</p>';
  }
}

function renderProperties(properties) {
  const container = document.getElementById('properties-table');
  
  if (!properties || properties.length === 0) {
    container.innerHTML = '<p class="empty-state">No properties found. <a href="/property-add.html">Add one</a>.</p>';
    return;
  }
  
  const html = `
    <table class="data-table">
      <thead>
        <tr>
          <th>Address</th>
          <th>City</th>
          <th>Parcel ID</th>
          <th>TDT #</th>
          <th>Status</th>
          <th>Scenario</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${properties.map(prop => `
          <tr>
            <td><a href="/property-detail.html?id=${prop.id}">${prop.address}</a></td>
            <td>${prop.city}</td>
            <td>${prop.parcel_id || '-'}</td>
            <td>${prop.tdt_number || '-'}</td>
            <td>${getStatusBadge(prop.is_registered)}</td>
            <td>${getScenarioBadge(prop.compliance_scenario)}</td>
            <td>
              <a href="/property-detail.html?id=${prop.id}" class="btn btn-small">View</a>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
  
  container.innerHTML = html;
}

