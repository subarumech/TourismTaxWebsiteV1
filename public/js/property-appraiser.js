async function loadDashboard() {
    try {
        const properties = await apiGet('/api/properties');
        
        const propertiesWithTdt = properties.filter(p => p.tdt_number);
        const homesteadWithTdt = properties.filter(p => p.tdt_number && p.homestead_status);
        
        document.getElementById('total-properties').textContent = properties.length;
        document.getElementById('properties-with-tdt').textContent = propertiesWithTdt.length;
        document.getElementById('homestead-with-tdt').textContent = homesteadWithTdt.length;
        
        renderPIDTable(properties);
        renderHomesteadAudit(homesteadWithTdt);
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

function renderPIDTable(properties) {
    const container = document.getElementById('pid-tdt-table');
    
    if (properties.length === 0) {
        container.innerHTML = '<p class="empty-state">No properties found</p>';
        return;
    }
    
    const html = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>PID (Parcel ID)</th>
                    <th>Owner Name</th>
                    <th>Address</th>
                    <th>City</th>
                    <th>County</th>
                    <th>TDT Number</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${properties.map(property => `
                    <tr>
                        <td><code>${property.parcel_id || 'N/A'}</code></td>
                        <td>${property.owner_name || 'N/A'}</td>
                        <td>${property.address}</td>
                        <td>${property.city}</td>
                        <td>${property.county_name || 'Sarasota'}</td>
                        <td>${property.tdt_number ? `<code>${property.tdt_number}</code>` : '<span class="badge badge-warning">No TDT</span>'}</td>
                        <td>
                            ${property.is_active 
                                ? '<span class="badge badge-success">Active</span>' 
                                : '<span class="badge badge-danger">Inactive</span>'
                            }
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    container.innerHTML = html;
}

function renderHomesteadAudit(properties) {
    const container = document.getElementById('homestead-audit-table');
    
    if (properties.length === 0) {
        container.innerHTML = '<p class="empty-state">No conflicts found - All properties with TDT# correctly do not have Homestead Exemption</p>';
        return;
    }
    
    const html = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>PID (Parcel ID)</th>
                    <th>Owner Name</th>
                    <th>Address</th>
                    <th>TDT Number</th>
                    <th>Homestead Status</th>
                    <th>Issue</th>
                </tr>
            </thead>
            <tbody>
                ${properties.map(property => `
                    <tr>
                        <td><code>${property.parcel_id || 'N/A'}</code></td>
                        <td>${property.owner_name || 'N/A'}</td>
                        <td>${property.address}</td>
                        <td><code>${property.tdt_number}</code></td>
                        <td><span class="badge badge-warning">Has Homestead</span></td>
                        <td>Should NOT have Homestead Exemption</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    container.innerHTML = html;
}

async function exportPIDReport() {
    try {
        const properties = await apiGet('/api/properties');
        const csv = generatePIDCSV(properties);
        downloadCSV(csv, 'pid-tdt-report.csv');
    } catch (error) {
        console.error('Error exporting report:', error);
        alert('Error exporting report');
    }
}

async function exportHomesteadAudit() {
    try {
        const properties = await apiGet('/api/properties');
        const conflicts = properties.filter(p => p.tdt_number && p.homestead_status);
        const csv = generateHomesteadCSV(conflicts);
        downloadCSV(csv, 'homestead-audit.csv');
    } catch (error) {
        console.error('Error exporting audit:', error);
        alert('Error exporting audit');
    }
}

function generatePIDCSV(properties) {
    const headers = ['PID', 'Owner Name', 'Address', 'City', 'County', 'TDT Number', 'Active Status', 'Active Date', 'Inactive Date'];
    const rows = properties.map(p => [
        p.parcel_id || '',
        p.owner_name || '',
        p.address,
        p.city,
        p.county_name || 'Sarasota',
        p.tdt_number || '',
        p.is_active ? 'Active' : 'Inactive',
        p.active_date ? new Date(p.active_date).toLocaleDateString() : '',
        p.inactive_date ? new Date(p.inactive_date).toLocaleDateString() : ''
    ]);
    
    return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
}

function generateHomesteadCSV(properties) {
    const headers = ['PID', 'Owner Name', 'Address', 'City', 'County', 'TDT Number', 'Homestead Status', 'Issue'];
    const rows = properties.map(p => [
        p.parcel_id || '',
        p.owner_name || '',
        p.address,
        p.city,
        p.county_name || 'Sarasota',
        p.tdt_number,
        'Has Homestead',
        'Should NOT have Homestead Exemption'
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

loadDashboard();

