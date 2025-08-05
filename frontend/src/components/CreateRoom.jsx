// components/CreateRoom.jsx
import React, { useState } from 'react';
import axios from 'axios';

const CreateRoom = () => {
  const [name, setName] = useState('');

  const handleCreate = async (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', name);

    try {
      const res = await axios.post('http://localhost:8000/notes/rooms/create', form, { withCredentials: true });
      alert(`Room created: ${res.data.room.name}`);
      setName('');
    } catch (err) {
      alert(err.response?.data?.detail || 'Room creation failed');
    }
  };

  return (
    <form onSubmit={handleCreate}>
      <h2>Create Room</h2>
      <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Room Name" required />
      <button type="submit">Create</button>
    </form>
  );
};

export default CreateRoom;
