// Dashboard.jsx
import React, { useEffect, useState } from "react";
import RoomSelector from "./RoomSelector";

const API_BASE = "http://localhost:8000/auth";

function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/me`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
        else window.location.href = "/";
      });
  }, []);

  const handleLogout = async () => {
    await fetch(`${API_BASE}/logout`, {
      method: "POST",
      credentials: "include",
    });
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-indigo-100">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md text-center">
        <h2 className="text-3xl font-bold text-indigo-600 mb-6">Dashboard</h2>
        {user ? (
          <>
            <p className="text-lg mb-4">
              Welcome,{" "}
              <span className="font-semibold text-indigo-500">
                {user.email}
              </span>
            </p>
            <button
              onClick={handleLogout}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition"
            >
              Logout
            </button>
            {/* <RoomSelector /> */}
          </>
        ) : (
          <p className="text-gray-500">Loading...</p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
