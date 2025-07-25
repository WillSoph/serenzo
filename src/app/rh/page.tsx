// app/rh/page.tsx
"use client";

import RhDashboard from "./RhDashboard";
import { ProtectedRoute } from "../components/ProtectedRoute";

export default function RhPage() {
  return (
    <ProtectedRoute allowedRoles={["admin", "rh"]}>
      <RhDashboard />
    </ProtectedRoute>
  );
}
