"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Navbar from "@/components/navbar";
import CreateRoomModal from "@/components/create-room-modal";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Users, Plus, Calendar, ArrowRight } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

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

export default function Dashboard() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [roomInput, setRoomInput] = useState("");
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
        router.push("/login");
        setError("Failed to fetch rooms. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // const handleRoomCreated = (newRoom: Room) => {
  //   setRooms([newRoom, ...rooms])
  //   setShowCreateModal(false)
  // }

  const handleRoomCreated = (newRoom: any) => {
    const normalizedRoom: Room = {
      id: String(newRoom.id),
      name: newRoom.name.trim(),
      description: newRoom.description || "", // fallback if missing
      created_at: newRoom.created_at,
      notes_count: newRoom.notes_count || 0,
      members_count: newRoom.members_count || 1,
    };

    setRooms([normalizedRoom, ...rooms]);
    setShowCreateModal(false);
  };

  const handleDeleteRoom = async (roomId: string) => {
  const confirmDelete = confirm("Are you sure you want to delete this room?");
  if (!confirmDelete) return;

  try {
    await axios.delete(`${API_BASE_URL}/notes/rooms/${roomId}`, {
      withCredentials: true,
    });

    // Remove deleted room from state
    setRooms((prevRooms) => prevRooms.filter((room) => room.id !== roomId));
  } catch (error) {
    console.error("Error deleting room:", error);
    setError("Failed to delete room. Please try again.");
  }
};


  const handleRoomInput = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomInput.trim()) {
      router.push(`/room/${roomInput.trim()}`);
      setRoomInput("");
    }
  };

  const openRoom = (roomId: string) => {
    router.push(`/room/${roomId}`);
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
        {/* Room ID Input */}
        <form
          onSubmit={handleRoomInput}
          className="flex items-center gap-2 mb-8 max-w-md"
        >
          <input
            type="text"
            value={roomInput}
            onChange={(e) => setRoomInput(e.target.value)}
            placeholder="Enter Room ID"
            className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <Button type="submit" className="flex items-center gap-1">
            <ArrowRight className="h-4 w-4" />
            Enter Room
          </Button>
        </form>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Rooms</h1>
              <p className="text-gray-600 mt-2">
                Manage your collaborative workspaces
              </p>
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Create Room</span>
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Rooms
                  </p>
                  <p className="text-2xl font-bold text-gray-900">{rooms.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Notes
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {rooms.reduce((sum, room) => sum + (room.notes_count || 0), 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Active Today
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {rooms.filter(room => {
                      const today = new Date().toDateString()
                      return new Date(room.created_at).toDateString() === today
                    }).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rooms Grid */}
        {rooms.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No rooms yet
              </h3>
              <p className="text-gray-500 mb-6">
                Create your first room to start collaborating with your team
              </p>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Room
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <Card
                key={room.id}
                className="hover:shadow-lg transition-shadow cursor-pointer group"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                      {room.name}
                    </CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {String(room.id).substring(0, 8)}...
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {room.description || "No description provided"}
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
                        <span>{room.members_count || 1} members</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      Created {new Date(room.created_at).toLocaleDateString()}
                    </span>
                    {/* <Button
                      onClick={() => openRoom(room.id)}
                      size="sm"
                      className="flex items-center space-x-1"
                    >
                      <span>Open</span>
                      <ArrowRight className="h-3 w-3" />
                    </Button> */}

                    <div className="flex space-x-2">
  <Button
    onClick={() => openRoom(room.id)}
    size="sm"
    className="flex items-center space-x-1"
  >
    <span>Open</span>
    <ArrowRight className="h-3 w-3" />
  </Button>

  <Button
    variant="destructive"
    size="sm"
    onClick={() => handleDeleteRoom(room.id)}
  >
    Delete
  </Button>
</div>

                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Create Room Modal */}
        {showCreateModal && (
          <CreateRoomModal
            onClose={() => setShowCreateModal(false)}
            onRoomCreated={handleRoomCreated}
          />
        )}
      </div>
    </div>
  );
}
