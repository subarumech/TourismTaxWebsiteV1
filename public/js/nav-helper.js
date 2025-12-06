function getDashboardUrl() {
    const entityType = sessionStorage.getItem('entityType');
    
    const dashboardMap = {
        'property-appraiser': '/property-appraiser.html',
        'tax-collector': '/tax-collector.html',
        'county-gov': '/county-gov.html',
        'city-gov': '/city-gov.html',
        'dor': '/dor.html',
        'broker': '/broker.html',
        'owner': '/register.html'
    };
    
    return dashboardMap[entityType] || '/tax-collector.html';
}

function checkSession() {
    const entityType = sessionStorage.getItem('entityType');
    if (!entityType) {
        window.location.href = '/index.html';
        return false;
    }
    return true;
}

function updateDashboardLinks() {
    const dashboardUrl = getDashboardUrl();
    const dashboardLinks = document.querySelectorAll('a[href="/"]');
    dashboardLinks.forEach(link => {
        if (link.textContent.trim() === 'Dashboard') {
            link.href = dashboardUrl;
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    updateDashboardLinks();
});

