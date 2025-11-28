document.addEventListener('DOMContentLoaded', async () => {
  await loadFormData();
  
  document.getElementById('payment-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = {
      property_id: parseInt(formData.get('property_id')),
      dealer_id: formData.get('dealer_id') ? parseInt(formData.get('dealer_id')) : null,
      amount: parseFloat(formData.get('amount')),
      period_start: formData.get('period_start'),
      period_end: formData.get('period_end'),
      expected_amount: formData.get('expected_amount') ? parseFloat(formData.get('expected_amount')) : null,
      notes: formData.get('notes') || null
    };
    
    try {
      await fetchApi('/payments', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      
      alert('Payment recorded successfully!');
      window.location.href = '/payments.html';
    } catch (err) {
      alert('Failed to record payment: ' + err.message);
    }
  });
});

async function loadFormData() {
  try {
    // Load properties
    const properties = await fetchApi('/properties');
    const propertySelect = document.getElementById('property_id');
    
    properties.forEach(prop => {
      const option = document.createElement('option');
      option.value = prop.id;
      option.textContent = `${prop.address} - ${prop.tdt_number || 'No TDT#'}`;
      propertySelect.appendChild(option);
    });
    
    // Load dealers
    const dealers = await fetchApi('/dealers');
    const dealerSelect = document.getElementById('dealer_id');
    
    dealers.forEach(dealer => {
      const option = document.createElement('option');
      option.value = dealer.id;
      option.textContent = dealer.name;
      dealerSelect.appendChild(option);
    });
  } catch (err) {
    console.error('Failed to load form data:', err);
  }
}

