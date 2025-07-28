"use client";

import ProtectedRoute from "@/components/protected-route";
import Dashboard from "./Dashboard";

// ... existing code from src/app/page.tsx ...

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  )};