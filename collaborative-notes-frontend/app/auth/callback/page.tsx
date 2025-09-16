"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function CallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const hash = window.location.hash.substring(1); // remove '#'
    const params = new URLSearchParams(hash);

    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");

    if (accessToken && refreshToken) {
      axios
        .post("http://localhost:8000/auth/store-token", {
          access_token: accessToken,
          refresh_token: refreshToken,
        })
        .then(() => {
          router.push("/dashboard");
        })
        .catch((err) => {
          console.error("Token store failed", err);
        });
    } else {
      console.error("No tokens found in callback URL");
    }
  }, [router]);

  return <div className="p-6">Completing login...</div>;
}
