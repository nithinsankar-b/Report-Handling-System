"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function HomePage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const ADMIN_EMAIL = "admin@servihub.com";
    
    try {
      // First verify if the email exists in the database
      const response = await fetch(`/api/users/getUserByEmail?email=${email}`);
      
      // Parse the response data
      const result = await response.json();
      
      // Check if the API returned success: false
      if (!result.success) {
        setError("Invalid email address. Please check your email.");
        toast.error("Invalid email address. Please check your email.");
        setLoading(false);
        return;
      }
      
      // Verify the user data exists
      if (!result.data || !result.data.id) {
        setError("User data incomplete. Please contact support.");
        toast.error("User data incomplete. Please contact support.");
        setLoading(false);
        return;
      }
      
      // Email exists in database, proceed with login
      localStorage.setItem("userEmail", email);
      
      // Redirect based on user type
      if (email === ADMIN_EMAIL) {
        toast.success("Welcome Admin!");
        router.push("/admin");
      } else {
        toast.success(`Welcome ${result.data.name}!`);
        router.push("/user");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("An error occurred. Please try again.");
      toast.error("An error occurred. Please try again.");
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-indigo-700 py-6 px-8 shadow-md">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <line x1="10" y1="9" x2="8" y2="9"></line>
            </svg>
            <h1 className="text-2xl font-bold text-white">ServiHub Reports</h1>
          </div>
          <div className="hidden md:flex space-x-4">
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center p-6">
        <div className="flex w-full max-w-5xl mx-auto">
          {/* Left Column: Info */}
          <div className="hidden md:flex md:flex-col md:w-1/2 pr-12 justify-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              Streamline Report Management
            </h2>
            <p className="text-gray-600 mb-6">
              Welcome to ServiHub Report Handling System. Track, manage, and analyze all your reports in one centralized platform.
            </p>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="bg-indigo-100 p-2 rounded-full mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-700">
                    <polyline points="9 11 12 14 22 4"></polyline>
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                  </svg>
                </div>
                <span className="text-gray-700">Real-time report tracking</span>
              </div>
              <div className="flex items-center">
                <div className="bg-indigo-100 p-2 rounded-full mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-700">
                    <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"></path>
                    <path d="M12 6v6l4 2"></path>
                  </svg>
                </div>
                <span className="text-gray-700">Automated response system</span>
              </div>
            </div>
          </div>

          {/* Right Column: Login Form */}
          <div className="w-full md:w-1/2">
            <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200">
              <div className="text-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Sign In</h2>
                <p className="text-gray-500 mt-2">Access your reports dashboard</p>
              </div>
              
              <form onSubmit={handleLogin} className="space-y-2">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full p-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                
                <Button
  type="submit"
  disabled={loading}
  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md shadow transition-colors"
>
  {loading ? "Checking..." : "Sign In"}
</Button>

{error && (
  <div className="mt-2 text-center">
    <p className="text-sm text-red-600">{error}</p>
  </div>
)}
              </form>
              
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500">
                  Need access? Contact host at nithinsankar.b@outlook.com
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 border-t border-gray-200 py-6">
        <div className="max-w-6xl mx-auto px-8 text-center text-gray-500 text-sm">
          <p>© 2025 ServiHub Report System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}