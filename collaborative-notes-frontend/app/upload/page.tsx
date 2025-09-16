"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileText, File, X, Plus } from "lucide-react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

interface Room {
  id: string;
  name: string;
}

export default function NoteUploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    room_id: "",
    tags: "",
  });
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/notes/your-api/rooms/list`,
        {
          withCredentials: true,
        }
      );

      console.log("Fetched rooms:", response.data.rooms);

      const fetchedRooms = response.data?.rooms;
      if (Array.isArray(fetchedRooms)) {
        setRooms(fetchedRooms);
      } else {
        setRooms([]);
        setError("Unexpected response format. Please try again.");
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        router.push("/login");
      } else {
        setError("Failed to fetch rooms");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const allowedTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword",
        "text/plain",
        "image/jpeg",
        "image/png",
      ];

      if (allowedTypes.includes(selectedFile.type)) {
        setFile(selectedFile);
        setError("");
        // Auto-fill title if not already set
        if (!formData.title) {
          setFormData((prev) => ({
            ...prev,
            title: selectedFile.name.split(".")[0],
          }));
        }
      } else {
        setError("Please select a PDF, DOCX, DOC, TXT, JPG, or PNG file");
        setFile(null);
      }
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const addTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setError("Title is required");
      return;
    }

    if (!formData.room_id) {
      setError("Please select a room");
      return;
    }

    if (!file && !formData.content.trim()) {
      setError("Please provide either a file or content");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const uploadFormData = new FormData();
      uploadFormData.append("title", formData.title);
      uploadFormData.append("content", formData.content);
      uploadFormData.append("room_id", formData.room_id);
      // Backend expects comma-separated string for tags
      uploadFormData.append("tags", tags.join(","));
      if (file) {
        uploadFormData.append("file", file);
      }

      const response = await axios.post(
        `${API_BASE_URL}/notes/notes/upload`,
        uploadFormData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      setSuccess("Note uploaded successfully!");

      // Reset form
      setFormData({
        title: "",
        content: "",
        room_id: "",
        tags: "",
      });
      setFile(null);
      setTags([]);

      // Reset file input
      const fileInput = document.getElementById(
        "file-input"
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";

      // Redirect to room after 2 seconds
      setTimeout(() => {
        router.push(`/room/${formData.room_id}`);
      }, 2000);
    } catch (err: any) {
      setError(
        err.response?.data?.detail || "Upload failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "pdf":
        return <FileText className="h-8 w-8 text-red-500" />;
      case "docx":
      case "doc":
        return <File className="h-8 w-8 text-blue-500" />;
      case "txt":
        return <FileText className="h-8 w-8 text-gray-500" />;
      case "jpg":
      case "jpeg":
      case "png":
        return <File className="h-8 w-8 text-green-500" />;
      default:
        return <File className="h-8 w-8 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Upload Note</h1>
          <p className="text-gray-600 mt-2">
            Create a new note with optional file attachment
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="h-5 w-5" />
              <span>Note Upload</span>
            </CardTitle>
            <CardDescription>
              Fill in the details and optionally attach a file
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert>
                  <AlertDescription className="text-green-600">
                    {success}
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="title" className="text-sm font-medium">
                      Title *
                    </label>
                    <Input
                      id="title"
                      name="title"
                      type="text"
                      required
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Enter note title"
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="room_id" className="text-sm font-medium">
                      Room *
                    </label>
                    <Select
                      value={formData.room_id}
                      onValueChange={(value) =>
                        setFormData({ ...formData, room_id: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a room" />
                      </SelectTrigger>
                      <SelectContent>
                        {rooms.map((room) => (
                          <SelectItem key={room.id} value={room.id}>
                            {room.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="file-input" className="text-sm font-medium">
                      Attach File (Optional)
                    </label>
                    <Input
                      id="file-input"
                      type="file"
                      accept=".pdf,.docx,.doc,.txt,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      className="cursor-pointer"
                      disabled={loading}
                    />
                    <p className="text-xs text-gray-500">
                      Supported: PDF, DOCX, DOC, TXT, JPG, PNG (Max: 10MB)
                    </p>
                  </div>

                  {file && (
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      {getFileIcon(file.name)}
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="content" className="text-sm font-medium">
                      Content
                    </label>
                    <Textarea
                      id="content"
                      name="content"
                      value={formData.content}
                      onChange={handleInputChange}
                      placeholder="Enter note content (optional if file is attached)"
                      rows={6}
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tags</label>
                    <div className="flex space-x-2">
                      <Input
                        value={currentTag}
                        onChange={(e) => setCurrentTag(e.target.value)}
                        placeholder="Add a tag"
                        onKeyPress={(e) =>
                          e.key === "Enter" && (e.preventDefault(), addTag())
                        }
                        disabled={loading}
                      />
                      <Button
                        type="button"
                        onClick={addTag}
                        variant="outline"
                        disabled={loading}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {tags.map((tag, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="flex items-center space-x-1"
                          >
                            <span>{tag}</span>
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="ml-1 hover:text-red-500"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={
                  loading || !formData.title.trim() || !formData.room_id
                }
              >
                {loading ? "Uploading..." : "Upload Note"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
