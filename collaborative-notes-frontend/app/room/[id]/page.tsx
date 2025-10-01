"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Users,
  Plus,
  Upload,
  Edit,
  Trash2,
  Download,
  Eye,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import api from "@/app/lib/api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  author: string;
  tags: string[];
  file_url?: string;
  file_name?: string;
}

export default function RoomPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const params = useParams();
  const router = useRouter();
  const roomId = params.id as string;

  useEffect(() => {
    fetchNotes();
  }, [roomId]);

  const fetchNotes = async () => {
    try {
      const response = await api.get(
        `${API_BASE_URL}/notes/by-room/${roomId}`,
        {
          withCredentials: true,
        }
      );

      console.log("Fetched notes:", response.data);

      const fetchedNotes = response.data?.notes;
      if (Array.isArray(fetchedNotes)) {
        setNotes(fetchedNotes);
      } else {
        setNotes([]);
        setError("Unexpected response format. Please try again.");
      }
      setNotes(response.data.notes);
    } catch (err: any) {
      if (err.response?.status === 401) {
        router.push("/login");
      } else {
        setError("Failed to load notes. Please check if the room exists.");
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteNote = async (noteId: string) => {
    if (!confirm("Are you sure you want to delete this note?")) return;

    try {
      await api.delete(`${API_BASE_URL}/notes/notes/${noteId}`, {
        withCredentials: true,
      });
      setNotes(notes.filter((note) => note.id !== noteId));
    } catch (err) {
      setError("Failed to delete note");
    }
  };

  const openEditor = (noteId: string) => {
    router.push(`/editor/${noteId}`);
  };

  const openViewer = (noteId: string) => {
    router.push(`/note/${noteId}`);
  };

  const downloadFile = async (noteId: string, fileName: string) => {
    try {
      const response = await api.get(
        `${API_BASE_URL}/notes/notes/file-url/${noteId}`,
        { withCredentials: true }
      );

      const signedUrl = response.data.url;
      if (!signedUrl) throw new Error("No download URL returned");

      // Create a temporary link to download the file
      const link = document.createElement("a");
      link.href = signedUrl;
      link.download = fileName;
      link.target = "_blank"; // Open in new tab if direct download blocked
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError("Failed to download file");
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

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Room Notes</h1>
              <p className="text-gray-600 mt-2">Room ID: {roomId}</p>
            </div>
            <div className="flex space-x-4">
              <Button
                onClick={() => router.push("/upload")}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <Upload className="h-4 w-4" />
                <span>Upload Note</span>
              </Button>
              <Button onClick={() => router.push("/dashboard")}>
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>

        {/* Notes Grid */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
            <FileText className="h-6 w-6 mr-2" />
            Notes ({notes.length})
          </h2>

          {notes.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No notes yet
                </h3>
                <p className="text-gray-500 mb-4">
                  Upload your first note to get started
                </p>
                <Button onClick={() => router.push("/upload")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Note
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {notes.map((note) => (
                <Card
                  key={note.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg line-clamp-1">
                        {note.title}
                      </CardTitle>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openViewer(note.id)}
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditor(note.id)}
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {note.file_url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              downloadFile(note.id, note.file_name || "file")
                            }
                            title="Download"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNote(note.id)}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription>
                      Last updated:{" "}
                      {new Date(note.updated_at).toLocaleDateString()}
                      {note.author && ` • by ${note.author}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {note.content && (
                        <p className="text-gray-600 line-clamp-3">
                          {note.content
                            .replace(/<[^>]*>/g, "")
                            .substring(0, 150)}
                          ...
                        </p>
                      )}

                      {note.file_name && (
                        <div className="flex items-center space-x-2 text-sm text-blue-600">
                          <FileText className="h-4 w-4" />
                          <span>{note.file_name}</span>
                        </div>
                      )}

                      {note.tags && note.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {note.tags.map((tag, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="flex space-x-2 pt-2">
                        <Button
                          onClick={() => openViewer(note.id)}
                          size="sm"
                          variant="outline"
                          className="flex-1"
                        >
                          View
                        </Button>
                        <Button
                          onClick={() => openEditor(note.id)}
                          size="sm"
                          className="flex-1"
                        >
                          Edit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
