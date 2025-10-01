"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/navbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Users, Plus, Upload, ArrowRight } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import CreateRoomForm from "@/components/create-room-form";
import api from "./lib/api";

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

export default function Home() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomId, setRoomId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const [showCreateRoom, setShowCreateRoom] = useState(false);

  useEffect(() => {
    fetchRooms();
  }, [router]);

  const fetchRooms = async () => {
    try {
      const response = await api.get("/notes/your-api/rooms/list");
      setRooms(response.data.rooms || []);
    } catch (err: any) {
      setError(
        "Failed to fetch rooms. Please check your connection or login first"
      );
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = (id: string) => {
    router.push(`/room/${id}`);
  };

  const joinRoomById = () => {
    if (roomId.trim()) {
      router.push(`/room/${roomId.trim()}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        {/* Header */}

        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Welcome Section */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Collaborative Notes Dashboard
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Join a room to start collaborating on notes with your team
            </p>

            {/* Join Room by ID */}
            <Card className="max-w-md mx-auto mb-8">
              <CardHeader>
                <CardTitle className="text-lg">Join Room by ID</CardTitle>
                <CardDescription>
                  Enter a room ID to join directly
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Enter Room ID"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && joinRoomById()}
                  />
                  <Button onClick={joinRoomById} disabled={!roomId.trim()}>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Available Rooms */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
                <Users className="h-6 w-6 mr-2" />
                Available Rooms
              </h2>
              <Button
                onClick={() => setShowCreateRoom(true)}
                className="flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Create Room</span>
              </Button>
            </div>

            {rooms.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No rooms available
                  </h3>
                  <p className="text-gray-500">
                    Create a room on your backend or wait for rooms to be
                    created
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rooms.map((room) => (
                  <Card
                    key={room.id}
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{room.name}</CardTitle>
                        <Badge variant="outline">ID: {room.id}</Badge>
                      </div>
                      <CardDescription className="line-clamp-2">
                        {room.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-1" />
                            <span>{room.notes_count || 0} notes</span>
                          </div>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            <span>{room.members_count || 0} members</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => joinRoom(room.id)}
                        className="w-full"
                      >
                        Join Room
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Create Room Modal */}
          {showCreateRoom && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <Card className="w-full max-w-md mx-4">
                <CardHeader>
                  <CardTitle>Create New Room</CardTitle>
                  <CardDescription>
                    Set up a new collaborative workspace
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CreateRoomForm
                    onSuccess={(roomId) => {
                      setShowCreateRoom(false);
                      router.push(`/room/${roomId}`);
                    }}
                    onCancel={() => setShowCreateRoom(false)}
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <Card>
              <CardContent className="text-center py-8">
                <FileText className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Real-time Editing
                </h3>
                <p className="text-gray-600">
                  Collaborate on notes in real-time with multiple users
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="text-center py-8">
                <Upload className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">File Upload</h3>
                <p className="text-gray-600">
                  Upload PDF, DOCX, and TXT files to share with your team
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="text-center py-8">
                <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Team Collaboration
                </h3>
                <p className="text-gray-600">
                  Work together with your team in organized rooms
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
