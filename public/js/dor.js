let allProperties = [];

async function loadDashboard() {
    try {
        allProperties = await apiGet('/api/properties');
        
        const issuedTdt = allProperties.filter(p => p.tdt_number);
        const activeTdt = allProperties.filter(p => p.tdt_number && p.is_active);
        const inactiveTdt = allProperties.filter(p => p.tdt_number && !p.is_active);
        
        document.getElementById('total-properties').textContent = allProperties.length;
        document.getElementById('issued-tdt').textContent = issuedTdt.length;
        document.getElementById('active-tdt').textContent = activeTdt.length;
        document.getElementById('inactive-tdt').textContent = inactiveTdt.length;
        
        renderPropertiesTable(allProperties);
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

function renderPropertiesTable(properties) {
    const container = document.getElementById('properties-table');
    
    if (properties.length === 0) {
        container.innerHTML = '<p class="empty-state">No properties found</p>';
        return;
    }
    
    const html = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Owner Name</th>
                    <th>PID</th>
                    <th>TDT Number</th>
                    <th>Address</th>
                    <th>City</th>
                    <th>County</th>
                    <th>Status</th>
                    <th>Active Date</th>
                    <th>Inactive Date</th>
                    <th>Map</th>
                </tr>
            </thead>
            <tbody>
                ${properties.map(property => `
                    <tr>
                        <td>${property.owner_name || 'N/A'}</td>
                        <td><code>${property.parcel_id || 'N/A'}</code></td>
                        <td>${property.tdt_number ? `<code>${property.tdt_number}</code>` : '<span class="badge badge-warning">Not Issued</span>'}</td>
                        <td>${property.address}</td>
                        <td>${property.city}</td>
                        <td>${property.county_name || 'Sarasota'}</td>
                        <td>
                            ${property.is_active 
                                ? '<span class="badge badge-success">Active</span>' 
                                : '<span class="badge badge-danger">Inactive</span>'
                            }
                        </td>
                        <td>${property.active_date ? new Date(property.active_date).toLocaleDateString() : 'N/A'}</td>
                        <td>${property.inactive_date ? new Date(property.inactive_date).toLocaleDateString() : 'N/A'}</td>
                        <td><a href="/map.html?property=${property.id}" class="btn btn-small btn-secondary">View</a></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    container.innerHTML = html;
}

function filterProperties() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const countyFilter = document.getElementById('county-filter').value;
    
    let filtered = allProperties;
    
    if (searchTerm) {
        filtered = filtered.filter(p => 
            (p.owner_name && p.owner_name.toLowerCase().includes(searchTerm)) ||
            (p.parcel_id && p.parcel_id.toLowerCase().includes(searchTerm)) ||
            (p.tdt_number && p.tdt_number.toLowerCase().includes(searchTerm)) ||
            (p.county_name && p.county_name.toLowerCase().includes(searchTerm))
        );
    }
    
    if (countyFilter) {
        filtered = filtered.filter(p => (p.county_name || 'Sarasota') === countyFilter);
    }
    
    renderPropertiesTable(filtered);
}

async function exportDORReport() {
    try {
        const csv = generateDORCSV(allProperties);
        downloadCSV(csv, 'dor-tdt-report.csv');
    } catch (error) {
        console.error('Error exporting report:', error);
        alert('Error exporting report');
    }
}

function generateDORCSV(properties) {
    const headers = ['Owner Name', 'PID', 'TDT Number', 'Address', 'City', 'County', 'Status', 'Active Date', 'Inactive Date', 'Latitude', 'Longitude'];
    const rows = properties.map(p => [
        p.owner_name || '',
        p.parcel_id || '',
        p.tdt_number || '',
        p.address,
        p.city,
        p.county_name || 'Sarasota',
        p.is_active ? 'Active' : 'Inactive',
        p.active_date ? new Date(p.active_date).toLocaleDateString() : '',
        p.inactive_date ? new Date(p.inactive_date).toLocaleDateString() : '',
        p.lat || '',
        p.lng || ''
    ]);
    
    return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
}

function downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

document.getElementById('search-input').addEventListener('keyup', (e) => {
    if (e.key === 'Enter') filterProperties();
});

loadDashboard();

