// Dashboard.jsx
import React, { useEffect, useState } from "react";

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
    <div>
      <h2>Dashboard</h2>
      {user ? (
        <>
          <p>Welcome, {user.email}</p>
          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default Dashboard;