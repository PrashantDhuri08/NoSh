import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

export default function RoomNotes() {
  const { roomId } = useParams();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`http://localhost:8000/notes/by-room/${roomId}`, {
        withCredentials: true,
      })
      .then((res) => setNotes(res.data.notes))
      .catch(() => setNotes([]))
      .finally(() => setLoading(false));
  }, [roomId]);

  return (
    <div className="max-w-3xl mx-auto mt-10">
      <h2 className="text-2xl font-bold text-indigo-600 mb-6">
        Notes in Room #{roomId}
      </h2>
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : notes.length === 0 ? (
        <p className="text-gray-400">No notes found.</p>
      ) : (
        <ul className="space-y-6">
          {notes.map((note) => (
            <li
              key={note.id}
              className="bg-white rounded-lg shadow p-6 border border-gray-100"
            >
              <h3 className="text-lg font-semibold text-indigo-700 mb-2">
                {note.title}
              </h3>
              <p className="text-gray-700 mb-2">{note.content}</p>
              {note.file_url && (
                <a
                  href={note.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-500 underline hover:text-indigo-700"
                >
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
