"use client";

import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function UserNav() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return (
      <div className="flex items-center gap-2 px-3 py-2">
        <div className="w-8 h-8 rounded-lg glass-light animate-pulse"></div>
        <div className="w-16 h-3 rounded glass-light animate-pulse"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center">
        <Button 
          onClick={() => router.push("/auth/signin?callbackUrl=/dashboard")} 
          className="px-4 py-2 rounded-lg glass-light border border-white/20 hover:border-blue-500/50 hover:bg-blue-500/10 transition-all duration-300 hover:scale-105 font-semibold text-sm"
        >
          <span className="golden-gradient-text">Login</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 px-3 py-2">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 via-purple-500 to-blue-600 flex items-center justify-center shadow-lg border border-white/20">
          <span className="text-white font-bold text-xs">
            {session.user?.name?.[0] || session.user?.email?.[0] || "U"}
          </span>
        </div>
        <div className="hidden md:block">
          <p className="text-sm font-medium text-white">{session.user?.name || "User"}</p>
          <p className="text-xs text-gray-300">{session.user?.email}</p>
        </div>
      </div>
      
      <Button 
        onClick={() => signOut({ callbackUrl: "/" })} 
        className="px-3 py-1 text-xs rounded-lg glass-light border border-white/20 hover:border-red-500/50 hover:bg-red-500/10 text-gray-300 hover:text-red-300 transition-all duration-300"
      >
        Sign Out
      </Button>
    </div>
  );
} 