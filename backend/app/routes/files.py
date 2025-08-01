
from fastapi import FastAPI, APIRouter, UploadFile, Form, Depends, Request, HTTPException
from sb_client import get_supabase_client

from routes.auth import get_me

supabase = get_supabase_client()

router = APIRouter()    

@router.post("/upload")
async def upload_file(
    request: Request,
    file: UploadFile,
    notesroom_id: str = Form(...)

):
    access_token = request.cookies.get("access_token")
    if not access_token:
        raise HTTPException(status_code=401, detail="Not logged in")

    try:
        user = supabase.auth.get_user(access_token).user
        user_id = user.id
        
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

    
    contents = await file.read()
    file_path = f"{notesroom_id}/{user_id}/{file.filename}"
    
    upload_resp = supabase.storage.from_("notes").upload(file_path, contents)
    # meta_resp = supabase.table("file_metadata").insert({
    #     "file_path": file_path,
    #     "notesroom_id": notesroom_id,
    #     "owner_id": user_id
    # }).execute()

    meta_resp = supabase.table("file_metadata").insert({
    "file_path": file_path,
    "notesroom_id": notesroom_id,
    "owner_id": user_id
}).execute()

    return {"upload": upload_resp, "metadata": meta_resp}