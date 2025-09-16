import React, { useState } from "react";
import axios from "axios";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8000/auth/signin", form, {
        withCredentials: true,
      });
      alert("Login successful!");
      window.location.href = "/dashboard";
    } catch (err) {
      alert(err.response?.data?.detail || "Login failed");
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:8000/auth/login/go";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Login
        </h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            name="email"
            type="email"
            placeholder="Email"
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-200"
          >
            Login
          </button>
        </form>

        <div className="mt-6 text-center">
          <span className="text-gray-500">or</span>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="mt-4 w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition duration-200"
        >
          Login with Google
        </button>
      </div>
    </div>
  );
}
