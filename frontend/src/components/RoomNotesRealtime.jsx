// components/RoomNotesRealtime.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function RoomNotesRealtime({ roomId }) {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    fetchNotes();

    const channel = supabase
      .channel('room-notes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notes',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          console.log("Realtime Change:", payload);
          fetchNotes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  const fetchNotes = async () => {
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .eq("room_id", roomId)
      .order("created_at", { ascending: false });
    if (!error) setNotes(data);
  };

  return (
    <div>
      <h3>Live Notes for Room #{roomId}</h3>
      <ul>
        {notes.map(note => (
          <li key={note.id}>
            <strong>{note.title}</strong>
            <p>{note.content}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
