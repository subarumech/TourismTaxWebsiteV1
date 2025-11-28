document.addEventListener('DOMContentLoaded', async () => {
  await loadPayments();
});

async function loadPayments() {
  try {
    const payments = await fetchApi('/payments');
    renderPayments(payments);
  } catch (err) {
    console.error('Failed to load payments:', err);
    document.getElementById('payments-table').innerHTML = 
      '<p class="empty-state">Failed to load payments. Please try again.</p>';
  }
}

function renderPayments(payments) {
  const container = document.getElementById('payments-table');
  
  if (!payments || payments.length === 0) {
    container.innerHTML = '<p class="empty-state">No payments recorded. <a href="/payment-add.html">Record one</a>.</p>';
    return;
  }
  
  const html = `
    <table class="data-table">
      <thead>
        <tr>
          <th>Transaction ID</th>
          <th>Property</th>
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
            <td><a href="/property-detail.html?id=${payment.property_id}">${payment.properties?.address || 'Unknown'}</a></td>
            <td>${formatDate(payment.period_start)} - ${formatDate(payment.period_end)}</td>
            <td>${formatCurrency(payment.amount)}</td>
            <td>${getDealerBadge(payment.dealers?.name)}</td>
            <td>${formatDate(payment.payment_date)}</td>
            <td>
              ${payment.verified ? 
                '<span class="badge badge-success">Verified</span>' : 
                '<span class="badge badge-warning">Pending</span>'}
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
  
  container.innerHTML = html;
}

