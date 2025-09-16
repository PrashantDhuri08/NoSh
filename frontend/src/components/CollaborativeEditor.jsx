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
    if (!quillRef.current) {
      const quill = new Quill(editorRef.current, {
        theme: "snow",
        modules: { toolbar: TOOLBAR_OPTIONS },
      });
      quill.disable();
      quill.setText("Loading...");
      quillRef.current = quill;
    }

    socketRef.current = io("http://localhost:4000");
    socketRef.current.emit("join-room", noteId);

    socketRef.current.on("load-note", (content) => {
      quillRef.current.setContents(content);
      quillRef.current.enable();
    });

    socketRef.current.on("receive-changes", (delta) => {
      quillRef.current.updateContents(delta);
    });

    const quill = quillRef.current;
    const handleChange = (delta, oldDelta, source) => {
      if (source !== "user") return;
      socketRef.current.emit("send-changes", { noteId, delta });
    };
    quill.on("text-change", handleChange);

    const interval = setInterval(() => {
      socketRef.current.emit("save-note", {
        noteId,
        data: quill.getContents(),
      });
    }, 2000);

    return () => {
      clearInterval(interval);
      socketRef.current.disconnect();
      quill.off("text-change", handleChange);
    };
  }, [noteId]);

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 bg-white rounded-xl shadow-lg border border-gray-200">
      <h2 className="text-2xl font-bold mb-4 text-indigo-700">
        Collaborative Note Editor
      </h2>
      <div
        ref={editorRef}
        className="bg-gray-50 min-h-[400px] rounded-md overflow-hidden border border-gray-300"
      />
    </div>
  );
};

export default QuillSocketEditor;
