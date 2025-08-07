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
    console.log("[ProtectedRoute] Estado atual →", {
      loading,
      user,
      tipo,
    });
  
    if (loading) return; // Aguarde o loading terminar
  
    if (!user) {
      console.log("[ProtectedRoute] Redirecionando: usuário não autenticado");
      router.replace("/");
      return;
    }
  
    if (tipo === undefined) {
      console.log("[ProtectedRoute] Tipo ainda não carregado...");
      return;
    }
  
    if (!allowedRoles.includes(tipo)) {
      console.log("[ProtectedRoute] Redirecionando: tipo não permitido", tipo);
      router.replace("/");
      return;
    }
  
    console.log("[ProtectedRoute] Acesso permitido para tipo:", tipo);
    setAuthorized(true);
  }, [user, tipo, loading, router, allowedRoles]);
  

  if (loading || tipo === undefined || !authorized) {
    return <div className="w-full h-screen bg-white" />; // Placeholder visível
  }

  return <>{children}</>;
}
