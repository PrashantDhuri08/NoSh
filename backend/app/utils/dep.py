from jose import jwt
import requests

def get_supabase_jwks():
    jwks_url = "https://<your-project-ref>.supabase.co/auth/v1/keys"
    res = requests.get(jwks_url)
    res.raise_for_status()
    return res.json()["keys"]

def validate_token(token: str):
    jwks = get_supabase_jwks()
    header = jwt.get_unverified_header(token)
    key = next((k for k in jwks if k["kid"] == header["kid"]), None)

    if not key:
        raise Exception("Public key not found.")

    return jwt.decode(
        token,
        key,
        algorithms=["RS256"],
        options={"verify_aud": False}
    )