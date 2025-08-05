import React, { useState, useEffect } from 'react';
import axios from 'axios';

const NoteUploadForm = () => {
  const [title, setTitle] = useState('');
  const [roomId, setRoomId] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [file, setFile] = useState(null);
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    axios.get('/notes/your-api/rooms/list') // Replace with your real endpoint if available
      .then(res => setRooms(res.data.rooms || []))
      .catch(() => setRooms([]));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('title', title);
    form.append('room_id', roomId);
    form.append('content', content);
    form.append('tags', tags);
    if (file) form.append('file', file);

    try {
      const res = await axios.post('http://localhost:8000/notes/notes/upload', form, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert(res.data.message);
    } catch (err) {
      alert(err.response?.data?.detail || 'Upload failed');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Upload Note</h2>
      <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required />
      <textarea placeholder="Content" value={content} onChange={e => setContent(e.target.value)} />
      <input type="text" placeholder="Tags (comma separated)" value={tags} onChange={e => setTags(e.target.value)} />
      <select value={roomId} onChange={e => setRoomId(e.target.value)} required>
        <option value="">Select Room</option>
        {rooms.map(room => (
          <option key={room.id} value={room.id}>{room.name}</option>
        ))}
      </select>
      <input type="file" accept=".pdf,.docx,image/*" onChange={e => setFile(e.target.files[0])} />
      <button type="submit">Upload Note</button>
    </form>
  );
};

export default NoteUploadForm;