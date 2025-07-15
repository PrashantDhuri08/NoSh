from supabase import create_client
import os

import dotenv
url = "https://ztpkrolkyvgclbrijlzu.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0cGtyb2xreXZnY2xicmlqbHp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjU5MDY3MiwiZXhwIjoyMDY4MTY2NjcyfQ.jj9hY5MV4-LODKRCQGu8brBdwG32owg29ZGa97kWTW4"
supabase = create_client(url, key)

# url= os.environ.get("SUPABASE_URL")
# key= os.environ.get("SUPABASE_SERVICE_ROLEKEY")
# supabase = create_client(url, key)

# response = supabase.auth.sign_up({
#     "email": "pdmamba08@gmail.com",
#     "password": "Diogenes@123"
# })
# print(response)

bucket = supabase.storage.from_("nosh")
# buckets = supabase.storage.list_buckets()
response = bucket.download("Docx/Exp10py.docx")

with open("Exp10py.docx", "wb") as f:
    f.write(response)

# print(buckets)


# from fastapi import FastAPI
# from fastapi.responses import RedirectResponse
# from supabase import create_client

# SUPABASE_URL = "https://your-project-id.supabase.co"
# SUPABASE_KEY = "your-anon-key"
# supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# app = FastAPI()

# @app.get("/signup")
# def signup_with_google():
#     response = supabase.auth.sign_in_with_oauth({
#         "provider": "google",
#         "options": {
#             "redirect_to": "http://localhost:8000/auth/callback"
#         }
#     })
#     return RedirectResponse(response["url"])

# @app.get("/auth/callback")
# def auth_callback():
#     return {"message": "Google signup successful!"}