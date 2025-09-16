from fastapi import APIRouter, HTTPException, Depends, Request, Header
from fastapi.responses import JSONResponse, RedirectResponse
from pydantic import BaseModel
from gotrue.errors import AuthApiError
from sb_client import get_supabase_client

from urllib.parse import urlencode
from functools import lru_cache
from dotenv import load_dotenv
import os
import bcrypt

load_dotenv()

router = APIRouter()
supabase = get_supabase_client()

SUPABASE_URL = os.getenv("SUPABASE_PURL")
GOOGLE_REDIRECT_URL = "http://localhost:8000/auth/callback"
### CONFIGS
# GOOGLE_REDIRECT_URL = "http://localhost:8000/auth/callback"
FRONTEND_REDIRECT = "http://localhost:5173/dashboard"

# --- Models ---
class SignUpRequest(BaseModel):
    email: str
    password: str


# --- Utility: Hash password ---
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


# --- Dependency to get current user from cookies ---
async def get_current_user(request: Request):
    access_token = request.cookies.get("access_token")
    if not access_token:
        raise HTTPException(status_code=401, detail="Not logged in")
    try:
        user = supabase.auth.get_user(access_token).user
        if not user:
            raise HTTPException(status_code=401, detail="Invalid session")
        return user
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token or session expired")


# --- Sign up (with user table sync) ---
@router.post("/signup")
async def signup(payload: SignUpRequest):
    response = supabase.auth.sign_up({
        "email": payload.email,
        "password": payload.password,
    })
    if response.user is None:
        raise HTTPException(status_code=400, detail="Sign-up failed")

    auth_uuid = response.user.id
    email = response.user.email
    hashed_pw = hash_password(payload.password)

    profile_response =supabase.from_("users").insert({
        "username": email.split("@")[0],
        "email": email,
        "password": hashed_pw,
        "auth_id": auth_uuid
    }).execute()

    if not profile_response.data:
        raise HTTPException(status_code=500, detail="User created in auth, but failed to sync profile.")

    return {"user_id": auth_uuid, "email": email}


# --- Sign in (set cookies) ---
@router.post("/signin")
def login(payload: SignUpRequest):
    try:
        result = supabase.auth.sign_in_with_password({
            "email": payload.email,
            "password": payload.password
        })

        access_token = result.session.access_token
        refresh_token = result.session.refresh_token

        response = JSONResponse(content={"message": "Login successful"})
        response.set_cookie("access_token", access_token, httponly=True, secure=False, samesite="Lax", max_age=86400)
        response.set_cookie("refresh_token", refresh_token, httponly=True, secure=False, samesite="Lax", max_age=604800)
        return response
    except AuthApiError as e:
        raise HTTPException(status_code=400, detail=str(e))


# --- Google Login ---
@router.get("/login/google")
def login_with_google():
    query_params = urlencode({
        "provider": "google",
        "redirect_to": GOOGLE_REDIRECT_URL,
        "flow_type": "pkce"
    })
    redirect_url = f"{SUPABASE_URL}/auth/v1/authorize?{query_params}"
    return RedirectResponse(url=redirect_url)


@router.get("/login/go")
def logingo():
    redirect_url = "http://localhost:5173/callback" 
    auth_url = (
        "https://ztpkrolkyvgclbrijlzu.supabase.co/auth/v1/authorize"
        f"?provider=google&redirect_to={redirect_url}"
    )   
    return RedirectResponse(auth_url)

# --- Callback from Google ---
import httpx

@router.post("/store-token")
async def store_token(data: dict):
    access_token = data.get("access_token")
    refresh_token = data.get("refresh_token")

    response = JSONResponse({"message": "Token stored"})
    response.set_cookie("access_token", access_token, httponly=True, secure=False, samesite="Lax")
    response.set_cookie("refresh_token", refresh_token, httponly=True, secure=False, samesite="Lax")
    return response


@router.get("/calback")
async def auth_calback(request: Request):
    code = request.query_params.get("code")
    if not code:
        return {"error": "No authorization code provided"}

    async with httpx.AsyncClient() as client:
        token_res = await client.post(
            "https://ztpkrolkyvgclbrijlzu.supabase.co/auth/v1/token",
            data={
                "grant_type": "authorization_code",
                "code": code,
                "redirect_uri": "http://localhost:8000/calback"
            },
            headers={
                "Content-Type": "application/x-www-form-urlencoded",
                "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0cGtyb2xreXZnY2xicmlqbHp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjU5MDY3MiwiZXhwIjoyMDY4MTY2NjcyfQ.jj9hY5MV4-LODKRCQGu8brBdwG32owg29ZGa97kWTW4"  # 🔑 required
            }
        )

    if token_res.status_code != 200:
        return {"error": "Token exchange failed", "details": token_res.text}

    tokens = token_res.json()
    access_token = tokens.get("access_token")

    # Redirect to frontend with cookie
    frontend_url = "http://localhost:5173/dashboard"
    response = RedirectResponse(frontend_url)
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False,   # change to True in production
        samesite="Lax"
    )
    return response


@router.get("/auth/callback")
async def google_callback(request: Request):
    code = request.query_params.get("code")
    if not code:
        raise HTTPException(status_code=400, detail="No authorization code provided")

    # 1. Exchange code for tokens
    async with httpx.AsyncClient() as client:
        token_res = await client.post(
            f"{SUPABASE_URL}/auth/v1/token",
            data={
                "grant_type": "authorization_code",
                "code": code,
                "redirect_uri": GOOGLE_REDIRECT_URL
            },
            headers={
                "Content-Type": "application/x-www-form-urlencoded",
                "apikey": os.getenv("SUPABASE_KEY")  # safer than hardcoding
            }
        )

    if token_res.status_code != 200:
        raise HTTPException(status_code=400, detail="Token exchange failed")

    tokens = token_res.json()
    access_token = tokens.get("access_token")
    refresh_token = tokens.get("refresh_token")

    # 2. Get user info from Supabase Auth
    try:
        user = supabase.auth.get_user(access_token).user
        print("User info:", user)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid access token")

    email = user.email
    name = user.user_metadata.get("full_name") or email.split("@")[0]

    # 3. Ensure user exists in `users` table
    res = supabase.from_("users").select("*").eq("email", email).maybe_single().execute()
    if not res.data:
        insert_res = supabase.from_("users").insert({
            "username": name,
            "email": email,
            "auth_id": user.id,
            "provider": "google"
        }).execute()
        if not insert_res.data:
            raise HTTPException(status_code=500, detail="Failed to create user")

    # 4. Redirect to frontend with cookies set
    response = RedirectResponse(FRONTEND_REDIRECT)
    response.set_cookie("access_token", access_token, httponly=True, secure=False, samesite="Lax", max_age=86400)
    response.set_cookie("refresh_token", refresh_token, httponly=True, secure=False, samesite="Lax", max_age=604800)
    return response




# @router.get("/callback")
# def auth_callback(request: Request):
#     access_token = request.query_params.get("access_token")
#     refresh_token = request.query_params.get("refresh_token")

#     if not access_token :
#         raise HTTPException(status_code=400, detail="Missing tokens in callbackkkkk")

#     try:
#         user = supabase.auth.get_user(access_token).user
#     except Exception as e:
#         raise HTTPException(status_code=400, detail="Invalid token")

#     response = RedirectResponse(url=f"{FRONTEND_REDIRECT}/dashboard")
#     response.set_cookie(
#         key="access_token", value=access_token,
#         httponly=True, secure=False, samesite="Lax", max_age=60 * 60 * 24
#     )
#     response.set_cookie(
#         key="refresh_token", value=refresh_token,
#         httponly=True, secure=False, samesite="Lax", max_age=60 * 60 * 24 * 7
#     )
#     return response








# --- Get current user ---
# @router.get("/me")
# async def get_me(user=Depends(get_current_user)):

#     profile_response = supabase.from_("users")\
#             .select("id")\
#             .eq("email", user.email)\
#             .single()\
#             .execute()
        
#     user_id = profile_response.data["id"]
    
#     return {"user": user.__dict__}


@router.get("/me")
async def get_me(user=Depends(get_current_user)):
    profile_response = (
        supabase.from_("users")
        .select("id, username, email")
        .eq("email", user.email)
        .maybe_single()
        .execute()
    )

    if not profile_response or profile_response.data is None:
        return {"auth": user.__dict__, "profile": None}

    return {"user": user.__dict__, "profile": profile_response.data}




# --- Logout ---
@router.post("/logout")
def logout():
    response = JSONResponse(content={"message": "Logged out"})
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return response
