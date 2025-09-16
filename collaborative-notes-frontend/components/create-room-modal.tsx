"use client";

import { useState } from "react";
import axios from "axios";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { X, Loader2 } from "lucide-react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

interface Room {
  id: string;
  name: string;
  description: string;
  created_at: string;
  notes_count: number;
  members_count: number;
}

interface CreateRoomModalProps {
  onClose: () => void;
  onRoomCreated: (room: Room) => void;
}

export default function CreateRoomModal({
  onClose,
  onRoomCreated,
}: CreateRoomModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) {
      setError("Room name is required");
      return;
    }

    setLoading(true);

    try {
      const formPayload = new FormData();
      formPayload.append("name", formData.name.trim());

      const response = await axios.post(
        `${API_BASE_URL}/notes/rooms/create`,
        formPayload,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("Room created:", response.data);
      onRoomCreated(response.data);
    } catch (err: any) {
      setError(
        err.response?.data?.detail || "Failed to create room. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Create New Room</CardTitle>
              <CardDescription>
                Set up a new collaborative workspace
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={loading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                {/* <AlertDescription>{error}</AlertDescription> */}
              </Alert>
            )}

            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Room Name *
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter room name"
                maxLength={100}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the purpose of this room (optional)"
                maxLength={500}
                rows={3}
                disabled={loading}
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                type="submit"
                disabled={loading || !formData.name.trim()}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Room"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
