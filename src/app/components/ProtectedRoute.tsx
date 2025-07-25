// components/ProtectedRoute.tsx
"use client";

import { useAuth } from "@/context/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: ("admin" | "rh" | "colaborador")[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, tipo, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/"); // Redireciona para landing page se não logado
      } else if (!tipo || !allowedRoles.includes(tipo)) {
        router.push("/"); // Redireciona se tipo não for permitido
      }
    }
  }, [user, tipo, loading, router, allowedRoles]);

  if (loading || !user || !tipo) return null;

  return <>{children}</>;
}
