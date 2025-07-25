"use client";

import { useAuth } from "@/context/useAuth";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { logout, user } = useAuth();
  const router = useRouter();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow p-6 space-y-6">
        <h2 className="text-xl font-bold text-blue-600">Plataforma</h2>
        <nav className="space-y-2 text-gray-700">
          <button
            onClick={() => router.push("/colaborador")}
            className="block w-full text-left hover:text-blue-600"
          >
            Colaborador
          </button>
          <button
            onClick={() => router.push("/rh")}
            className="block w-full text-left hover:text-blue-600"
          >
            RH
          </button>
        </nav>
        <div className="pt-6 border-t text-sm text-gray-600 flex items-center justify-between">
          <span>{user?.email}</span>
          <button onClick={logout} className="hover:text-red-600">
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Conteúdo */}
      <main className="flex-1 bg-gray-100 p-6">{children}</main>
    </div>
  );
}
