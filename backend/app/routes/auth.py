from fastapi import APIRouter, HTTPException, Depends, Request, Header
from fastapi.responses import JSONResponse, RedirectResponse
from sb_client import get_supabase_client
from pydantic import BaseModel
from jose import jwt, jwk
from gotrue.errors import AuthApiError
import requests
from urllib.parse import urlencode
from functools import lru_cache

router = APIRouter()

supabase = get_supabase_client()
GOOGLE_REDIRECT_URL = "http://localhost:8000/auth/callback"
SUPABASE_URL = "ttps://ztpkrolkyvgclbrijlzu.supabase.co"

class SignUpRequest(BaseModel):
    email: str
    password: str

@router.post("/signup")
async def signup(payload: SignUpRequest):
    
    response = supabase.auth.sign_up({
        "email": payload.email,
        "password": payload.password,
    })
    if response.user is None:
        raise HTTPException(status_code=400, detail="Sign-up failed")
    return {
        "user_id": response.user.id,
        "email": response.user.email
    }


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
        response.set_cookie(
            key="access_token", value=access_token,
            httponly=True, secure=False, samesite="Lax", max_age=86400
        )
        response.set_cookie(
            key="refresh_token", value=refresh_token,
            httponly=True, secure=False, samesite="Lax", max_age=86400 * 7
        )
        return response
    except AuthApiError as e:
        raise HTTPException(status_code=400, detail=str(e))

# @router.get("/login/google")
# async def login_google():
#     supabase = get_supabase_client()
#     response = supabase.auth.sign_in_with_oauth({
#         "provider": "google",
#         "options": {
#             "redirect_to": "http://localhost:8000/auth/callback",
#         }
#     })
#     return response



@router.get("/login/google")
def login_with_google():
    query_params = urlencode({
        "provider": "google",
        "redirect_to": GOOGLE_REDIRECT_URL
    })
    
    redirect_url = f"{SUPABASE_URL}/auth/v1/authorize?{query_params}"
    return RedirectResponse(url=redirect_url)




@router.get("/callback")
def auth_callback(request: Request):
    access_token = request.query_params.get("access_token")
    refresh_token = request.query_params.get("refresh_token")

    if not access_token or not refresh_token:
        raise HTTPException(status_code=400, detail="Missing tokens in callback")

    try:
        user = supabase.auth.get_user(access_token).user
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid token")

    response = RedirectResponse(url="http://localhost:3000/dashboard")
    response.set_cookie(
        key="access_token", value=access_token,
        httponly=True, secure=False, samesite="Lax", max_age=60 * 60 * 24
    )
    response.set_cookie(
        key="refresh_token", value=refresh_token,
        httponly=True, secure=False, samesite="Lax", max_age=60 * 60 * 24 * 7
    )
    return response


# ### GET CURRENT USER
# @router.get("/me")
# def get_me(request: Request):
#     access_token = request.cookies.get("access_token")
#     if not access_token:
#         raise HTTPException(status_code=401, detail="Not logged in")
#     try:
#         user = supabase.auth.get_user(access_token).user
#         return {"user": user}
#     except Exception:
#         raise HTTPException(status_code=401, detail="Invalid token")


@router.get("/me")
def get_me(request: Request):
    access_token = request.cookies.get("access_token")
    if not access_token:
        raise HTTPException(status_code=401, detail="Not logged in")
    try:
        user_response = supabase.auth.get_user(access_token)
        user = user_response.user
        return {"user": user.__dict__}  # ✅ Convert to dict
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

### LOGOUT
@router.post("/logout")
def logout():
    response = JSONResponse(content={"message": "Logged out"})
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return response

@router.get("/callback")
async def auth_callback(request: Request):
    code = request.query_params.get("code")
    if not code:
        raise HTTPException(status_code=400, detail="Missing authorization code")
    supabase = get_supabase_client()
    try:
        response = supabase.auth.exchange_code_for_session({"code": code})
        if response.session is None:
            raise HTTPException(status_code=401, detail="OAuth login failed")
        return JSONResponse(content={
            "access_token": response.session.access_token,
            "user_id": response.session.user.id,
            "email": response.session.user.email,
            "refresh_token": response.session.refresh_token
        })
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"OAuth error: {str(e)}")

