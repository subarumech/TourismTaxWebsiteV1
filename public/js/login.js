document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const entityType = document.getElementById('entity-type').value;
    
    if (!username || !password || !entityType) {
        alert('Please fill in all fields');
        return;
    }
    
    sessionStorage.setItem('username', username);
    sessionStorage.setItem('entityType', entityType);
    
    const redirectMap = {
        'property-appraiser': '/property-appraiser.html',
        'tax-collector': '/tax-collector.html',
        'county-gov': '/county-gov.html',
        'city-gov': '/city-gov.html',
        'dor': '/dor.html',
        'broker': '/broker.html',
        'owner': '/register.html'
    };
    
    window.location.href = redirectMap[entityType] || '/tax-collector.html';
});

