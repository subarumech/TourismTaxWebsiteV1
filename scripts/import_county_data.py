import os
import sys
import argparse
import pandas as pd
from datetime import datetime
from pathlib import Path
from supabase_client import get_supabase_client, batch_insert

DATA_DIR = Path(__file__).parent.parent / "data" / "Sarasota County" / "SCPA_Detailed_Data"

def clean_value(value):
    if pd.isna(value) or value == '' or value == '""':
        return None
    if isinstance(value, str):
        value = value.strip().strip('"')
        if value == '':
            return None
    return value

def parse_date(date_str):
    if not date_str or pd.isna(date_str):
        return None
    try:
        if isinstance(date_str, str):
            date_str = date_str.strip().strip('"')
            if date_str:
                return pd.to_datetime(date_str).isoformat()
    except:
        pass
    return None

def read_csv_with_fallback(file_path):
    """Try reading CSV with multiple encodings"""
    encodings = ['utf-8', 'windows-1252', 'latin-1', 'iso-8859-1']
    
    for encoding in encodings:
        try:
            print(f"Trying {encoding} encoding...")
            df = pd.read_csv(file_path, dtype=str, encoding=encoding, low_memory=False)
            print(f"Successfully read with {encoding} encoding")
            return df
        except UnicodeDecodeError:
            continue
        except Exception as e:
            print(f"Error with {encoding}: {e}")
            continue
    
    raise ValueError(f"Could not read {file_path} with any supported encoding")

def import_properties(client, dry_run=False):
    print("\n=== Importing Properties ===")
    file_path = DATA_DIR / "PropertyOwnerLegal.txt"
    
    if not file_path.exists():
        print(f"File not found: {file_path}")
        return
    
    print(f"Reading {file_path}...")
    df = read_csv_with_fallback(file_path)
    print(f"Found {len(df)} records")
    
    records = []
    for _, row in df.iterrows():
        record = {
            'parcel_id': clean_value(row.get('ParcelID')),
            'user_account': clean_value(row.get('UserAccount')),
            'owner_name': clean_value(row.get('name1')),
            'owner_name2': clean_value(row.get('name2')),
            'owner_name3': clean_value(row.get('name3')),
            'owner_street1': clean_value(row.get('CuOStreet1')),
            'owner_street2': clean_value(row.get('CuOStreet2')),
            'owner_city': clean_value(row.get('CuOCity')),
            'owner_state': clean_value(row.get('CuOState')),
            'owner_postal': clean_value(row.get('CuOPostal')),
            'owner_county_code': clean_value(row.get('CuOCountyCode')),
            'street_number': clean_value(row.get('StreetNumber')),
            'loc_description': clean_value(row.get('LOCDescription')),
            'loc_unit': clean_value(row.get('LocUnit')),
            'loc_dir_prefix': clean_value(row.get('locdirprefix')),
            'loc_dir_suffix': clean_value(row.get('locdirsuffix')),
            'city': clean_value(row.get('LocCity')) or 'Sarasota',
            'loc_state': clean_value(row.get('LocState')),
            'zip_code': clean_value(row.get('LocZip')) or '00000',
            'land_use_code': clean_value(row.get('LUC')),
            'neighborhood_code': clean_value(row.get('NBC')),
            'location_state': clean_value(row.get('LocationState')),
            'prior_id1': clean_value(row.get('PriorID1a')),
            'prior_id2': clean_value(row.get('PriorID2a')),
            'prior_id3': clean_value(row.get('PriorID3a')),
            'census': clean_value(row.get('Census')),
            'utilities1': clean_value(row.get('Utilities1')),
            'utilities2': clean_value(row.get('Utilities2')),
            'gulf_bay': clean_value(row.get('GulfBay')),
            'description': clean_value(row.get('Description')),
            'legal_description1': clean_value(row.get('LegalDescription1')),
            'legal_description2': clean_value(row.get('LegalDescription2')),
            'legal_description3': clean_value(row.get('LegalDescription3')),
            'legal_description4': clean_value(row.get('LegalDescription4')),
            'total_land': clean_value(row.get('TotalLand')),
            'land_unit_type': clean_value(row.get('LandUnitType')),
            'zoning1': clean_value(row.get('Zoning1')),
            'zoning2': clean_value(row.get('Zoning2')),
            'zoning3': clean_value(row.get('Zoning3')),
            'property_status': clean_value(row.get('status')),
        }
        
        street_num = clean_value(row.get('StreetNumber')) or '0'
        loc_desc = clean_value(row.get('LOCDescription')) or ''
        record['address'] = f"{street_num} {loc_desc}".strip()
        
        if record['parcel_id']:
            records.append(record)
    
    print(f"Prepared {len(records)} valid records")
    
    if not dry_run:
        inserted, errors = batch_insert(client, 'properties', records)
        print(f"Successfully inserted {inserted} properties")
        if errors:
            print(f"Encountered {len(errors)} errors")
    else:
        print("DRY RUN: Would have inserted records")
        print("Sample record:", records[0] if records else None)

def import_sales(client, dry_run=False):
    print("\n=== Importing Sales ===")
    file_path = DATA_DIR / "Sales.txt"
    
    if not file_path.exists():
        print(f"File not found: {file_path}")
        return
    
    print(f"Reading {file_path}...")
    df = read_csv_with_fallback(file_path)
    print(f"Found {len(df)} records")
    
    records = []
    for _, row in df.iterrows():
        record = {
            'parcel_id': clean_value(row.get('parcelid')),
            'sale_date': parse_date(row.get('saledate')),
            'sequence': clean_value(row.get('sequence')),
            'sale_price': clean_value(row.get('saleprice')),
            'legal_reference': clean_value(row.get('legalreference')),
            'book': clean_value(row.get('book')),
            'page': clean_value(row.get('page')),
            'nal_code': clean_value(row.get('nalcode')),
            'deed_type': clean_value(row.get('deedtype')),
            'recording_date': parse_date(row.get('recordingdate')),
            'doc_stamps': clean_value(row.get('docstamps')),
        }
        
        if record['parcel_id']:
            records.append(record)
    
    print(f"Prepared {len(records)} valid records")
    
    if not dry_run:
        inserted, errors = batch_insert(client, 'sales', records)
        print(f"Successfully inserted {inserted} sales records")
        if errors:
            print(f"Encountered {len(errors)} errors")
    else:
        print("DRY RUN: Would have inserted records")
        print("Sample record:", records[0] if records else None)

def import_buildings(client, dry_run=False):
    print("\n=== Importing Buildings ===")
    file_path = DATA_DIR / "Building.txt"
    
    if not file_path.exists():
        print(f"File not found: {file_path}")
        return
    
    print(f"Reading {file_path}...")
    df = read_csv_with_fallback(file_path)
    print(f"Found {len(df)} records")
    
    records = []
    for _, row in df.iterrows():
        record = {
            'parcel_id': clean_value(row.get('parcelid')),
            'card_number': clean_value(row.get('cardnumber')),
            'avg_height_floor': clean_value(row.get('avghtfl')),
            'prime_int_wall': clean_value(row.get('primeintwall')),
            'sec_int_wall': clean_value(row.get('secintwall')),
            'sec_int_wall_percent': clean_value(row.get('secintwallpercent')),
            'primary_floors': clean_value(row.get('primaryfloors')),
            'sec_floors': clean_value(row.get('secfloors')),
            'sec_floors_percent': clean_value(row.get('secfloorspercent')),
            'insulation': clean_value(row.get('insulation')),
            'heat_type': clean_value(row.get('heattype')),
            'percent_air_conditioned': clean_value(row.get('percentairconditioned')),
            'ext_type': clean_value(row.get('exttype')),
            'story_height': clean_value(row.get('storyhgt')),
            'foundation': clean_value(row.get('foundation')),
            'units': clean_value(row.get('units')),
            'frame': clean_value(row.get('frame')),
            'prime_wall': clean_value(row.get('primewall')),
            'sec_wall': clean_value(row.get('secwall')),
            'sec_wall_percent': clean_value(row.get('secwallpercent')),
            'roof_struct': clean_value(row.get('roofstruct')),
            'roof_cover': clean_value(row.get('roofcover')),
            'view_type': clean_value(row.get('view_')),
            'grade': clean_value(row.get('grade')),
            'year_built': clean_value(row.get('yearblt')),
            'eff_year_built': clean_value(row.get('effyearblt')),
            'condo_floor': clean_value(row.get('condofloor')),
            'condo_complex_name': clean_value(row.get('condocomplexname')),
            'full_bath': clean_value(row.get('fullbath')),
            'full_bath_rating': clean_value(row.get('fullbathrating')),
            'half_bath': clean_value(row.get('halfbath')),
            'half_bath_rating': clean_value(row.get('halfbathrating')),
            'other_fixtures': clean_value(row.get('otherfixtures')),
            'other_fixtures_rating': clean_value(row.get('otherfixturesrating')),
            'fireplaces': clean_value(row.get('fireplaces')),
            'fireplace_rating': clean_value(row.get('fireplacerating')),
            'parking_spaces': clean_value(row.get('parkingspaces')),
            'percent_sprinkled': clean_value(row.get('percentsprinkled')),
        }
        
        if record['parcel_id']:
            records.append(record)
    
    print(f"Prepared {len(records)} valid records")
    
    if not dry_run:
        inserted, errors = batch_insert(client, 'buildings', records)
        print(f"Successfully inserted {inserted} building records")
        if errors:
            print(f"Encountered {len(errors)} errors")
    else:
        print("DRY RUN: Would have inserted records")
        print("Sample record:", records[0] if records else None)

def import_land(client, dry_run=False):
    print("\n=== Importing Land ===")
    file_path = DATA_DIR / "Land.txt"
    
    if not file_path.exists():
        print(f"File not found: {file_path}")
        return
    
    print(f"Reading {file_path}...")
    df = read_csv_with_fallback(file_path)
    print(f"Found {len(df)} records")
    
    records = []
    for _, row in df.iterrows():
        record = {
            'parcel_id': clean_value(row.get('parcelid')),
            'seq_number': clean_value(row.get('seeqnumber')),
            'line_type': clean_value(row.get('linetype')),
            'num_of_units': clean_value(row.get('numofunits')),
            'unit_type': clean_value(row.get('unittype')),
            'land_type': clean_value(row.get('landtype')),
            'neigh_mod': clean_value(row.get('neighmod')),
        }
        
        if record['parcel_id']:
            records.append(record)
    
    print(f"Prepared {len(records)} valid records")
    
    if not dry_run:
        inserted, errors = batch_insert(client, 'land', records)
        print(f"Successfully inserted {inserted} land records")
        if errors:
            print(f"Encountered {len(errors)} errors")
    else:
        print("DRY RUN: Would have inserted records")
        print("Sample record:", records[0] if records else None)

def import_values(client, dry_run=False):
    print("\n=== Importing Property Values ===")
    file_path = DATA_DIR / "Values.txt"
    
    if not file_path.exists():
        print(f"File not found: {file_path}")
        return
    
    print(f"Reading {file_path}...")
    df = read_csv_with_fallback(file_path)
    print(f"Found {len(df)} records")
    
    records = []
    for _, row in df.iterrows():
        record = {
            'parcel_id': clean_value(row.get('ParcelID')),
            'total_value': clean_value(row.get('TotalValue')),
            'land_value': clean_value(row.get('Land')),
            'building_value': clean_value(row.get('Building')),
            'sfyi_value': clean_value(row.get('SFYI')),
            'assessed_value': clean_value(row.get('AssessedValue')),
            'taxable_value': clean_value(row.get('TaxableValue')),
            'deletions': clean_value(row.get('Deletions')),
            'new_const': clean_value(row.get('NewConst')),
            'new_land': clean_value(row.get('NewLand')),
            'ag_credit': clean_value(row.get('AgCredit')),
        }
        
        if record['parcel_id']:
            records.append(record)
    
    print(f"Prepared {len(records)} valid records")
    
    if not dry_run:
        inserted, errors = batch_insert(client, 'property_values', records)
        print(f"Successfully inserted {inserted} property value records")
        if errors:
            print(f"Encountered {len(errors)} errors")
    else:
        print("DRY RUN: Would have inserted records")
        print("Sample record:", records[0] if records else None)

def import_exemptions(client, dry_run=False):
    print("\n=== Importing Exemptions ===")
    file_path = DATA_DIR / "Exemptions.txt"
    
    if not file_path.exists():
        print(f"File not found: {file_path}")
        return
    
    print(f"Reading {file_path}...")
    df = read_csv_with_fallback(file_path)
    print(f"Found {len(df)} records")
    
    records = []
    for _, row in df.iterrows():
        record = {
            'parcel_id': clean_value(row.get('parcelid')),
            'exemption_code': clean_value(row.get('exemptioncode')),
            'amount_off_total_assessment': clean_value(row.get('amountofftotalassessment')),
            'app_code': clean_value(row.get('appcode')),
        }
        
        if record['parcel_id']:
            records.append(record)
    
    print(f"Prepared {len(records)} valid records")
    
    if not dry_run:
        inserted, errors = batch_insert(client, 'exemptions', records)
        print(f"Successfully inserted {inserted} exemption records")
        if errors:
            print(f"Encountered {len(errors)} errors")
    else:
        print("DRY RUN: Would have inserted records")
        print("Sample record:", records[0] if records else None)

def import_lookups(client, dry_run=False):
    print("\n=== Importing Lookup Tables ===")
    
    lookup_files = {
        'lookup_land_use_codes': 'LookupLandUseCodes.txt',
        'lookup_deed_types': 'LookupDeedType.txt',
        'lookup_neighborhood_codes': 'LookupNeighborhoodCode.txt',
        'lookup_exemption_codes': 'LookupExemptionCode.txt',
    }
    
    for table_name, file_name in lookup_files.items():
        file_path = DATA_DIR / file_name
        
        if not file_path.exists():
            print(f"File not found: {file_path}")
            continue
        
        print(f"\nReading {file_name}...")
        df = read_csv_with_fallback(file_path)
        print(f"Found {len(df)} records")
        
        records = []
        for _, row in df.iterrows():
            record = {
                'code': clean_value(row.get('Code')),
                'description': clean_value(row.get('Description')),
            }
            
            if record['code']:
                records.append(record)
        
        print(f"Prepared {len(records)} valid records for {table_name}")
        
        if not dry_run:
            inserted, errors = batch_insert(client, table_name, records, batch_size=100)
            print(f"Successfully inserted {inserted} records into {table_name}")
            if errors:
                print(f"Encountered {len(errors)} errors")
        else:
            print("DRY RUN: Would have inserted records")

def main():
    parser = argparse.ArgumentParser(description='Import Sarasota County property data to Supabase')
    parser.add_argument('--table', type=str, help='Specific table to import (properties, sales, buildings, land, values, exemptions, lookups)')
    parser.add_argument('--all', action='store_true', help='Import all tables')
    parser.add_argument('--dry-run', action='store_true', help='Run without actually inserting data')
    
    args = parser.parse_args()
    
    if not args.all and not args.table:
        parser.print_help()
        print("\nPlease specify --all or --table <table_name>")
        sys.exit(1)
    
    print("Connecting to Supabase...")
    try:
        client = get_supabase_client()
        print("Connected successfully!")
    except Exception as e:
        print(f"Error connecting to Supabase: {e}")
        sys.exit(1)
    
    if args.dry_run:
        print("\n*** DRY RUN MODE - No data will be inserted ***\n")
    
    start_time = datetime.now()
    
    if args.all:
        import_lookups(client, args.dry_run)
        import_properties(client, args.dry_run)
        import_sales(client, args.dry_run)
        import_buildings(client, args.dry_run)
        import_land(client, args.dry_run)
        import_values(client, args.dry_run)
        import_exemptions(client, args.dry_run)
    elif args.table:
        table_map = {
            'properties': import_properties,
            'sales': import_sales,
            'buildings': import_buildings,
            'land': import_land,
            'values': import_values,
            'exemptions': import_exemptions,
            'lookups': import_lookups,
        }
        
        if args.table in table_map:
            table_map[args.table](client, args.dry_run)
        else:
            print(f"Unknown table: {args.table}")
            print(f"Available tables: {', '.join(table_map.keys())}")
            sys.exit(1)
    
    end_time = datetime.now()
    duration = end_time - start_time
    print(f"\n=== Import completed in {duration} ===")

if __name__ == '__main__':
    main()

