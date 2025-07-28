"use client";

import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function UserNav() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-muted animate-pulse"></div>
        <div className="w-20 h-4 rounded bg-muted animate-pulse"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center gap-2">
        <Button 
          onClick={() => router.push("/auth/signin?callbackUrl=/dashboard")} 
          size="lg"
          className="px-6 py-2 rounded-xl font-semibold text-base shadow bg-[color:var(--gold)] text-black hover:bg-white hover:text-black transition-colors"
        >
          Login
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[color:var(--gold)] to-[color:var(--gold)]/80 flex items-center justify-center">
          <span className="text-black font-bold text-xs">
            {session.user?.name?.[0] || session.user?.email?.[0] || "U"}
          </span>
        </div>
        <div className="hidden md:block">
          <p className="text-sm font-medium text-white">{session.user?.name || "User"}</p>
          <p className="text-xs text-white/70">{session.user?.email}</p>
        </div>
      </div>
      
      <Button 
        onClick={() => signOut({ callbackUrl: "/" })} 
        variant="ghost" 
        size="sm"
        className="text-white/70 hover:text-white"
      >
        Sign Out
      </Button>
    </div>
  );
} 