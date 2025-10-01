"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileText, Users, Upload, LogOut, Menu, X, Home } from "lucide-react";
import Image from "next/image";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user);
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/login");
  };

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <Image
                src="/NoshLogo.png"
                alt="NoSh Logo"
                width={32}
                height={32}
                className="h-8 w-8"
                priority
              />
              <span className="text-xl font-bold text-gray-900">NoSh</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {user && (
              <>
                <Link href="/dashboard">
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-2"
                  >
                    <Home className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Button>
                </Link>
                <Link href="/upload">
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-2"
                  >
                    <Upload className="h-4 w-4" />
                    <span>Upload</span>
                  </Button>
                </Link>

                <div className="flex items-center space-x-4 border-l pl-4">
                  <span className="text-lg text-gray-700">Welcome</span>
                  <span className="text-lg text-black">{user.email}</span>
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="flex items-center space-x-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            {user && (
              <Button
                variant="ghost"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && user && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t">
              <Link href="/dashboard">
                <Button variant="ghost" className="w-full justify-start">
                  <Home className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <Link href="/upload">
                <Button variant="ghost" className="w-full justify-start">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </Link>
              <div className="pt-2 border-t">
                <p className="text-sm text-gray-500 px-3 py-2">{user.email}</p>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
