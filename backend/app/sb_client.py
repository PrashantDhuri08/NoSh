from supabase import create_client
import os

from dotenv import load_dotenv
load_dotenv()

key = os.getenv("SUPABASE_KEY")
url = os.getenv("SUPABASE_PURL")

supabase = create_client(url, key)

def get_supabase_client():
    """
    Returns a Supabase client instance.
    """
    return supabase

