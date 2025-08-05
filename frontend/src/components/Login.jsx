// Login.jsx
import React, { useState } from "react";

const API_BASE = "http://localhost:8000/auth";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async () => {
    const res = await fetch(`${API_BASE}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    alert(data.user_id ? "Signup successful!" : data.detail);
  };

  const handleLogin = async () => {
    const res = await fetch(`${API_BASE}/signin`, {
      method: "POST",
      credentials: "include", // ✅ Important for cookies
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (res.ok) {
      window.location.href = "/dashboard";
    } else {
      alert(data.detail);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:8000/auth/login/google";
};
  return (
    <div>
      <h2>Login / Signup</h2>
      <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleSignup}>Sign Up</button>
      <button onClick={handleLogin}>Login</button>
      <button onClick={handleGoogleLogin}>Login with Google</button>
    </div>
  );
}

export default Login;