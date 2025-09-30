"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { io, Socket } from "socket.io-client";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Save, Users, ArrowLeft } from "lucide-react";
import "quill/dist/quill.snow.css"; // Import Quill styles directly
import Quill from "quill";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000";

interface Note {
  id: string;
  title: string;
  content: string;
  room_id: string;
}

export default function CollaborativeEditor() {
  const [note, setNote] = useState<Note | null>(null);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [connectedUsers, setConnectedUsers] = useState(0);
  const socketRef = useRef<Socket | null>(null);
  const quillRef = useRef<Quill | null>(null);
  const editorRef = useRef<HTMLDivElement>(null); // Ref for the editor container
  const router = useRouter();
  const params = useParams();
  const noteId = params.id as string;

  // Effect for fetching note data and initializing socket
  useEffect(() => {
    if (!noteId) return;

    fetchNote();
    initializeSocket();

    return () => {
      socketRef.current?.disconnect();
    };
  }, [noteId]);

  // ✅ IMPROVED: Effect for initializing and loading Quill editor once note data is available
  useEffect(() => {
    if (!note || quillRef.current || !editorRef.current) return;

    const quill = new Quill(editorRef.current, {
      theme: "snow",
      modules: {
        toolbar: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline"],
          [{ list: "ordered" }, { list: "bullet" }],
          ["link", "blockquote", "code-block"],
          [{ align: [] }],
          ["clean"],
        ],
      },
    });

    quillRef.current = quill;
    quill.root.innerHTML = note.content; // Load initial content
    setTitle(note.title); // Set initial title

    const handler = (delta: any, oldDelta: any, source: string) => {
      if (source === "user" && socketRef.current) {
        socketRef.current.emit("send-changes", { noteId, delta });
      }
    };

    quill.on("text-change", handler);

    return () => {
      quill.off("text-change", handler);
    };
  }, [note]); // This effect depends on `note`

  const fetchNote = async () => {
    try {
      // ✅ FIXED: Corrected API endpoint path
      const response = await axios.get(`${API_BASE_URL}/notes/notes/${noteId}`, {
        withCredentials: true,
      });
      setNote(response.data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        router.push("/login");
      } else {
        setError("Failed to load note. It may not exist.");
      }
    } finally {
      setLoading(false);
    }
  };

  const initializeSocket = () => {
    const socket = io(SOCKET_URL);
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join-room", noteId);
    });

    socket.on("receive-changes", (delta) => {
      if (quillRef.current) {
        quillRef.current.updateContents(delta, "api");
      }
    });

    socket.on("users-count", (count: number) => {
      setConnectedUsers(count);
    });
  };

  const saveNote = async () => {
    if (!note || !quillRef.current) return;

    setSaving(true);
    setError(""); // Clear previous errors
    try {
      const content = quillRef.current.root.innerHTML;

      // ✅ FIXED: Corrected API endpoint path
      await axios.put(
        `${API_BASE_URL}/notes/notes/${noteId}`,
        { title, content },
        { withCredentials: true }
      );

      // Also emit to socket server for in-memory sync on other clients
      socketRef.current?.emit("save-note", { noteId, data: content });
    } catch (err) {
      setError("Failed to save note");
    } finally {
      setSaving(false);
    }
  };

  const goBack = () => {
    router.push(note?.room_id ? `/room/${note.room_id}` : "/dashboard");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" onClick={goBack}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-lg font-semibold border-none shadow-none focus-visible:ring-0 px-0 max-w-md"
                  placeholder="Untitled Note"
                />
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Users className="h-4 w-4" />
                  <span>{connectedUsers} online</span>
                </div>
                <Button onClick={saveNote} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          </div>
          <div className="p-1">
            {" "}
            {/* Reduced padding around the editor */}
            {/* The ref is now attached here */}
            <div
              ref={editorRef}
              style={{ minHeight: "60vh", border: "none" }}
            ></div>
          </div>
        </div>
        <div className="mt-4 text-center text-sm text-gray-500">
          Changes are synced with collaborators in real-time.
        </div>
      </div>
    </div>
  );
}
