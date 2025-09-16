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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000";

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
  const quillRef = useRef<any>(null);
  const router = useRouter();
  const params = useParams();
  const noteId = params.id as string;

  useEffect(() => {
    fetchNote();
    loadQuill();
    initializeSocket();

    return () => {
      socketRef.current?.disconnect();
    };
  }, [noteId]);

  const loadQuill = async () => {
    if (typeof window === "undefined") return;

    const editorContainer = document.getElementById("editor");
    if (!editorContainer || quillRef.current) return;

    const Quill = (await import("quill")).default;

    if (!document.querySelector('link[href="https://cdn.quilljs.com/1.3.6/quill.snow.css"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://cdn.quilljs.com/1.3.6/quill.snow.css";
      document.head.appendChild(link);
    }

    const quill = new Quill(editorContainer, {
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

    quill.on("text-change", (delta, oldDelta, source) => {
      if (source === "user" && socketRef.current) {
        socketRef.current.emit("send-changes", { noteId, delta });
      }
    });
  };

  const fetchNote = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/notes/notes/${noteId}`, {
        withCredentials: true,
      });

      setNote(response.data.content);
      setTitle(response.data.title);
      console.log("Note fetched:", response.data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        router.push("/login");
      } else {
        setError("Failed to load note");
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

    socket.on("load-note", (content: string) => {
      if (quillRef.current) {
        quillRef.current.root.innerHTML = content;
      }
    });

    socket.on("receive-changes", (delta) => {
      if (quillRef.current) {
        quillRef.current.updateContents(delta, "api");
      }
    });

    socket.on("users-count", (count: number) => {
      setConnectedUsers(count);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from socket server");
    });
  };

  const saveNote = async () => {
    if (!note || !quillRef.current) return;

    setSaving(true);
    try {
      const content = quillRef.current.root.innerHTML;

      await axios.put(`${API_BASE_URL}/notes/notes/${noteId}`, {
        title,
        content,
      }, {
        withCredentials: true,
      });

      setNote({ ...note, title, content });

      // Also emit to socket server for in-memory sync
      socketRef.current?.emit("save-note", { noteId, data: content });
    } catch (err) {
      setError("Failed to save note");
    } finally {
      setSaving(false);
    }
  };

  const goBack = () => {
    if (note?.room_id) {
      router.push(`/room/${note.room_id}`);
    } else {
      router.push("/dashboard");
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
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
          {/* Editor Header */}
          <div className="border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" onClick={goBack} className="flex items-center space-x-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back</span>
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

                <Button onClick={saveNote} disabled={saving} className="flex items-center space-x-2">
                  <Save className="h-4 w-4" />
                  <span>{saving ? "Saving..." : "Save"}</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Quill Editor */}
          <div className="p-6">
            <div id="editor" style={{ minHeight: "500px" }}></div>
          </div>
        </div>

        <div className="mt-4 text-center text-sm text-gray-500">
          Changes are automatically synced with other collaborators in real-time
        </div>
      </div>
    </div>
  );
}