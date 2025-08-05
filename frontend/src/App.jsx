import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Login from "./auth/Login";
import Signup from "./auth/Signup";
import NoteUploadForm from "./components/NoteUploadForm";
import CreateRoom from "./components/CreateRoom";
import { useAuth } from "./auth/useAuth";
import RoomNotes from "./components/RoomNotes";
import RoomNotesRealtime from "./components/RoomNotesRealtime";
import { useParams } from "react-router-dom";
import QuillCollaborativeEditor from "./components/CollaborativeEditor";


function RoomNotesRealtimeWrapper() {
  const { roomId } = useParams();
  return <RoomNotesRealtime roomId={roomId} />;
}

function CollaborativeEditorWrapper() {
  const { noteId } = useParams();
  return <QuillCollaborativeEditor noteId={noteId} />;
}


export default function App() {
  const { user, logout } = useAuth();


  

  return (
    <Router>
      <nav>
        <Link to="/">Home</Link>{" | "}
        {user ? (
          <>
            <span>Welcome, {user.email}</span>
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>{" | "}
            <Link to="/signup">Signup</Link>
          </>
        )}
      </nav>

      <Routes>
        <Route path="/" element={<div>Welcome to Notes App</div>} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        {/* <Route path="/rooms/:roomId/notes" element={<RoomNotes />} /> */}
        <Route path="/rooms/:roomId/notes" element={<RoomNotesRealtimeWrapper />} />
        <Route path="/dashboard" element={<>
          <CreateRoom />
          <NoteUploadForm />
        </>} />
        <Route path="/notes/:noteId/edit" element={<CollaborativeEditorWrapper />} />

      </Routes>
    </Router>
  );
}
