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
    <form
      onSubmit={handleCreate}
      className="bg-white rounded-xl shadow-md p-6 max-w-md mx-auto mt-8 flex flex-col gap-4"
    >
      <h2 className="text-xl font-bold text-indigo-600 mb-2">Create Room</h2>
      <input
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Room Name"
        required
        className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
      />
      <button
        type="submit"
        className="bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition"
      >
        Create
      </button>
    </form>
  );
};

export default CreateRoom;
