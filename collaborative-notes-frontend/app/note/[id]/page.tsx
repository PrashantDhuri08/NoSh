"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  Edit,
  Download,
  FileText,
  Calendar,
  User,
  Tag,
} from "lucide-react";

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
  room_id: string;
}

export default function NoteViewer() {
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const params = useParams();
  const noteId = params.id as string;

  useEffect(() => {
    fetchNote();
  }, [noteId]);

  const fetchNote = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/notes/notes/${noteId}`,
        {
          withCredentials: true,
        }
      );
      setNote(response.data);
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

  const downloadFile = async (noteId: string, fileName: string) => {
    try {
      const response = await axios.get(
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
  const goBack = () => {
    if (note?.room_id) {
      router.push(`/notes/room/${note.room_id}`);
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

  if (error || !note) {
    return (
      <div>
        <Navbar />
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <Alert variant="destructive">
            <AlertDescription>{error || "Note not found"}</AlertDescription>
          </Alert>
          <Button onClick={() => router.push("/dashboard")} className="mt-4">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={goBack}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>

            <div className="flex space-x-2">
              {note.file_url && (
                <Button
                  onClick={downloadFile}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </Button>
              )}
              <Button
                onClick={() => router.push(`/editor/${noteId}`)}
                className="flex items-center space-x-2"
              >
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Note Content */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{note.title}</CardTitle>
            <CardDescription className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>
                  Created: {new Date(note.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>
                  Updated: {new Date(note.updated_at).toLocaleDateString()}
                </span>
              </div>
              {note.author && (
                <div className="flex items-center space-x-1">
                  <User className="h-4 w-4" />
                  <span>By: {note.author}</span>
                </div>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* File Attachment */}
            {note.file_name && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-900">
                        {note.file_name}
                      </p>
                      <p className="text-sm text-blue-600">Attached file</p>
                    </div>
                  </div>
                  <Button
                    onClick={downloadFile}
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download</span>
                  </Button>
                </div>
              </div>
            )}

            {/* Tags */}
            {note.tags && note.tags.length > 0 && (
              <div className="flex items-center space-x-2">
                <Tag className="h-4 w-4 text-gray-500" />
                <div className="flex flex-wrap gap-2">
                  {note.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Content */}
            {note.content && (
              <div className="prose max-w-none">
                <div
                  className="text-gray-800 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: note.content }}
                />
              </div>
            )}

            {!note.content && !note.file_name && (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>This note has no content</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
