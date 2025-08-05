import React, { useEffect, useRef } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { io } from "socket.io-client";

const TOOLBAR_OPTIONS = [
  ["bold", "italic", "underline", "strike"],
  [{ header: [1, 2, 3, false] }],
  [{ list: "ordered" }, { list: "bullet" }],
  ["clean"],
];

const QuillSocketEditor = ({ noteId }) => {
  const editorRef = useRef(null);
  const socketRef = useRef(null);
  const quillRef = useRef(null);

  useEffect(() => {
    // Setup Socket.IO
    socketRef.current = io("http://localhost:4000");
    socketRef.current.emit("join-room", noteId);

    // Setup Quill
    const quill = new Quill(editorRef.current, {
      theme: "snow",
      modules: { toolbar: TOOLBAR_OPTIONS },
    });
    quill.disable();
    quill.setText("Loading...");
    quillRef.current = quill;

    // Load existing note
    socketRef.current.on("load-note", (content) => {
      quill.setText(content || ""); // plain text
      quill.enable();
    });

    // Listen for changes
    quill.on("text-change", (delta, oldDelta, source) => {
      if (source !== "user") return;
      socketRef.current.emit("send-changes", { noteId, delta });
    });

    // Apply remote changes
    socketRef.current.on("receive-changes", (delta) => {
      quill.updateContents(delta);
    });

    // Periodic save
    const interval = setInterval(() => {
      socketRef.current.emit("save-note", {
        noteId,
        data: quill.getText(), // plain text
      });
    }, 2000);

    return () => {
      clearInterval(interval);
      socketRef.current.disconnect();
    };
  }, [noteId]);

  return (
    <div
      ref={editorRef}
      style={{ height: "400px", backgroundColor: "white" }}
    />
  );
};

export default QuillSocketEditor;
