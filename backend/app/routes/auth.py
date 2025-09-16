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
GOOGLE_REDIRECT_URL = "http://localhost:3000/auth/callback"
### CONFIGS
# GOOGLE_REDIRECT_URL = "http://localhost:8000/auth/callback"
FRONTEND_REDIRECT = "http://localhost:3000/dashboard"

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
    redirect_url = "http://localhost:3000/auth/callback"
    auth_url = (
        "https://ztpkrolkyvgclbrijlzu.supabase.co/auth/v1/authorize"
        f"?provider=google&redirect_to={redirect_url}"
    )   
    return RedirectResponse(auth_url)


# Step 2: Store tokens from frontend callback
@router.post("/store-token")
async def store_token(data: dict):
    access_token = data.get("access_token")
    refresh_token = data.get("refresh_token")

    if not access_token:
        return JSONResponse({"error": "No access_token provided"}, status_code=400)

    response = JSONResponse({"message": "Token stored"})
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False,   # change to True in production
        samesite="Lax"
    )
    if refresh_token:
        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            secure=False,
            samesite="Lax"
        )
    return response



import httpx

@router.get("/callback")
async def auth_callback(request: Request):
    code = request.query_params.get("code")
    if not code:
        raise HTTPException(status_code=400, detail="No authorization code provided")

    # Exchange code for tokens
    async with httpx.AsyncClient() as client:
        token_res = await client.post(
            f"{SUPABASE_URL}/auth/v1/token",
            data={
                "grant_type": "authorization_code",
                "code": code,
                "redirect_uri": GOOGLE_REDIRECT_URL,
            },
            headers={
                "Content-Type": "application/x-www-form-urlencoded",
                "apikey": os.getenv("SUPABASE_KEY"),
            },
        )

    if token_res.status_code != 200:
        raise HTTPException(status_code=400, detail=token_res.text)

    tokens = token_res.json()
    access_token = tokens.get("access_token")
    refresh_token = tokens.get("refresh_token")

    # Get user info
    async with httpx.AsyncClient() as client:
        user_res = await client.get(
            f"{SUPABASE_URL}/auth/v1/user",
            headers={"Authorization": f"Bearer {access_token}"}
        )

    user = user_res.json()
    email = user.get("email")

    # Sync with users table if not exists
    profile = supabase.from_("users").select("id").eq("email", email).maybe_single().execute()
    if not profile.data:
        supabase.from_("users").insert({
            "username": email.split("@")[0],
            "email": email,
            "auth_id": user.get("id")
        }).execute()

    # ✅ Set cookies like email login and redirect frontend
    response = RedirectResponse(FRONTEND_REDIRECT)
    response.set_cookie("access_token", access_token, httponly=True, secure=False, samesite="Lax")
    response.set_cookie("refresh_token", refresh_token, httponly=True, secure=False, samesite="Lax")
    return response

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
