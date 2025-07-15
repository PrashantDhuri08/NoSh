# app/services/storage.py
import os
import requests
from datetime import timedelta
from api.auth import supabase

SUPABASE_URL = "https://ztpkrolkyvgclbrijlzu.supabase.co"
SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0cGtyb2xreXZnY2xicmlqbHp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjU5MDY3MiwiZXhwIjoyMDY4MTY2NjcyfQ.jj9hY5MV4-LODKRCQGu8brBdwG32owg29ZGa97kWTW4"
STORAGE_BUCKET = "nosh"

HEADERS = {
    "apikey": SUPABASE_SERVICE_ROLE_KEY,
    "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
    "Content-Type": "application/json"
}

def generate_signed_upload_url(file_path: str, expires_in_sec: int = 3600) -> str:
    """Generate presigned upload URL (PUT) for a file path in Supabase Storage."""
    url = f"{SUPABASE_URL}/storage/v1/object/sign/{STORAGE_BUCKET}/{file_path}"
    res = requests.post(url, headers=HEADERS, json={"expiresIn": expires_in_sec})
    if res.status_code != 200:
        raise Exception(f"Failed to generate upload URL: {res.text}")
    return res.json().get("signedURL")

def generate_signed_download_url(file_path: str, expires_in_sec: int = 3600) -> str:
    """Generate presigned download URL for a file in Supabase Storage."""
    url = f"{SUPABASE_URL}/storage/v1/object/sign/{STORAGE_BUCKET}/{file_path}"
    res = requests.post(url, headers=HEADERS, json={"expiresIn": expires_in_sec})
    if res.status_code != 200:
        raise Exception(f"Failed to generate download URL: {res.text}")
    return f"{SUPABASE_URL}/storage/v1/{res.json().get('signedURL')}"


with open("C:/Users/prash/Downloads/PCE_Prashant.pdf", "rb") as f:
    response = supabase.storage.from_("nosh").upload(
        path="PDF/PCEPrash.pdf",  # path inside the bucket
        file=f,
        file_options={
            "content-type": "application/pdf",  # adjust MIME type
            "cache-control": "3600",
            "upsert": "false"  # set to "true" to overwrite if file exists
        }
    )

print(response)

# # generate_signed_upload_url("Docx/Exp10py.docx")
# print(generate_signed_download_url("Docx/Exp10py.docx"))