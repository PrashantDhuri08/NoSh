import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

export default function RoomNotes() {
  const { roomId } = useParams();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`http://localhost:8000/notes/by-room/${roomId}`, { withCredentials: true })
      .then(res => setNotes(res.data.notes))
      .catch(() => setNotes([]))
      .finally(() => setLoading(false));
  }, [roomId]);

  return (
    <div>
      <h2>Notes in Room #{roomId}</h2>
      {loading ? (
        <p>Loading...</p>
      ) : notes.length === 0 ? (
        <p>No notes found.</p>
      ) : (
        <ul>
          {notes.map(note => (
            <li key={note.id}>
              <h3>{note.title}</h3>
              <p>{note.content}</p>
              {note.file_url && (
                <a href={note.file_url} target="_blank" rel="noopener noreferrer">
                  View Attachment
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
