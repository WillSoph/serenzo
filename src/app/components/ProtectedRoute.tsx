"use client";

import { useAuth } from "@/context/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type BaseRole = "admin" | "rh" | "colaborador";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: BaseRole[];
}

// normaliza qualquer string de role para "admin" | "rh" | "colaborador"
function normalizeRole(input?: string | null): BaseRole | undefined {
  if (!input) return undefined;
  const key = String(input).trim().toLowerCase();

  if (["admin", "administrator", "adm"].includes(key)) return "admin";
  if (["rh", "recursoshumanos", "gestaorh"].includes(key)) return "rh";
  if (["colaborador", "comum", "user", "funcionario"].includes(key)) return "colaborador";

  // fallback: trate qualquer desconhecido como colaborador, se preferir
  // return "colaborador";
  return undefined;
}

function defaultRouteFor(role?: BaseRole) {
  if (role === "admin") return "/admin";
  if (role === "rh") return "/rh";
  if (role === "colaborador") return "/colaborador";
  return "/";
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, tipo, loading } = useAuth();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // evita piscar conteúdo antigo
    setAuthorized(false);

    if (loading) return;               // espera auth carregar
    if (!user) {                       // não autenticado
      router.replace("/");
      return;
    }

    const role = normalizeRole(tipo);  // <-- aqui está a correção
    if (!role) {
      // ainda sem role conhecida; pode só aguardar ou mandar para colaborador
      // router.replace("/colaborador");
      return;
    }

    // se o papel normalizado não está na lista permitida, manda para a rota padrão dele
    if (!allowedRoles.includes(role)) {
      router.replace(defaultRouteFor(role));
      return;
    }

    setAuthorized(true);
  }, [user, tipo, loading, router, allowedRoles]);

  if (loading || !authorized) {
    return <div className="w-full h-screen bg-white" />; // placeholder
  }

  return <>{children}</>;
}
