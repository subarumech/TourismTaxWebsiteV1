document.getElementById('register-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = {
        owner_name: document.getElementById('owner_name').value,
        address: document.getElementById('address').value,
        city: document.getElementById('city').value,
        county_name: document.getElementById('county_name').value,
        zip_code: document.getElementById('zip_code').value,
        parcel_id: document.getElementById('parcel_id').value || null,
        zoning_type: document.getElementById('zoning_type').value,
        is_registered: true,
        is_active: true,
        active_date: new Date().toISOString(),
        homestead_status: false
    };
    
    try {
        const button = e.target.querySelector('button[type="submit"]');
        button.disabled = true;
        button.textContent = 'Registering...';
        
        const property = await apiPost('/api/properties', formData);
        
        if (property && property.tdt_number) {
            const resultsHTML = `
                <div class="card" style="max-width: 800px; margin: 2rem auto; text-align: center;">
                    <div style="background: var(--blue-light-1); padding: 2rem; border-radius: var(--radius-lg); border: 3px solid var(--blue-3);">
                        <h2 style="color: var(--blue-1); margin-bottom: 1rem;">Registration Successful!</h2>
                        <p style="font-size: 1.1rem; margin-bottom: 1.5rem;">Your TDT Number has been issued:</p>
                        <div style="background: white; padding: 2rem; border-radius: var(--radius-md); margin-bottom: 1.5rem;">
                            <code style="font-size: 2.5rem; font-weight: bold; color: var(--blue-1);">${property.tdt_number}</code>
                        </div>
                        <div style="background: white; padding: 1.5rem; border-radius: var(--radius-md); text-align: left; margin-bottom: 1.5rem;">
                            <h3 style="margin-bottom: 1rem;">Property Details</h3>
                            <p><strong>Owner:</strong> ${property.owner_name}</p>
                            <p><strong>Address:</strong> ${property.address}, ${property.city}, ${property.county_name || 'Sarasota'} ${property.zip_code}</p>
                            ${property.parcel_id ? `<p><strong>Parcel ID:</strong> ${property.parcel_id}</p>` : ''}
                            <p><strong>Status:</strong> <span class="badge badge-success">Active</span></p>
                            <p><strong>Registration Date:</strong> ${new Date(property.registration_date).toLocaleDateString()}</p>
                        </div>
                        <div style="background: var(--grey-light-1); padding: 1rem; border-radius: var(--radius-md); text-align: left;">
                            <h4 style="margin-bottom: 0.5rem;">Important Next Steps:</h4>
                            <ul style="margin-left: 1.5rem; line-height: 1.8;">
                                <li>Save your TDT number - you will need it for all rental transactions</li>
                                <li>Provide this TDT number to your vacation rental platform (Airbnb, VRBO, etc.)</li>
                                <li>All rental payments must include this TDT number</li>
                                <li>Keep this number active as long as you're renting the property</li>
                            </ul>
                        </div>
                        <button class="btn btn-primary" onclick="window.print()" style="margin-top: 1.5rem; margin-right: 0.5rem;">Print Confirmation</button>
                        <a href="/register.html" class="btn btn-secondary" style="margin-top: 1.5rem;">Register Another Property</a>
                    </div>
                </div>
            `;
            
            document.querySelector('.main-content').innerHTML = `
                <div class="content-container">
                    ${resultsHTML}
                </div>
            `;
        } else {
            throw new Error('Registration failed - no TDT number received');
        }
        
    } catch (error) {
        console.error('Error registering property:', error);
        alert('Error registering property. Please try again or contact support.');
        
        const button = e.target.querySelector('button[type="submit"]');
        button.disabled = false;
        button.textContent = 'Register Property';
    }
});

