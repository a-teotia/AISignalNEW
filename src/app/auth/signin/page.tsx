"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SignInPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  // Check for success message from URL params
  useEffect(() => {
    const message = searchParams.get("message");
    if (message) {
      setSuccess(message);
    }
  }, [searchParams]);

  // Redirect if already signed in
  useEffect(() => {
    if (status === "authenticated" && session) {
      const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
      router.push(callbackUrl);
    }
  }, [status, session, router, searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(""); // Clear error when user types
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else if (result?.ok) {
        router.push(result.url || callbackUrl);
      }
    } catch (err) {
      setError("An error occurred during sign in");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#111]">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#111] relative overflow-hidden">
      {/* Subtle SVG background, no animation */}
      <svg className="absolute inset-0 w-full h-full z-0 pointer-events-none" viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg" style={{opacity: 0.13}}>
        <rect x="80" y="120" width="240" height="180" rx="32" stroke="#FFD700" strokeWidth="1.5"/>
        <rect x="400" y="60" width="320" height="220" rx="40" stroke="#FFD700" strokeWidth="1.2"/>
        <rect x="120" y="400" width="320" height="220" rx="36" stroke="#FFD700" strokeWidth="1.1"/>
        <rect x="480" y="380" width="220" height="180" rx="28" stroke="#FFD700" strokeWidth="1.3"/>
        <circle cx="200" cy="600" r="24" stroke="#FFD700" strokeWidth="1.1"/>
        <circle cx="650" cy="200" r="16" stroke="#FFD700" strokeWidth="1.1"/>
        <path d="M320 200 Q400 300 480 200" stroke="#FFD700" strokeWidth="1" fill="none"/>
        <path d="M200 600 Q400 700 600 600" stroke="#FFD700" strokeWidth="1" fill="none"/>
      </svg>
      <Card className="glass border-2 border-[color:var(--gold)] rounded-2xl shadow-2xl max-w-md w-full p-10 relative z-10 animate-fade-in-up">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl md:text-4xl font-extrabold gradient-text mb-2 font-serif">Welcome Back</CardTitle>
          <CardDescription className="text-white/80 mb-4 text-lg">Sign in to your <span className="gold-accent font-bold">AI Signal</span> account</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 rounded-lg bg-[#FFD700]/10 border border-[#FFD700] text-[#FFD700] text-sm font-semibold flex items-center gap-2">
                <svg width="20" height="20" fill="none"><circle cx="10" cy="10" r="10" fill="#FFD700" opacity="0.18"/><path d="M5 10h10" stroke="#FFD700" strokeWidth="1.5"/></svg>
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 rounded-lg bg-green-500/20 border border-green-400 text-green-300 text-sm font-semibold flex items-center gap-2">
                <svg width="20" height="20" fill="none"><circle cx="10" cy="10" r="10" fill="#22c55e" opacity="0.18"/><path d="M5 10h10" stroke="#22c55e" strokeWidth="1.5"/></svg>
                {success}
              </div>
            )}
            <Input
              name="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="text-lg px-4 py-3 rounded-xl bg-black/40 border border-[color:var(--gold)] text-white focus:border-[color:var(--gold)] focus:ring-2 focus:ring-[color:var(--gold)]"
            />
            <Input
              name="password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="text-lg px-4 py-3 rounded-xl bg-black/40 border border-[color:var(--gold)] text-white focus:border-[color:var(--gold)] focus:ring-2 focus:ring-[color:var(--gold)]"
            />
            <Button 
              type="submit" 
              disabled={loading}
              size="lg"
              className="bg-[color:var(--gold)] text-black rounded-xl font-bold shadow px-6 py-2 hover:bg-white hover:text-black transition-colors text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gold)] w-full"
            >
              {loading ? "Signing In..." : "Sign In"}
            </Button>
          </form>
          <div className="mt-6 text-center text-white/70 text-base">
            Don't have an account?{' '}
            <a href="/auth/signup" className="gold-accent font-bold hover:underline">Sign up</a>
          </div>
        </CardContent>
      </Card>
      {/* Pulsing gold glow animation keyframes */}
      <style jsx global>{`
        .animate-gold-glow { display: none; }
      `}</style>
    </div>
  );
} 