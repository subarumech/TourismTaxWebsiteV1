document.addEventListener('DOMContentLoaded', async () => {
  await loadDashboard();
});

async function loadDashboard() {
  try {
    const stats = await fetchApi('/stats');
    
    document.getElementById('total-properties').textContent = stats.totalProperties;
    document.getElementById('registered-count').textContent = stats.registeredCount;
    document.getElementById('total-collected').textContent = formatCurrency(stats.totalCollected);
    document.getElementById('dealer-count').textContent = stats.dealerCount;
    
    document.getElementById('scenario-1').textContent = stats.scenarioCounts[1] || 0;
    document.getElementById('scenario-2').textContent = stats.scenarioCounts[2] || 0;
    document.getElementById('scenario-3').textContent = stats.scenarioCounts[3] || 0;
    document.getElementById('scenario-4').textContent = stats.scenarioCounts[4] || 0;
    
    renderTransactions(stats.recentTransactions);
  } catch (err) {
    console.error('Failed to load dashboard:', err);
    document.getElementById('transactions-table').innerHTML = 
      '<p class="empty-state">Failed to load data. Please try again.</p>';
  }
}

async function syncDatabase() {
  const btn = document.getElementById('sync-btn');
  const originalText = btn.textContent;
  
  btn.disabled = true;
  btn.textContent = 'Syncing...';
  
  try {
    const result = await fetchApi('/sync', { method: 'POST' });
    alert(result.message);
    await loadDashboard(); // Refresh the dashboard
  } catch (err) {
    alert('Sync failed: ' + err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = originalText;
  }
}

function renderTransactions(transactions) {
  const container = document.getElementById('transactions-table');
  
  if (!transactions || transactions.length === 0) {
    container.innerHTML = '<p class="empty-state">No transactions yet.</p>';
    return;
  }
  
  const html = `
    <table class="data-table">
      <thead>
        <tr>
          <th>Transaction ID</th>
          <th>Property</th>
          <th>Amount</th>
          <th>Dealer</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        ${transactions.map(txn => `
          <tr>
            <td><code>${txn.transaction_id}</code></td>
            <td><a href="/property-detail.html?id=${txn.properties?.id || txn.property_id}">${txn.properties?.address || 'Unknown'}</a></td>
            <td>${formatCurrency(txn.amount)}</td>
            <td>${getDealerBadge(txn.dealers?.name)}</td>
            <td>${formatDate(txn.payment_date)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
  
  container.innerHTML = html;
}

