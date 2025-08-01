import os
import time
import mimetypes
from typing import Optional, List
from fastapi import APIRouter, Form, File, UploadFile, Request, HTTPException
from sb_client import get_supabase_client

supabase = get_supabase_client()
router = APIRouter()

# --- Core Upload Logic ---
async def upload_note(
    user_id: int,
    title: str,
    room_id: int,
    content: Optional[str],
    file: Optional[UploadFile],
    tags: Optional[List[str]],
) -> dict:
    file_url, file_type = None, None

    # File Handling
    if file:
        content_type = file.content_type
        if content_type == 'application/pdf':
            file_type = 'pdf'
        elif content_type == 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
            file_type = 'docx'
        elif content_type.startswith('image/'):
            file_type = 'image'
        else:
            raise ValueError("Unsupported file type.")

        file_ext = mimetypes.guess_extension(content_type) or ".bin"
        file_path = f"{user_id}/{int(time.time())}{file_ext}"
        file_bytes = await file.read()

        supabase.storage.from_("note-files").upload(
            path=file_path, file=file_bytes, file_options={"content-type": content_type}
        )
        file_url = supabase.storage.from_("note-files").get_public_url(file_path)

    # Note Insertion
    note_response = supabase.from_("notes").insert({
        "room_id": room_id,
        "user_id": user_id,
        "title": title,
        "content": content,
        "file_url": file_url
    }).execute()

    if not note_response.data:
        raise Exception(f"Failed to create note: {note_response.error.message}")
    
    new_note = note_response.data[0]
    note_id = new_note['id']

    # File Metadata
    if file_url and file_type:
        supabase.from_("storage_buckets").insert({
            "note_id": note_id,
            "file_type": file_type,
            "file_url": file_url
        }).execute()

    # Tags
    if tags:
        tag_objects = [{"name": name} for name in tags]
        tags_response = supabase.from_("tags").upsert(
            tag_objects, on_conflict="name"
        ).execute()
        if not tags_response.data:
            raise Exception(f"Failed to upsert tags: {tags_response.error.message}")
        tag_ids = [tag['id'] for tag in tags_response.data]
        note_tag_links = [{"note_id": note_id, "tag_id": tag_id} for tag_id in tag_ids]
        supabase.from_("note_tags").insert(note_tag_links).execute()

    return new_note


# --- API Endpoint ---
@router.post("/notes/upload")
async def create_note_endpoint(
    request: Request,
    title: str = Form(...),
    room_id: int = Form(...),
    content: Optional[str] = Form(None),
    tags: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
):
    # Step 1: Get Supabase Auth session from cookie
    access_token = request.cookies.get("access_token")
    if not access_token:
        raise HTTPException(status_code=401, detail="Authentication cookie missing.")

    try:
        user =  supabase.auth.get_user(access_token).user
        email = user.email
        print(user.email)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token.")

    # Step 2: Find user in `users` table using email (no auth_uuid)
    try:
        profile_response = supabase.from_("users")\
            .select("id")\
            .eq("email", "gd@gmail.com")\
            .single()\
            .execute()
        
        user_id = profile_response.data["id"]
        # print(profile_response)
    except Exception:
        # print("Error fetching user profile:", profile_response)
        raise HTTPException(status_code=404, detail="User not found in database." )

    # Step 3: Call note upload logic
    tag_list = [tag.strip() for tag in tags.split(",")] if tags else []

    try:
        new_note =await  upload_note(
            user_id=user_id,
            title=title,
            room_id=room_id,
            content=content,
            file=file,
            tags=tag_list
        )
        return {
            "status": "success",
            "message": "Note uploaded successfully!",
            "data": new_note
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@router.post("/rooms/create")
def create_room(request: Request, name: str = Form(...)):
    access_token = request.cookies.get("access_token")
    if not access_token:
        raise HTTPException(status_code=401, detail="Not logged in")

    try:
        user = supabase.auth.get_user(access_token).user
        email = user.email
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    try:
        # Fetch internal user ID
        profile_response = supabase.from_("users").select("id").eq("email", email).single().execute()
        user_id = profile_response.data["id"]
    except Exception:
        raise HTTPException(status_code=404, detail="User not found")

    # Insert room
    try:
        room_response = supabase.from_("rooms").insert({
            "name": name,
            "created_by": user_id
        }).execute()

        if not room_response.data:
            raise Exception(f"Failed to create room: {room_response.error.message}")

        return {"status": "success", "room": room_response.data[0]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Room creation failed: {str(e)}")
