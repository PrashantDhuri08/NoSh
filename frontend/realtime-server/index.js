// realtime-server/index.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // or set your frontend origin
    methods: ["GET", "POST"],
  },
});

const notes = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

 socket.on("join-room", async (noteId) => {
  try {
    const res = await axios.get(`http://localhost:8000/notes/notes/${noteId}`);
    const content = res.data.content || "";
    socket.join(noteId);
    socket.emit("load-note", content); // ✅ already a string — don't JSON.stringify
  } catch (err) {
    console.error("Failed to load note:", err.message);
    socket.emit("load-note", ""); // fallback
  }
});


  socket.on("send-changes", ({ noteId, delta }) => {
    socket.to(noteId).emit("receive-changes", delta);
  });

  socket.on("save-note", ({ noteId, data }) => {
    notes[noteId] = data;
  });

  socket.on("save-note", async ({ noteId, data }) => {
    try {
      await axios.put(`http://localhost:8000/notes/notes/${noteId}`, {
        content: data, // store as JSON string
      });
    } catch (err) {
      console.error("Failed to save note:", err.message);
    }
  });
});

server.listen(4000, () => {
  console.log("Socket.IO server running on port 4000");
});
