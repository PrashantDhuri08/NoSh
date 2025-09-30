# from supabase import create_client
# import os

# from dotenv import load_dotenv
# load_dotenv()

# key = os.getenv("SUPABASE_KEY")
# url = os.getenv("SUPABASE_PURL")

# supabase = create_client(url, key)

# def get_supabase_client():
#     """
#     Returns a Supabase client instance.
#     """
#     return supabase



# sb_client.py
from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_PURL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_KEY")  # Make sure this is your anon/public key, not service key

def get_supabase_client(access_token: str = None):
    """
    Returns a Supabase client instance.
    If access_token is provided, attach it so RLS works with the logged-in user.
    """
    client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
    if access_token:
        # attach user session token so queries run under that user's context
        client.postgrest.auth(access_token)
    return client
