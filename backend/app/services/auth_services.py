# app/services/auth_service.py

import jwt

SUPABASE_JWT_SECRET = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0cGtyb2xreXZnY2xicmlqbHp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjU5MDY3MiwiZXhwIjoyMDY4MTY2NjcyfQ.jj9hY5MV4-LODKRCQGu8brBdwG32owg29ZGa97kWTW4"

async def decode_jwt_payload(token: str):
    payload = jwt.decode(token, SUPABASE_JWT_SECRET, algorithms=["HS256"])
    return payload