"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import { createClient } from "@supabase/supabase-js";
import { FcGoogle } from "react-icons/fc";
// import api from "@/lib/api";
import api from "../lib/api";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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

  // Supabase login logic
  const proceedWithLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const { error: supaError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (supaError) {
        setError(
          supaError.message || "Login failed. Please check your credentials."
        );
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError("Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    proceedWithLogin();
  };

  const checkSession = async () => {
    const { data, error } = await supabase.auth.getSession();
    const session = data?.session;

    if (session?.user?.email) {
      console.log("User is already signed in:", session.user.email);
      // Optionally redirect or sync user
      router.push("/dashboard");
    } else {
      console.log("No active session found.");
    }
  };

  // Google login with Supabase
  const handleGoogleLogin = async () => {
    checkSession();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
    if (error) setError(error.message);
    console.log(error);

    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        try {
          checkSession();
        } catch (err) {
          console.log("eooorrr");
          // Optionally handle sync error
        }
        router.push("/dashboard");
      }
    });
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

            {/* <Button
              type="button"
              className="w-full flex items-center justify-center gap-2 mt-2"
              variant="outline"
              onClick={handleGoogleLogin}
            >
              <FcGoogle className="h-5 w-5" />
              Sign in with Google
            </Button> */}

            <div className="text-center text-sm">
              {"Don't have an account? "}
              <Link
                href="/signup"
                className="text-blue-600 hover:underline font-medium"
              >
                Sign up
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
