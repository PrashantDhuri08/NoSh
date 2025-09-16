import { useEffect, useState } from "react";
import axios from "axios";

export function useAuth() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:8000/auth/me", { withCredentials: true })
      .then(res => setUser(res.data.profile))
      // .catch(() => setUser(null));

    console.log(user);
  }, []);

  const logout = async () => {
    await axios.post("http://localhost:8000/auth/logout", {}, { withCredentials: true });
    setUser(null);
  };

  return { user, logout };
}
