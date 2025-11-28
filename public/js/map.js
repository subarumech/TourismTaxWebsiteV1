document.addEventListener('DOMContentLoaded', async () => {
  await loadMap();
});

async function loadMap() {
  try {
    const properties = await fetchApi('/properties');
    initFullMap(properties);
  } catch (err) {
    console.error('Failed to load properties:', err);
    document.getElementById('full-map').innerHTML = 
      '<p class="empty-state">Failed to load map data. Please try again.</p>';
  }
}

function getMarkerColor(scenario) {
  switch (scenario) {
    case 1: return '#ef4444'; // Red - not registered, didn't pay
    case 2: return '#f97316'; // Orange - not registered, but paid
    case 3: return '#eab308'; // Yellow - registered, didn't pay
    case 4: return '#a855f7'; // Purple - registered, wrong amount
    default: return '#22c55e'; // Green - compliant
  }
}

function initFullMap(properties) {
  // Center on Sarasota County
  const sarasotaCenter = { lat: 27.2500, lng: -82.5000 };
  
  const map = new google.maps.Map(document.getElementById('full-map'), {
    zoom: 10,
    center: sarasotaCenter,
    mapTypeId: 'roadmap'
  });

  const infoWindow = new google.maps.InfoWindow();
  const bounds = new google.maps.LatLngBounds();
  let hasValidCoords = false;

  properties.forEach(prop => {
    if (!prop.lat || !prop.lng) return;
    
    hasValidCoords = true;
    const position = { lat: prop.lat, lng: prop.lng };
    bounds.extend(position);

    const marker = new google.maps.Marker({
      position: position,
      map: map,
      title: prop.address,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: getMarkerColor(prop.compliance_scenario),
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
        scale: 10
      }
    });

    const scenarioText = getScenarioText(prop.compliance_scenario);
    const content = `
      <div style="padding: 8px; max-width: 250px;">
        <strong style="font-size: 14px;">${prop.address}</strong><br>
        <span style="color: #666;">${prop.city}, FL ${prop.zip_code}</span><br><br>
        <strong>TDT#:</strong> ${prop.tdt_number || 'Not registered'}<br>
        <strong>Status:</strong> ${scenarioText}<br><br>
        <a href="/property-detail.html?id=${prop.id}" style="color: #0066cc;">View Details</a>
      </div>
    `;

    marker.addListener('click', () => {
      infoWindow.setContent(content);
      infoWindow.open(map, marker);
    });
  });

  // Fit map to show all markers
  if (hasValidCoords) {
    map.fitBounds(bounds);
    // Don't zoom in too far
    const listener = google.maps.event.addListener(map, 'idle', () => {
      if (map.getZoom() > 15) map.setZoom(15);
      google.maps.event.removeListener(listener);
    });
  }
}

function getScenarioText(scenario) {
  switch (scenario) {
    case 1: return '<span style="color: #ef4444;">Not registered, didn\'t pay</span>';
    case 2: return '<span style="color: #f97316;">Not registered, but paid</span>';
    case 3: return '<span style="color: #eab308;">Registered, didn\'t pay</span>';
    case 4: return '<span style="color: #a855f7;">Registered, wrong amount</span>';
    default: return '<span style="color: #22c55e;">Compliant</span>';
  }
}

