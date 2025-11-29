let allProperties = [];

async function loadDashboard() {
    try {
        allProperties = await apiGet('/api/properties');
        
        const activeTdt = allProperties.filter(p => p.tdt_number && p.is_active);
        const zoningIssues = allProperties.filter(p => p.tdt_number && p.zoning_type === 'residential');
        
        document.getElementById('total-properties').textContent = allProperties.length;
        document.getElementById('active-tdt').textContent = activeTdt.length;
        document.getElementById('zoning-violations').textContent = zoningIssues.length;
        
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
                    <th>Address</th>
                    <th>City</th>
                    <th>County</th>
                    <th>TDT Number</th>
                    <th>Status</th>
                    <th>Zoning</th>
                    <th>Map</th>
                </tr>
            </thead>
            <tbody>
                ${properties.map(property => `
                    <tr>
                        <td>${property.owner_name || 'N/A'}</td>
                        <td><code>${property.parcel_id || 'N/A'}</code></td>
                        <td>${property.address}</td>
                        <td>${property.city}</td>
                        <td>${property.county_name || 'Sarasota'}</td>
                        <td>${property.tdt_number ? `<code>${property.tdt_number}</code>` : '<span class="badge badge-warning">No TDT</span>'}</td>
                        <td>
                            ${property.is_active 
                                ? `<span class="badge badge-success">Active</span><br><small>${property.active_date ? new Date(property.active_date).toLocaleDateString() : ''}</small>` 
                                : `<span class="badge badge-danger">Inactive</span><br><small>${property.inactive_date ? new Date(property.inactive_date).toLocaleDateString() : ''}</small>`
                            }
                        </td>
                        <td><span class="badge badge-scenario-${property.zoning_type === 'residential' ? '4' : '1'}">${property.zoning_type || 'N/A'}</span></td>
                        <td><a href="/map.html?property=${property.id}" class="btn btn-small btn-secondary">View Map</a></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    container.innerHTML = html;
}

function filterProperties() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const statusFilter = document.getElementById('status-filter').value;
    
    let filtered = allProperties;
    
    if (searchTerm) {
        filtered = filtered.filter(p => 
            (p.owner_name && p.owner_name.toLowerCase().includes(searchTerm)) ||
            (p.parcel_id && p.parcel_id.toLowerCase().includes(searchTerm)) ||
            (p.tdt_number && p.tdt_number.toLowerCase().includes(searchTerm)) ||
            p.address.toLowerCase().includes(searchTerm)
        );
    }
    
    if (statusFilter === 'active') {
        filtered = filtered.filter(p => p.is_active);
    } else if (statusFilter === 'inactive') {
        filtered = filtered.filter(p => !p.is_active);
    }
    
    renderPropertiesTable(filtered);
}

async function exportCountyReport() {
    try {
        const csv = generateCountyCSV(allProperties);
        downloadCSV(csv, 'county-property-report.csv');
    } catch (error) {
        console.error('Error exporting report:', error);
        alert('Error exporting report');
    }
}

function generateCountyCSV(properties) {
    const headers = ['Owner Name', 'PID', 'TDT Number', 'Address', 'City', 'County', 'Zoning', 'Status', 'Active Date', 'Inactive Date'];
    const rows = properties.map(p => [
        p.owner_name || '',
        p.parcel_id || '',
        p.tdt_number || '',
        p.address,
        p.city,
        p.county_name || 'Sarasota',
        p.zoning_type || '',
        p.is_active ? 'Active' : 'Inactive',
        p.active_date ? new Date(p.active_date).toLocaleDateString() : '',
        p.inactive_date ? new Date(p.inactive_date).toLocaleDateString() : ''
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

