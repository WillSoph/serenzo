"use client";

import { useAuth } from "@/context/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: ("admin" | "rh" | "colaborador")[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, tipo, loading } = useAuth();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/"); // Redireciona para landing page se não logado
      } else if (!tipo || !allowedRoles.includes(tipo)) {
        router.replace("/"); // Redireciona se tipo não for permitido
      } else {
        setAuthorized(true);
      }
    }
  }, [user, tipo, loading, router, allowedRoles]);

  if (loading || !authorized) {
    return <div className="w-full h-screen bg-white" />; // placeholder visível
  }

  return <>{children}</>;
}
