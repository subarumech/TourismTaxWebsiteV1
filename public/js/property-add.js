document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('property-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = {
      address: formData.get('address'),
      city: formData.get('city'),
      zip_code: formData.get('zip_code'),
      parcel_id: formData.get('parcel_id') || null,
      zoning_type: formData.get('zoning_type'),
      homestead_status: formData.get('homestead_status') === 'on',
      is_registered: formData.get('is_registered') === 'on'
    };
    
    try {
      const result = await fetchApi('/properties', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      
      alert(`Property added successfully! TDT#: ${result.tdt_number || 'Not registered'}`);
      window.location.href = `/property-detail.html?id=${result.id}`;
    } catch (err) {
      alert('Failed to add property: ' + err.message);
    }
  });
});

