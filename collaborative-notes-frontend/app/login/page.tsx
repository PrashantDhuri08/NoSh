"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText, Mail, Lock } from "lucide-react";
import { FcGoogle } from "react-icons/fc";

const handleGoogleLogin = () => {
  window.location.href = `${API_BASE_URL}/auth/login/go`; // redirect to backend
};
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/signin`,
        {
          email: formData.email,
          password: formData.password,
        },
        {
          withCredentials: true, // Important for cookie-based auth
        }
      );

      if (response.status === 200) {
        
        // router.push("/");
        
        window.location.href = "/";
      }
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <FileText className="h-12 w-12 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>
            Sign in to your collaborative notes account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium flex items-center"
              >
                <Mail className="h-4 w-4 mr-2" />
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="pl-10"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium flex items-center"
              >
                <Lock className="h-4 w-4 mr-2" />
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="pl-10"
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>

            <div className="text-center text-sm">
              {"Don't have an account? "}
              <Link
                href="/signup"
                className="text-blue-600 hover:underline font-medium"
              >
                Sign up
              </Link>
              <Button
                type="button"
                onClick={handleGoogleLogin}
                variant="outline"
                className="w-full flex items-center justify-center space-x-2"
              >
                <FcGoogle className="h-5 w-5" />
                <span>Continue with Google</span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
