from fastapi import FastAPI
from routes import files, auth, notes
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="NOsh",
    description="Handles file uploads to Supabase Storage and stores comments/tags",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    # allow_origins=["*"], 
    allow_origins = [
    "http://localhost:3000",
    "https://nosh-teal.vercel.app"
],
    allow_credentials=True,
    allow_methods=["*"],  # Allow POST, GET, OPTIONS, etc.
    allow_headers=["*"],
)

# Mount file-related routes
app.include_router(files.router, prefix="/files", tags=["File Operations"])

app.include_router(auth.router , prefix="/auth", tags=["Authentication"])
app.include_router(notes.router , prefix="/notes", tags=["notes"])

# app.include_router(auth.router) 
