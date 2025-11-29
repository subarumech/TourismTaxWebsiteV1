import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

def get_supabase_client() -> Client:
    url = os.getenv('SUPABASE_URL')
    key = os.getenv('SUPABASE_ANON_KEY')
    
    if not url or not key:
        raise ValueError("SUPABASE_URL and SUPABASE_ANON_KEY must be set in .env file")
    
    return create_client(url, key)

def batch_insert(client: Client, table_name: str, records: list, batch_size: int = 1000):
    total = len(records)
    inserted = 0
    errors = []
    
    for i in range(0, total, batch_size):
        batch = records[i:i + batch_size]
        try:
            response = client.table(table_name).insert(batch).execute()
            inserted += len(batch)
            print(f"Inserted {inserted}/{total} records into {table_name}")
        except Exception as e:
            error_msg = f"Error inserting batch {i//batch_size + 1} into {table_name}: {str(e)}"
            print(error_msg)
            errors.append(error_msg)
    
    return inserted, errors

def truncate_table(client: Client, table_name: str):
    try:
        client.table(table_name).delete().neq('id', 0).execute()
        print(f"Truncated table {table_name}")
    except Exception as e:
        print(f"Error truncating {table_name}: {str(e)}")
        raise

