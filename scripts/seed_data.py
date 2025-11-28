#!/usr/bin/env python3
"""
Seed script that fetches real Sarasota County addresses from Google Places API
and generates fake TDT data for testing purposes.

Falls back to realistic hardcoded addresses if Google API is unavailable.
"""

import os
import sys
import random
from datetime import datetime, timedelta

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import requests
from dotenv import load_dotenv

load_dotenv()

GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')

# Sarasota County areas known for vacation rentals
SEARCH_AREAS = [
    {'name': 'Siesta Key', 'lat': 27.2678, 'lng': -82.5462},
    {'name': 'Longboat Key', 'lat': 27.4103, 'lng': -82.6584},
    {'name': 'Lido Key', 'lat': 27.3156, 'lng': -82.5773},
    {'name': 'Downtown Sarasota', 'lat': 27.3364, 'lng': -82.5307},
    {'name': 'Venice', 'lat': 27.0998, 'lng': -82.4543},
    {'name': 'North Port', 'lat': 27.0442, 'lng': -82.2359},
    {'name': 'Osprey', 'lat': 27.1964, 'lng': -82.4920},
    {'name': 'Nokomis', 'lat': 27.1192, 'lng': -82.4437},
]

# Realistic Sarasota County addresses for fallback
FALLBACK_ADDRESSES = [
    # Siesta Key
    {'address': '6200 Midnight Pass Rd', 'city': 'Siesta Key', 'zip': '34242', 'lat': 27.2456, 'lng': -82.5401},
    {'address': '5011 Ocean Blvd', 'city': 'Siesta Key', 'zip': '34242', 'lat': 27.2634, 'lng': -82.5489},
    {'address': '104 Beach Rd', 'city': 'Siesta Key', 'zip': '34242', 'lat': 27.2701, 'lng': -82.5512},
    {'address': '6800 Gulf of Mexico Dr', 'city': 'Siesta Key', 'zip': '34242', 'lat': 27.2389, 'lng': -82.5367},
    {'address': '5300 Avenida Del Mare', 'city': 'Siesta Key', 'zip': '34242', 'lat': 27.2578, 'lng': -82.5456},
    {'address': '1341 Point of Rocks Rd', 'city': 'Siesta Key', 'zip': '34242', 'lat': 27.2523, 'lng': -82.5434},
    {'address': '6300 Midnight Pass Rd Unit 7', 'city': 'Siesta Key', 'zip': '34242', 'lat': 27.2445, 'lng': -82.5398},
    {'address': '5050 Ocean Blvd Unit 101', 'city': 'Siesta Key', 'zip': '34242', 'lat': 27.2628, 'lng': -82.5491},
    
    # Longboat Key
    {'address': '3155 Gulf of Mexico Dr', 'city': 'Longboat Key', 'zip': '34228', 'lat': 27.3845, 'lng': -82.6478},
    {'address': '5055 Gulf of Mexico Dr', 'city': 'Longboat Key', 'zip': '34228', 'lat': 27.4012, 'lng': -82.6523},
    {'address': '210 Sands Point Rd', 'city': 'Longboat Key', 'zip': '34228', 'lat': 27.3934, 'lng': -82.6512},
    {'address': '4600 Gulf of Mexico Dr', 'city': 'Longboat Key', 'zip': '34228', 'lat': 27.3978, 'lng': -82.6501},
    {'address': '2295 Gulf of Mexico Dr', 'city': 'Longboat Key', 'zip': '34228', 'lat': 27.3756, 'lng': -82.6445},
    {'address': '3465 Gulf of Mexico Dr Unit 301', 'city': 'Longboat Key', 'zip': '34228', 'lat': 27.3878, 'lng': -82.6489},
    
    # Lido Key
    {'address': '1234 Benjamin Franklin Dr', 'city': 'Lido Key', 'zip': '34236', 'lat': 27.3145, 'lng': -82.5789},
    {'address': '1800 Benjamin Franklin Dr', 'city': 'Lido Key', 'zip': '34236', 'lat': 27.3098, 'lng': -82.5756},
    {'address': '700 Golden Gate Point', 'city': 'Lido Key', 'zip': '34236', 'lat': 27.3234, 'lng': -82.5678},
    {'address': '400 S Polk Dr', 'city': 'Lido Key', 'zip': '34236', 'lat': 27.3189, 'lng': -82.5734},
    {'address': '1701 Gulf of Mexico Dr', 'city': 'Lido Key', 'zip': '34236', 'lat': 27.3112, 'lng': -82.5767},
    
    # Downtown Sarasota
    {'address': '1350 Main St', 'city': 'Sarasota', 'zip': '34236', 'lat': 27.3362, 'lng': -82.5412},
    {'address': '111 S Pineapple Ave', 'city': 'Sarasota', 'zip': '34236', 'lat': 27.3345, 'lng': -82.5378},
    {'address': '1515 Ringling Blvd', 'city': 'Sarasota', 'zip': '34236', 'lat': 27.3378, 'lng': -82.5389},
    {'address': '800 N Tamiami Trail', 'city': 'Sarasota', 'zip': '34236', 'lat': 27.3423, 'lng': -82.5345},
    {'address': '35 Watergate Dr', 'city': 'Sarasota', 'zip': '34236', 'lat': 27.3289, 'lng': -82.5534},
    {'address': '988 Blvd of the Arts', 'city': 'Sarasota', 'zip': '34236', 'lat': 27.3398, 'lng': -82.5456},
    {'address': '545 Sanctuary Dr', 'city': 'Sarasota', 'zip': '34236', 'lat': 27.3267, 'lng': -82.5512},
    
    # Venice
    {'address': '455 W Venice Ave', 'city': 'Venice', 'zip': '34285', 'lat': 27.0987, 'lng': -82.4534},
    {'address': '101 The Esplanade N', 'city': 'Venice', 'zip': '34285', 'lat': 27.0945, 'lng': -82.4512},
    {'address': '700 Granada Ave', 'city': 'Venice', 'zip': '34285', 'lat': 27.0967, 'lng': -82.4489},
    {'address': '1025 Tarpon Center Dr', 'city': 'Venice', 'zip': '34285', 'lat': 27.0923, 'lng': -82.4567},
    {'address': '509 E Venice Ave', 'city': 'Venice', 'zip': '34285', 'lat': 27.0998, 'lng': -82.4478},
    {'address': '245 Harbor Dr S', 'city': 'Venice', 'zip': '34285', 'lat': 27.0912, 'lng': -82.4534},
    
    # North Port
    {'address': '5850 Biscayne Dr', 'city': 'North Port', 'zip': '34287', 'lat': 27.0456, 'lng': -82.2345},
    {'address': '1901 S Sumter Blvd', 'city': 'North Port', 'zip': '34287', 'lat': 27.0389, 'lng': -82.2289},
    {'address': '4200 Tamiami Trail', 'city': 'North Port', 'zip': '34287', 'lat': 27.0523, 'lng': -82.2412},
    {'address': '2050 Pan American Blvd', 'city': 'North Port', 'zip': '34287', 'lat': 27.0467, 'lng': -82.2356},
    {'address': '6100 Tuscola Blvd', 'city': 'North Port', 'zip': '34291', 'lat': 27.0234, 'lng': -82.2178},
    
    # Osprey
    {'address': '1845 Siesta Dr', 'city': 'Osprey', 'zip': '34229', 'lat': 27.1945, 'lng': -82.4923},
    {'address': '400 S Tamiami Trail', 'city': 'Osprey', 'zip': '34229', 'lat': 27.1989, 'lng': -82.4856},
    {'address': '850 Blackburn Point Rd', 'city': 'Osprey', 'zip': '34229', 'lat': 27.1912, 'lng': -82.4978},
    {'address': '1200 Bay Rd', 'city': 'Osprey', 'zip': '34229', 'lat': 27.1967, 'lng': -82.4934},
    
    # Nokomis
    {'address': '234 Casey Key Rd', 'city': 'Nokomis', 'zip': '34275', 'lat': 27.1156, 'lng': -82.4534},
    {'address': '101 Albee Rd', 'city': 'Nokomis', 'zip': '34275', 'lat': 27.1189, 'lng': -82.4478},
    {'address': '500 Lyons Bay Rd', 'city': 'Nokomis', 'zip': '34275', 'lat': 27.1123, 'lng': -82.4512},
    {'address': '789 Tamiami Trail', 'city': 'Nokomis', 'zip': '34275', 'lat': 27.1212, 'lng': -82.4423},
    {'address': '345 Bayshore Dr', 'city': 'Nokomis', 'zip': '34275', 'lat': 27.1145, 'lng': -82.4489},
]

# Dealers in the system
DEALERS = [
    {'name': 'Airbnb', 'type': 'platform'},
    {'name': 'VRBO', 'type': 'platform'},
    {'name': 'Booking.com', 'type': 'platform'},
    {'name': 'Evolve', 'type': 'platform'},
    {'name': 'HomeAway', 'type': 'platform'},
]


def fetch_places_nearby(lat, lng, radius=2000):
    """Fetch lodging/residential places near coordinates using Google Places API."""
    url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json'
    params = {
        'location': f'{lat},{lng}',
        'radius': radius,
        'type': 'lodging',
        'key': GOOGLE_API_KEY
    }
    
    response = requests.get(url, params=params)
    data = response.json()
    
    if data.get('status') != 'OK':
        print(f"API Error: {data.get('status')} - {data.get('error_message', 'Unknown error')}")
        return []
    
    return data.get('results', [])


def get_place_details(place_id):
    """Get detailed address info for a place."""
    url = 'https://maps.googleapis.com/maps/api/place/details/json'
    params = {
        'place_id': place_id,
        'fields': 'formatted_address,address_components,geometry',
        'key': GOOGLE_API_KEY
    }
    
    response = requests.get(url, params=params)
    data = response.json()
    
    if data.get('status') != 'OK':
        return None
    
    return data.get('result')


def parse_address_components(components):
    """Parse Google address components into our format."""
    result = {
        'street_number': '',
        'route': '',
        'city': '',
        'zip_code': ''
    }
    
    for comp in components:
        types = comp.get('types', [])
        if 'street_number' in types:
            result['street_number'] = comp.get('short_name', '')
        elif 'route' in types:
            result['route'] = comp.get('short_name', '')
        elif 'locality' in types:
            result['city'] = comp.get('short_name', '')
        elif 'postal_code' in types:
            result['zip_code'] = comp.get('short_name', '')
    
    return result


def generate_parcel_id():
    """Generate a realistic Sarasota County parcel ID."""
    return f"{random.randint(1000, 9999)}-{random.randint(10, 99)}-{random.randint(1000, 9999)}"


def generate_tdt_number(year=None):
    """Generate a TDT number."""
    if not year:
        year = random.choice([2022, 2023, 2024, 2025])
    return f"TDT-{year}-{random.randint(100000, 999999)}"


def assign_compliance_scenario(is_registered, has_payments, payment_correct):
    """
    Determine compliance scenario based on registration and payment status.
    1: Not registered, did not pay
    2: Not registered, but paid
    3: Registered, did not pay
    4: Registered, paid wrong amount
    """
    if not is_registered:
        return 2 if has_payments else 1
    else:
        if not has_payments:
            return 3
        elif not payment_correct:
            return 4
        else:
            return None  # Compliant


def pick_dealer(dealer_objects):
    """Pick a dealer with weighted distribution: 90% Airbnb/VRBO, 10% other/independent."""
    roll = random.random()
    if roll < 0.45:
        # Airbnb (45%)
        for d in dealer_objects:
            if d.name == 'Airbnb':
                return d.id
    elif roll < 0.90:
        # VRBO (45%)
        for d in dealer_objects:
            if d.name == 'VRBO':
                return d.id
    elif roll < 0.95:
        # Other platforms (5%) - Booking.com, Evolve, HomeAway
        others = [d for d in dealer_objects if d.name not in ('Airbnb', 'VRBO')]
        if others:
            return random.choice(others).id
    # Independent (5%)
    return None


def create_property_from_data(db, Property, TDTPayment, dealer_objects, addr_data):
    """Create a property and its payments from address data."""
    is_registered = random.random() > 0.3
    has_payments = random.random() > 0.25
    payment_correct = random.random() > 0.2
    
    scenario = assign_compliance_scenario(is_registered, has_payments, payment_correct)
    
    prop = Property(
        address=addr_data['address'],
        city=addr_data['city'],
        zip_code=addr_data['zip'],
        lat=addr_data.get('lat'),
        lng=addr_data.get('lng'),
        google_place_id=addr_data.get('place_id'),
        parcel_id=generate_parcel_id(),
        is_registered=is_registered,
        tdt_number=generate_tdt_number() if is_registered else None,
        registration_date=datetime.now() - timedelta(days=random.randint(30, 730)) if is_registered else None,
        homestead_status=random.random() > 0.7,
        zoning_type=random.choice(['residential', 'commercial', 'mixed']),
        compliance_scenario=scenario
    )
    
    db.session.add(prop)
    db.session.flush()
    
    if has_payments:
        num_payments = random.randint(1, 8)
        for i in range(num_payments):
            period_start = datetime.now().date() - timedelta(days=30 * (i + 1))
            period_end = period_start + timedelta(days=30)
            
            expected = random.uniform(50, 500)
            if payment_correct:
                actual = expected
            else:
                actual = expected * random.uniform(0.5, 1.5)
            
            payment = TDTPayment(
                property_id=prop.id,
                dealer_id=pick_dealer(dealer_objects),
                amount=round(actual, 2),
                expected_amount=round(expected, 2),
                period_start=period_start,
                period_end=period_end,
                payment_date=datetime.now() - timedelta(days=random.randint(1, 30)),
                verified=random.random() > 0.4
            )
            db.session.add(payment)
    
    return prop


def seed_database():
    """Main seeding function."""
    from app import create_app, db
    from app.models import Property, Dealer, TDTPayment
    
    app = create_app()
    
    with app.app_context():
        print("Clearing existing data...")
        TDTPayment.query.delete()
        Property.query.delete()
        Dealer.query.delete()
        db.session.commit()
        
        print("Creating dealers...")
        dealer_objects = []
        for dealer_data in DEALERS:
            dealer = Dealer(
                name=dealer_data['name'],
                dealer_type=dealer_data['type'],
                contact_email=f"support@{dealer_data['name'].lower().replace('.', '')}.com"
            )
            db.session.add(dealer)
            dealer_objects.append(dealer)
        
        db.session.commit()
        print(f"Created {len(dealer_objects)} dealers")
        
        # Try Google API first
        print("\nFetching properties from Google Places API...")
        all_places = []
        api_works = False
        
        for area in SEARCH_AREAS:
            print(f"  Searching {area['name']}...")
            places = fetch_places_nearby(area['lat'], area['lng'])
            if places:
                api_works = True
                for place in places[:5]:
                    place['area'] = area['name']
                    all_places.append(place)
        
        properties_created = 0
        
        if api_works and all_places:
            print(f"\nGoogle API working. Found {len(all_places)} places. Processing...")
            
            for place in all_places:
                details = get_place_details(place['place_id'])
                if not details:
                    continue
                
                addr_parts = parse_address_components(details.get('address_components', []))
                
                street_address = f"{addr_parts['street_number']} {addr_parts['route']}".strip()
                if not street_address:
                    street_address = place.get('name', 'Unknown Address')
                
                geometry = details.get('geometry', {}).get('location', {})
                
                addr_data = {
                    'address': street_address,
                    'city': addr_parts['city'] or place.get('area', 'Sarasota'),
                    'zip': addr_parts['zip_code'] or '34236',
                    'lat': geometry.get('lat'),
                    'lng': geometry.get('lng'),
                    'place_id': place['place_id']
                }
                
                prop = create_property_from_data(db, Property, TDTPayment, dealer_objects, addr_data)
                properties_created += 1
                print(f"  Created: {prop.address}, {prop.city} (Scenario: {prop.compliance_scenario or 'Compliant'})")
        
        else:
            print("\nGoogle API unavailable. Using fallback addresses...")
            print("(Enable billing on your Google Cloud project to use real-time data)")
            print()
            
            for addr_data in FALLBACK_ADDRESSES:
                prop = create_property_from_data(db, Property, TDTPayment, dealer_objects, addr_data)
                properties_created += 1
                print(f"  Created: {prop.address}, {prop.city} (Scenario: {prop.compliance_scenario or 'Compliant'})")
        
        db.session.commit()
        
        print(f"\n{'='*50}")
        print("SEEDING COMPLETE")
        print(f"{'='*50}")
        print(f"Properties created: {properties_created}")
        print(f"Dealers created: {len(dealer_objects)}")
        
        for i in range(1, 5):
            count = Property.query.filter_by(compliance_scenario=i).count()
            print(f"Scenario {i}: {count} properties")
        
        compliant = Property.query.filter_by(compliance_scenario=None).count()
        print(f"Compliant: {compliant} properties")


if __name__ == '__main__':
    seed_database()
