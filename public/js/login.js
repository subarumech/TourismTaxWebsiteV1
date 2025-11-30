const countyEntities = ['property-appraiser', 'tax-collector', 'county-gov', 'broker', 'owner'];
const municipalityEntities = ['city-gov'];
const stateEntities = ['dor'];

const floridaCounties = [
    { code: '11', name: 'Alachua' },
    { code: '12', name: 'Baker' },
    { code: '13', name: 'Bay' },
    { code: '14', name: 'Bradford' },
    { code: '15', name: 'Brevard' },
    { code: '16', name: 'Broward' },
    { code: '17', name: 'Calhoun' },
    { code: '18', name: 'Charlotte' },
    { code: '19', name: 'Citrus' },
    { code: '20', name: 'Clay' },
    { code: '21', name: 'Collier' },
    { code: '22', name: 'Columbia' },
    { code: '23', name: 'Dade' },
    { code: '24', name: 'DeSoto' },
    { code: '25', name: 'Dixie' },
    { code: '26', name: 'Duval' },
    { code: '27', name: 'Escambia' },
    { code: '28', name: 'Flagler' },
    { code: '29', name: 'Franklin' },
    { code: '30', name: 'Gadsden' },
    { code: '31', name: 'Gilchrist' },
    { code: '32', name: 'Glades' },
    { code: '33', name: 'Gulf' },
    { code: '34', name: 'Hamilton' },
    { code: '35', name: 'Hardee' },
    { code: '36', name: 'Hendry' },
    { code: '37', name: 'Hernando' },
    { code: '38', name: 'Highlands' },
    { code: '39', name: 'Hillsborough' },
    { code: '40', name: 'Holmes' },
    { code: '41', name: 'Indian River' },
    { code: '42', name: 'Jackson' },
    { code: '43', name: 'Jefferson' },
    { code: '44', name: 'Lafayette' },
    { code: '45', name: 'Lake' },
    { code: '46', name: 'Lee' },
    { code: '47', name: 'Leon' },
    { code: '48', name: 'Levy' },
    { code: '49', name: 'Liberty' },
    { code: '50', name: 'Madison' },
    { code: '51', name: 'Manatee' },
    { code: '52', name: 'Marion' },
    { code: '53', name: 'Martin' },
    { code: '54', name: 'Monroe' },
    { code: '55', name: 'Nassau' },
    { code: '56', name: 'Okaloosa' },
    { code: '57', name: 'Okeechobee' },
    { code: '58', name: 'Orange' },
    { code: '59', name: 'Osceola' },
    { code: '60', name: 'Palm Beach' },
    { code: '61', name: 'Pasco' },
    { code: '62', name: 'Pinellas' },
    { code: '63', name: 'Polk' },
    { code: '64', name: 'Putnam' },
    { code: '65', name: 'St. Johns' },
    { code: '66', name: 'St. Lucie' },
    { code: '67', name: 'Santa Rosa' },
    { code: '68', name: 'Sarasota' },
    { code: '69', name: 'Seminole' },
    { code: '70', name: 'Sumter' },
    { code: '71', name: 'Suwannee' },
    { code: '72', name: 'Taylor' },
    { code: '73', name: 'Union' },
    { code: '74', name: 'Volusia' },
    { code: '75', name: 'Wakulla' },
    { code: '76', name: 'Walton' },
    { code: '77', name: 'Washington' }
];

const floridaMunicipalities = [
    'Alachua', 'Altamonte Springs', 'Anna Maria', 'Apalachicola', 'Apopka', 'Arcadia', 'Archer', 'Astalula',
    'Atlantic Beach', 'Atlantis', 'Auburndale', 'Aventura', 'Avon Park', 'Bal Harbour', 'Baldwin', 'Bartow',
    'Bay Harbor Islands', 'Bay Lake', 'Bell', 'Belle Glade', 'Belle Isle', 'Belleair', 'Belleair Beach',
    'Belleair Bluffs', 'Belleair Shore', 'Belleview', 'Beverley Beach', 'Biscayne Park', 'Blountstown',
    'Boca Raton', 'Boynton Beach', 'Bradenton', 'Bradenton Beach', 'Branford', 'Bristol', 'Bronson', 'Brooker',
    'Brooksville', 'Bunnell', 'Bushnell', 'Callahan', 'Callaway', 'Cape Canaveral', 'Cape Coral', 'Casselberry',
    'Cedar Key', 'Center Hill', 'Century', 'Chattahoochee', 'Chiefland', 'Chipley', 'Cinco Bayou', 'Clearwater',
    'Clermont', 'Clewiston', 'Cocoa', 'Cocoa Beach', 'Coconut Creek', 'Coleman', 'Cooper City', 'Coral Gables',
    'Coral Springs', 'Cottondale', 'Crescent City', 'Crestview', 'Cross City', 'Crystal River', 'Cutler Bay',
    'Dade City', 'Dania Beach', 'Davenport', 'Davie', 'Daytona Beach', 'Daytona Beach Shores', 'De Bary',
    'DeFuniak Springs', 'Deerfield Beach', 'Deland', 'Delray Beach', 'Deltona', 'Destin', 'Doral', 'Dunedin',
    'Dunnellon', 'Edgewater', 'Edgewood', 'El Portal', 'Estero', 'Esto', 'Eustis', 'Everglades City',
    'Fanning Springs', 'Fellsmere', 'Fernandina Beach', 'Flagler Beach', 'Florida City', 'Fort Lauderdale',
    'Fort Meade', 'Fort Myers', 'Fort Myers Beach', 'Fort Pierce', 'Fort Walton Beach', 'Fort White', 'Freeport',
    'Frostproof', 'Fruitland Park', 'Gainesville', 'Glen Saint Mary', 'Golden Beach', 'Golf', 'Grant-Valkaria',
    'Green Cove Springs', 'Greenacres', 'Greensboro', 'Greenville', 'Gretna', 'Groveland', 'Gulf Breeze',
    'Gulfport', 'Haines City', 'Hallandale Beach', 'Hampton', 'Havana', 'Haverhill', 'Hawthorne', 'Hialeah',
    'Hialeah Gardens', 'High Springs', 'Highland Beach', 'Highland Park', 'Hilliard', 'Hillsboro Beach',
    'Holly Hill', 'Hollywood', 'Holmes Beach', 'Homestead', 'Howey-in-the-Hills', 'Hypoluxo', 'Indialantic',
    'Indian Creek', 'Indian Harbour Beach', 'Indian River Shores', 'Indian Shores', 'Indiantown', 'Inglis',
    'Interlachen', 'Inverness', 'Islamorada, Village of Islands', 'Jacksonville', 'Jacksonville Beach', 'Jasper',
    'Jay', 'Juno Beach', 'Jupiter', 'Jupiter Inlet Colony', 'Jupiter Island', 'Kenneth City', 'Key Biscayne',
    'Key Colony Beach', 'Key West', 'Keystone Heights', 'Kissimmee', 'La Crosse', 'LaBelle', 'Lady Lake',
    'Lake Alfred', 'Lake Buena Vista', 'Lake Butler', 'Lake City', 'Lake Clark Shores', 'Lake Hamilton',
    'Lake Helen', 'Lake Mary', 'Lake Park', 'Lake Placid', 'Lake Wales', 'Lake Worth Beach', 'Lakeland',
    'Lantana', 'Largo', 'Lauderdale Lakes', 'Lauderdale-By-The-Sea', 'Lauderhill', 'Layton', 'Lazy Lake', 'Lee',
    'Leesburg', 'Lighthouse Point', 'Live Oak', 'Longboat Key', 'Longwood', 'Loxahatchee Groves', 'Lynn Haven',
    'Macclenny', 'Madeira Beach', 'Madison', 'Maitland', 'Malabar', 'Manalapan', 'Mangonia Park', 'Marathon',
    'Marco Island', 'Margate', 'Marianna', 'Mary Esther', 'Mascotte', 'McIntosh', 'Medley', 'Melbourne',
    'Melbourne Beach', 'Melbourne Village', 'Mexico Beach', 'Miami', 'Miami Beach', 'Miami Gardens', 'Miami Lakes',
    'Miami Shores', 'Miami Springs', 'Micanopy', 'Midway', 'Milton', 'Minneola', 'Miramar', 'Monticello',
    'Montverde', 'Moore Haven', 'Mount Dora', 'Mulberry', 'Naples', 'Neptune Beach', 'New Port Richey',
    'New Smyrna Beach', 'Newberry', 'Niceville', 'North Bay Village', 'North Lauderdale', 'North Miami',
    'North Miami Beach', 'North Palm Beach', 'North Port', 'North Redington Beach', 'Oak Hill', 'Oakland',
    'Oakland Park', 'Ocala', 'Ocean Breeze', 'Ocean Ridge', 'Ocoee', 'Okeechobee', 'Oldsmar', 'Opa-locka',
    'Orange City', 'Orange Park', 'Orchid', 'Orlando', 'Ormond Beach', 'Oviedo', 'Pahokee', 'Palatka', 'Palm Bay',
    'Palm Beach', 'Palm Beach Gardens', 'Palm Beach Shores', 'Palm Coast', 'Palm Shores', 'Palm Springs', 'Palmetto',
    'Palmetto Bay', 'Panama City', 'Panama City Beach', 'Parker', 'Parkland', 'Paxton', 'Pembroke Park',
    'Pembroke Pines', 'Penney Farms', 'Pensacola', 'Perry', 'Pierson', 'Pinecrest', 'Pinellas Park', 'Plant City',
    'Plantation', 'Polk City', 'Pomona Park', 'Pompano Beach', 'Ponce Inlet', 'Port Orange', 'Port Richey',
    'Port St. Joe', 'Port St. Lucie', 'Punta Gorda', 'Quincy', 'Reddick', 'Redington Beach', 'Redington Shores',
    'Riviera Beach', 'Rockledge', 'Royal Palm Beach', 'Safety Harbor', 'San Antonio', 'Sanford', 'Sanibel',
    'Sarasota', 'Satellite Beach', 'Sebastian', 'Sebring', 'Sewall\'s Point', 'Shalimar', 'Sneads', 'Sopchoppy',
    'South Bay', 'South Daytona', 'South Miami', 'South Palm Beach', 'South Pasadena', 'Southwest Ranches',
    'Springfield', 'St. Augustine', 'St. Augustine Beach', 'St. Cloud', 'St. Leo', 'St. Lucie Village', 'St. Marks',
    'St. Pete Beach', 'St. Petersburg', 'Starke', 'Stuart', 'Sunny Isles Beach', 'Sunrise', 'Surfside', 'Sweetwater',
    'Tallahassee', 'Tamarac', 'Tampa', 'Tarpon Springs', 'Tavares', 'Temple Terrace', 'Tequesta', 'Titusville',
    'Treasure Island', 'Trenton', 'Umatilla', 'Valparaiso', 'Venice', 'Vero Beach', 'Virginia Gardens', 'Waldo',
    'Wachula', 'Webster', 'Welaka', 'Wellington', 'West Melbourne', 'West Miami', 'West Palm Beach', 'West Park',
    'Westlake', 'Weston', 'Wewahitchka', 'White Springs', 'Wildwood', 'Wilton Manors', 'Windermere', 'Winter Garden',
    'Winter Haven', 'Winter Park', 'Winter Springs', 'Yankeetown', 'Zephyrhills', 'Zolfo Springs'
];

let supabase;
let currentAccount = null;

function initSupabase() {
    const SUPABASE_URL = 'https://qktipxxjiumhsceoonjc.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrdGlweHhqaXVtaHNjZW9vbmpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzNTAxNjEsImV4cCI6MjA3OTkyNjE2MX0.VW_I4w6FRdWtTu1rOttNSq4GHlE6EqFoLZVnZlFrWi4';
    
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

function initCustomDropdown(dropdownId, hiddenInputId, onChange) {
    const dropdown = document.getElementById(dropdownId);
    if (!dropdown) {
        console.error('Dropdown not found:', dropdownId);
        return;
    }
    
    const button = dropdown.querySelector('.custom-dropdown-button');
    const optionsContainer = dropdown.querySelector('.custom-dropdown-options');
    const searchInput = dropdown.querySelector('.custom-dropdown-input');
    const hiddenInput = document.getElementById(hiddenInputId);
    const buttonText = button ? button.querySelector('span') : null;

    if (!button || !optionsContainer || !hiddenInput || !buttonText) {
        console.error('Required elements not found for dropdown:', dropdownId);
        return;
    }

    function closeDropdown() {
        dropdown.classList.remove('open');
        button.setAttribute('aria-expanded', 'false');
        if (searchInput) {
            searchInput.value = '';
            filterOptions('');
        }
    }

    function openDropdown() {
        document.querySelectorAll('.custom-dropdown').forEach(d => {
            if (d.id !== dropdownId) {
                d.classList.remove('open');
                const btn = d.querySelector('.custom-dropdown-button');
                if (btn) btn.setAttribute('aria-expanded', 'false');
                const search = d.querySelector('.custom-dropdown-input');
                if (search) {
                    search.value = '';
                    d.querySelectorAll('.custom-dropdown-option').forEach(opt => {
                        opt.classList.remove('hidden');
                    });
                }
            }
        });
        dropdown.classList.add('open');
        button.setAttribute('aria-expanded', 'true');
        if (searchInput) {
            setTimeout(() => searchInput.focus(), 10);
        }
    }

    function filterOptions(query) {
        const searchTerm = query.toLowerCase().trim();
        const options = optionsContainer.querySelectorAll('.custom-dropdown-option');
        let hasVisible = false;
        
        options.forEach(option => {
            const text = option.textContent.toLowerCase();
            if (searchTerm === '' || text.includes(searchTerm)) {
                option.classList.remove('hidden');
                hasVisible = true;
            } else {
                option.classList.add('hidden');
            }
        });

        let noResults = optionsContainer.querySelector('.no-results');
        if (!hasVisible && searchTerm !== '') {
            if (!noResults) {
                noResults = document.createElement('div');
                noResults.className = 'no-results';
                noResults.textContent = 'No results found';
                optionsContainer.appendChild(noResults);
            }
            noResults.style.display = 'block';
        } else if (noResults) {
            noResults.style.display = 'none';
        }
    }

    function toggleDropdown(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        if (dropdown.classList.contains('open')) {
            closeDropdown();
        } else {
            openDropdown();
        }
    }

    button.addEventListener('click', toggleDropdown);
    button.style.cursor = 'pointer';
    button.setAttribute('tabindex', '0');
    
    button.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleDropdown(e);
        }
    });

    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            filterOptions(e.target.value);
        });
        
        searchInput.addEventListener('click', function(e) {
            e.stopPropagation();
        });
        
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeDropdown();
                button.focus();
            }
        });
    }

    optionsContainer.addEventListener('click', function(e) {
        const option = e.target.closest('.custom-dropdown-option');
        if (option) {
            const value = option.getAttribute('data-value');
            const text = option.textContent.trim();
            
            hiddenInput.value = value;
            buttonText.textContent = text;
            buttonText.classList.remove('custom-dropdown-placeholder');
            
            optionsContainer.querySelectorAll('.custom-dropdown-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            option.classList.add('selected');
            
            closeDropdown();
            
            if (onChange) {
                onChange(value);
            }
        }
    });

    document.addEventListener('click', function(e) {
        if (!dropdown.contains(e.target)) {
            closeDropdown();
        }
    });
}

function populateCounties() {
    const optionsContainer = document.getElementById('county-options');
    const buttonText = document.getElementById('county-button').querySelector('span');
    const hiddenInput = document.getElementById('county');
    
    if (!optionsContainer) return;
    
    optionsContainer.innerHTML = '';
    buttonText.textContent = 'Select your county...';
    buttonText.classList.add('custom-dropdown-placeholder');
    hiddenInput.value = '';
    
    floridaCounties.forEach(county => {
        const option = document.createElement('div');
        option.className = 'custom-dropdown-option';
        option.setAttribute('data-value', county.code);
        option.setAttribute('role', 'option');
        option.textContent = `${county.name} (${county.code})`;
        optionsContainer.appendChild(option);
    });
}

function populateMunicipalities() {
    const optionsContainer = document.getElementById('municipality-options');
    const buttonText = document.getElementById('municipality-button').querySelector('span');
    const hiddenInput = document.getElementById('municipality');
    
    if (!optionsContainer) return;
    
    optionsContainer.innerHTML = '';
    buttonText.textContent = 'Select your municipality...';
    buttonText.classList.add('custom-dropdown-placeholder');
    hiddenInput.value = '';
    
    floridaMunicipalities.forEach(municipality => {
        const option = document.createElement('div');
        option.className = 'custom-dropdown-option';
        option.setAttribute('data-value', municipality);
        option.setAttribute('role', 'option');
        option.textContent = municipality;
        optionsContainer.appendChild(option);
    });
}

function handleEntityTypeChange() {
    const entityType = document.getElementById('entity-type').value;
    const state = document.getElementById('state').value;
    const countyGroup = document.getElementById('county-group');
    const municipalityGroup = document.getElementById('municipality-group');
    const countyHiddenInput = document.getElementById('county');
    const municipalityHiddenInput = document.getElementById('municipality');
    
    countyGroup.style.display = 'none';
    municipalityGroup.style.display = 'none';
    countyHiddenInput.removeAttribute('required');
    municipalityHiddenInput.removeAttribute('required');
    
    if (state && countyEntities.includes(entityType)) {
        countyGroup.style.display = 'block';
        countyHiddenInput.setAttribute('required', 'required');
        populateCounties();
    } else if (state && municipalityEntities.includes(entityType)) {
        municipalityGroup.style.display = 'block';
        municipalityHiddenInput.setAttribute('required', 'required');
        populateMunicipalities();
    }
}

function showSection(sectionId) {
    document.getElementById('region-selection-section').style.display = 'none';
    document.getElementById('loading-section').style.display = 'none';
    document.getElementById('credentials-section').style.display = 'none';
    document.getElementById('no-account-section').style.display = 'none';
    
    document.getElementById(sectionId).style.display = 'block';
}

function getRegionLabel() {
    const state = document.getElementById('state').value;
    const entityType = document.getElementById('entity-type').value;
    const county = document.getElementById('county').value;
    const municipality = document.getElementById('municipality').value;
    
    let region = 'Florida';
    
    if (countyEntities.includes(entityType) && county) {
        const countyObj = floridaCounties.find(c => c.code === county);
        region = countyObj ? `${countyObj.name} County` : region;
    } else if (municipalityEntities.includes(entityType) && municipality) {
        region = municipality;
    }
    
    const entityLabels = {
        'property-appraiser': 'Property Appraiser',
        'tax-collector': 'Tax Collector',
        'county-gov': 'County Government',
        'city-gov': 'City Government',
        'dor': 'Department of Revenue',
        'broker': 'Vacation Rental Broker',
        'owner': 'Property Owner'
    };
    
    return `${region} - ${entityLabels[entityType] || entityType}`;
}

async function checkAccountExists() {
    const state = document.getElementById('state').value;
    const entityType = document.getElementById('entity-type').value;
    const county = document.getElementById('county').value;
    const municipality = document.getElementById('municipality').value;
    
    if (!state || !entityType) {
        alert('Please select state and entity type');
        return false;
    }
    
    if (countyEntities.includes(entityType) && !county) {
        alert('Please select your county');
        return false;
    }
    
    if (municipalityEntities.includes(entityType) && !municipality) {
        alert('Please select your municipality');
        return false;
    }
    
    showSection('loading-section');
    
    try {
        let query = supabase
            .from('office_accounts')
            .select('*')
            .eq('state_code', state)
            .eq('entity_type', entityType)
            .eq('is_active', true);
        
        if (countyEntities.includes(entityType)) {
            query = query.eq('county_code', county).is('municipality_name', null);
        } else if (municipalityEntities.includes(entityType)) {
            query = query.eq('municipality_name', municipality).is('county_code', null);
        } else if (stateEntities.includes(entityType)) {
            query = query.is('county_code', null).is('municipality_name', null);
        }
        
        const { data, error } = await query.single();
        
        if (error) {
            if (error.code === 'PGRST116') {
                const regionLabel = getRegionLabel();
                document.getElementById('no-account-message').textContent = 
                    `No account exists under ${regionLabel}.`;
                showSection('no-account-section');
                return false;
            }
            throw error;
        }
        
        if (data) {
            currentAccount = data;
            showSection('credentials-section');
            document.getElementById('username').focus();
            return true;
        }
    } catch (error) {
        console.error('Error checking account:', error);
        alert('An error occurred while checking for your account. Please try again.');
        showSection('region-selection-section');
        return false;
    }
}

function handleBack() {
    currentAccount = null;
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    showSection('region-selection-section');
}

function handleLogin(e) {
    e.preventDefault();
    
    if (!currentAccount) {
        alert('No account loaded. Please go back and try again.');
        return;
    }
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (!username || !password) {
        alert('Please enter username and password');
        return;
    }
    
    if (username !== currentAccount.username) {
        alert('Invalid username');
        return;
    }
    
    if (password !== currentAccount.password_hash) {
        alert('Invalid password');
        return;
    }
    
    const state = document.getElementById('state').value;
    const entityType = document.getElementById('entity-type').value;
    const county = document.getElementById('county').value;
    const municipality = document.getElementById('municipality').value;
    
    sessionStorage.setItem('username', username);
    sessionStorage.setItem('state', state);
    sessionStorage.setItem('entityType', entityType);
    sessionStorage.setItem('officeName', currentAccount.office_name);
    
    if (countyEntities.includes(entityType)) {
        sessionStorage.setItem('county', county);
        const countyName = floridaCounties.find(c => c.code === county)?.name || county;
        sessionStorage.setItem('countyName', countyName);
    }
    
    if (municipalityEntities.includes(entityType)) {
        sessionStorage.setItem('municipality', municipality);
    }
    
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
}

function initializeLogin() {
    console.log('Initializing login page...');
    
    initSupabase();
    
    initCustomDropdown('state-dropdown', 'state', function(value) {
        console.log('State changed to:', value);
        handleEntityTypeChange();
    });
    
    initCustomDropdown('entity-type-dropdown', 'entity-type', function(value) {
        console.log('Entity type changed to:', value);
        handleEntityTypeChange();
    });
    
    initCustomDropdown('county-dropdown', 'county');
    initCustomDropdown('municipality-dropdown', 'municipality');
    
    const nextBtn = document.getElementById('next-btn');
    if (nextBtn) {
        nextBtn.addEventListener('click', checkAccountExists);
    }
    
    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', handleBack);
    }
    
    const backBtnNoAccount = document.getElementById('back-btn-no-account');
    if (backBtnNoAccount) {
        backBtnNoAccount.addEventListener('click', handleBack);
    }
    
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    console.log('Login initialization complete');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeLogin);
} else {
    initializeLogin();
}
