// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";
// import axios from "axios";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { FileText, Mail, Lock } from "lucide-react";
// import { FcGoogle } from "react-icons/fc";

// const handleGoogleLogin = () => {
//   window.location.href = `${API_BASE_URL}/auth/login/go`; // redirect to backend
// };
// const API_BASE_URL =
//   process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

// export default function Login() {
//   const [formData, setFormData] = useState({
//     email: "",
//     password: "",
//   });
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);
//   const router = useRouter();

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");

//     try {
//       const response = await axios.post(
//         `${API_BASE_URL}/auth/signin`,
//         {
//           email: formData.email,
//           password: formData.password,
//         },
//         {
//           withCredentials: true, // Important for cookie-based auth
//         }
//       );

//       if (response.status === 200) {

//         // router.push("/");

//         window.location.href = "/";
//       }
//     } catch (err: any) {
//       setError(
//         err.response?.data?.detail ||
//           "Login failed. Please check your credentials."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
//       <Card className="w-full max-w-md shadow-xl">
//         <CardHeader className="space-y-1 text-center">
//           <div className="flex justify-center mb-4">
//             <FileText className="h-12 w-12 text-blue-600" />
//           </div>
//           <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
//           <CardDescription>
//             Sign in to your collaborative notes account
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <form onSubmit={handleSubmit} className="space-y-4">
//             {error && (
//               <Alert variant="destructive">
//                 <AlertDescription>{error}</AlertDescription>
//               </Alert>
//             )}

//             <div className="space-y-2">
//               <label
//                 htmlFor="email"
//                 className="text-sm font-medium flex items-center"
//               >
//                 <Mail className="h-4 w-4 mr-2" />
//                 Email
//               </label>
//               <Input
//                 id="email"
//                 name="email"
//                 type="email"
//                 required
//                 value={formData.email}
//                 onChange={handleChange}
//                 placeholder="Enter your email"
//                 className="pl-10"
//               />
//             </div>

//             <div className="space-y-2">
//               <label
//                 htmlFor="password"
//                 className="text-sm font-medium flex items-center"
//               >
//                 <Lock className="h-4 w-4 mr-2" />
//                 Password
//               </label>
//               <Input
//                 id="password"
//                 name="password"
//                 type="password"
//                 required
//                 value={formData.password}
//                 onChange={handleChange}
//                 placeholder="Enter your password"
//                 className="pl-10"
//               />
//             </div>

//             <Button type="submit" className="w-full" disabled={loading}>
//               {loading ? "Signing in..." : "Sign in"}
//             </Button>

//             <div className="text-center text-sm">
//               {"Don't have an account? "}
//               <Link
//                 href="/signup"
//                 className="text-blue-600 hover:underline font-medium"
//               >
//                 Sign up
//               </Link>

//             </div>
//           </form>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

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

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

// A simple popup component built with your existing UI components
const CookieConsentPopup = ({
  onAccept,
  onDecline,
}: {
  onAccept: () => void;
  onDecline: () => void;
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Cookie Consent</CardTitle>
          <CardDescription>
            To keep you logged in, we need to store a secure cookie in your
            browser. Do you agree?
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-end gap-2">
          <Button variant="outline" onClick={onDecline}>
            Decline
          </Button>
          <Button onClick={onAccept}>Accept</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showConsentPopup, setShowConsentPopup] = useState(false); // State to control the popup
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // This is the actual login logic
  const proceedWithLogin = async () => {
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
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        window.location.href = "/dashboard";
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

  // The form's submit handler now checks for consent first
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const consent = localStorage.getItem("loginCookieConsent");

    if (consent === "true") {
      // If consent was already given, log in directly
      proceedWithLogin();
    } else if (consent === "false") {
      // If consent was declined, inform the user
      setError(
        "Cookie consent is required to log in. Please enable cookies in your settings or accept the prompt."
      );
    } else {
      // If no choice has been made, show the popup
      setShowConsentPopup(true);
    }
  };

  const handleConsentAccept = () => {
    localStorage.setItem("loginCookieConsent", "true");
    setShowConsentPopup(false);
    proceedWithLogin(); // Continue to log in
  };

  const handleConsentDecline = () => {
    localStorage.setItem("loginCookieConsent", "false");
    setShowConsentPopup(false);
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

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
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

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
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
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Conditionally render the popup */}
      {showConsentPopup && (
        <CookieConsentPopup
          onAccept={handleConsentAccept}
          onDecline={handleConsentDecline}
        />
      )}
    </div>
  );
}
