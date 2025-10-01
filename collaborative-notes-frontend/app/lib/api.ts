// lib/api.js
import axios from "axios";
import { supabase } from "./supabaseClient";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000",
});

// This interceptor runs before every request
api.interceptors.request.use(
  async (config) => {
    // Get the current session from Supabase
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // If a session exists, add the Authorization header
    if (session) {
      config.headers["Authorization"] = `Bearer ${session.access_token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
