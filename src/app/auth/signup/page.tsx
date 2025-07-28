"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(""); // Clear error when user types
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Signup failed");
      }

      // Success - redirect to signin
      router.push("/auth/signin?message=Account created successfully! Please sign in.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during signup");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#111] relative overflow-hidden">
      {/* Subtle SVG background, no animation (matches signin page) */}
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
          <CardTitle className="text-3xl md:text-4xl font-extrabold gradient-text mb-2 font-serif">Create Account</CardTitle>
          <CardDescription className="text-white/80 mb-4 text-lg">Join <span className="gold-accent font-bold">AI Signal</span> for advanced trading insights</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 rounded-lg bg-[#FFD700]/10 border border-[#FFD700] text-[#FFD700] text-sm font-semibold flex items-center gap-2">
                <svg width="20" height="20" fill="none"><circle cx="10" cy="10" r="10" fill="#FFD700" opacity="0.18"/><path d="M5 10h10" stroke="#FFD700" strokeWidth="1.5"/></svg>
                {error}
              </div>
            )}
            <Input
              name="name"
              type="text"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="text-lg px-4 py-3 rounded-xl bg-black/40 border border-[color:var(--gold)] text-white focus:border-[color:var(--gold)] focus:ring-2 focus:ring-[color:var(--gold)]"
            />
            <Input
              name="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="text-lg px-4 py-3 rounded-xl bg-black/40 border border-[color:var(--gold)] text-white focus:border-[color:var(--gold)] focus:ring-2 focus:ring-[color:var(--gold)]"
            />
            <Input
              name="password"
              type="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="text-lg px-4 py-3 rounded-xl bg-black/40 border border-[color:var(--gold)] text-white focus:border-[color:var(--gold)] focus:ring-2 focus:ring-[color:var(--gold)]"
            />
            <Input
              name="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
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
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>
          <div className="mt-6 text-center text-white/70 text-base">
            Already have an account?{' '}
            <a href="/auth/signin" className="gold-accent font-bold hover:underline">Sign in</a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 