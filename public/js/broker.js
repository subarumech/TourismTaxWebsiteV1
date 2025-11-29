function updateLookupPlaceholder() {
    const lookupType = document.getElementById('lookup-type').value;
    const input = document.getElementById('lookup-value');
    
    const placeholders = {
        'parcel_id': 'Enter Parcel ID (e.g., 1234-56-7890)',
        'address': 'Enter Address (e.g., 123 Beach Rd)',
        'tdt_number': 'Enter TDT Number (e.g., 58-123456789)'
    };
    
    input.placeholder = placeholders[lookupType];
    input.value = '';
}

async function lookupTDT() {
    const lookupType = document.getElementById('lookup-type').value;
    const lookupValue = document.getElementById('lookup-value').value.trim();
    const resultsContainer = document.getElementById('lookup-results');
    
    if (!lookupValue) {
        resultsContainer.innerHTML = '<div class="alert alert-warning">Please enter a search value</div>';
        return;
    }
    
    resultsContainer.innerHTML = '<p class="empty-state">Searching...</p>';
    
    try {
        const params = new URLSearchParams();
        params.append(lookupType, lookupValue);
        
        const properties = await apiGet(`/api/properties?search=${encodeURIComponent(lookupValue)}`);
        
        if (properties.length === 0) {
            resultsContainer.innerHTML = `
                <div class="alert alert-warning">
                    <strong>No TDT# Found</strong>
                    <p style="margin-top: 0.5rem;">This property is not registered for TDT. Please direct the property owner to register:</p>
                    <a href="/register.html" target="_blank" class="btn btn-primary" style="margin-top: 1rem;">Register for TDT Number</a>
                </div>
            `;
            return;
        }
        
        const property = properties[0];
        
        if (!property.tdt_number) {
            resultsContainer.innerHTML = `
                <div class="alert alert-warning">
                    <strong>Property Found - No TDT# Assigned</strong>
                    <p style="margin-top: 0.5rem;">This property exists but is not registered for TDT. Please direct the property owner to register:</p>
                    <a href="/register.html" target="_blank" class="btn btn-primary" style="margin-top: 1rem;">Register for TDT Number</a>
                </div>
            `;
            return;
        }
        
        const statusBadge = property.is_active 
            ? '<span class="badge badge-success">Active</span>' 
            : '<span class="badge badge-danger">Inactive</span>';
        
        const statusMessage = property.is_active
            ? '<div class="alert alert-success"><strong>TDT# is Active</strong> - You may collect TDT for this property</div>'
            : '<div class="alert alert-error"><strong>TDT# is Inactive</strong> - Do NOT collect TDT for this property</div>';
        
        resultsContainer.innerHTML = `
            ${statusMessage}
            <div style="background: white; border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 1.5rem; margin-top: 1rem;">
                <div class="details-grid">
                    <div class="detail-item">
                        <div class="detail-label">TDT Number</div>
                        <div class="detail-value"><code style="font-size: 1.2rem;">${property.tdt_number}</code></div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Status</div>
                        <div class="detail-value">${statusBadge}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Owner Name</div>
                        <div class="detail-value">${property.owner_name || 'N/A'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Parcel ID</div>
                        <div class="detail-value"><code>${property.parcel_id || 'N/A'}</code></div>
                    </div>
                    <div class="detail-item full-width">
                        <div class="detail-label">Address</div>
                        <div class="detail-value">${property.address}, ${property.city}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">County</div>
                        <div class="detail-value">${property.county_name || 'Sarasota'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Registration Date</div>
                        <div class="detail-value">${property.registration_date ? new Date(property.registration_date).toLocaleDateString() : 'N/A'}</div>
                    </div>
                    ${property.active_date ? `
                        <div class="detail-item">
                            <div class="detail-label">Active Date</div>
                            <div class="detail-value">${new Date(property.active_date).toLocaleDateString()}</div>
                        </div>
                    ` : ''}
                    ${property.inactive_date ? `
                        <div class="detail-item">
                            <div class="detail-label">Inactive Date</div>
                            <div class="detail-value">${new Date(property.inactive_date).toLocaleDateString()}</div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error looking up TDT:', error);
        resultsContainer.innerHTML = '<div class="alert alert-error">Error performing lookup. Please try again.</div>';
    }
}

document.getElementById('lookup-value').addEventListener('keyup', (e) => {
    if (e.key === 'Enter') lookupTDT();
});

