"use client";

import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, X } from "lucide-react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

interface CreateRoomFormProps {
  onSuccess: (roomId: string) => void;
  onCancel: () => void;
}

export default function CreateRoomForm({
  onSuccess,
  onCancel,
}: CreateRoomFormProps) {
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

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Room name is required");
      return false;
    }
    if (formData.name.length < 3) {
      setError("Room name must be at least 3 characters long");
      return false;
    }
    if (formData.name.length > 50) {
      setError("Room name must be less than 50 characters");
      return false;
    }
    if (formData.description.length > 200) {
      setError("Description must be less than 200 characters");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

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
      onSuccess(response.data.id);
    } catch (err: any) {
      setError(
        err.response?.data?.detail || "Failed to create room. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
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
          maxLength={50}
          disabled={loading}
        />
        <p className="text-xs text-gray-500">
          {formData.name.length}/50 characters
        </p>
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
          placeholder="Describe what this room is for (optional)"
          maxLength={200}
          rows={3}
          disabled={loading}
        />
        <p className="text-xs text-gray-500">
          {formData.description.length}/200 characters
        </p>
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
          onClick={onCancel}
          disabled={loading}
          className="flex items-center space-x-2"
        >
          <X className="h-4 w-4" />
          <span>Cancel</span>
        </Button>
      </div>
    </form>
  );
}
