'use client';

import { useState } from "react";
import { Bell, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "@/context/useAuth";
import { HomeDashboard } from "../components/Dashboard/HomeDashboard";
import { CaixaDeEntrada } from "../components/Dashboard/CaixaDeEntrada";
import { MensagensEnviadas } from "../components/Dashboard/MensagensEnviadas";

export default function RhDashboard() {
  const mensagensNaoVistas = { inbox: 3, enviadas: 2, ajuda: 1 };
  const [menuAberto, setMenuAberto] = useState(false);
  const [telaAtiva, setTelaAtiva] = useState<"home" | "inbox" | "enviadas">("home");
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`bg-white shadow-lg p-6 space-y-6 fixed md:static top-0 left-0 h-screen z-50 w-64 transition-transform duration-300 ease-in-out transform ${
          menuAberto ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-blue-600">RH Dashboard</h2>
          <button className="md:hidden" onClick={() => setMenuAberto(false)}>
            <X className="w-5 h-5 text-gray-700" />
          </button>
        </div>
        <nav className="space-y-3 text-gray-700 font-medium">
          <button
            onClick={() => setTelaAtiva("home")}
            className="flex justify-between w-full text-left hover:text-blue-600"
          >
            <span>Home</span>
          </button>
          <button
            onClick={() => setTelaAtiva("inbox")}
            className="flex justify-between w-full text-left hover:text-blue-600"
          >
            <span>Caixa de Entrada</span>
            <span className="bg-blue-600 text-white text-xs rounded-full px-2 flex items-center justify-center">
              {mensagensNaoVistas.inbox}
            </span>
          </button>
          <button
            onClick={() => setTelaAtiva("enviadas")}
            className="flex justify-between w-full text-left hover:text-blue-600"
          >
            <span>Mensagens Enviadas</span>
            <span className="bg-blue-600 text-white text-xs rounded-full px-2 flex items-center justify-center">
              {mensagensNaoVistas.enviadas}
            </span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        {/* Topbar */}
        <div className="bg-white shadow flex justify-between items-center px-6 py-4">
          <div className="flex items-center gap-4">
            <button className="md:hidden" onClick={() => setMenuAberto(true)}>
              <Menu className="w-5 h-5 text-gray-700" />
            </button>
            <h1 className="text-xl font-semibold">Painel do RH</h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative">
              <Bell className="text-gray-600 w-5 h-5" />
              {mensagensNaoVistas.ajuda > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {mensagensNaoVistas.ajuda}
                </span>
              )}
            </div>
            <span className="text-sm text-gray-600 hidden sm:block">{user?.email}</span>
            <button onClick={logout} className="text-gray-600 hover:text-red-600">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-6 grid gap-6">
          {telaAtiva === "home" && <HomeDashboard />}
          {telaAtiva === "inbox" && <CaixaDeEntrada />}
          {telaAtiva === "enviadas" && <MensagensEnviadas />}
        </div>
      </main>
    </div>
  );
}
