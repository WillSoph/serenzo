'use client';

import { LogOut, LayoutDashboard, Inbox, Send, UserPlus } from 'lucide-react';
import { useAuth } from '@/context/useAuth';

interface SidebarProps {
  telaAtiva: string;
  setTelaAtiva: (tela: any) => void;
  mensagensNaoVistas: { inbox: number; enviadas: number };
}

export const Sidebar = ({ telaAtiva, setTelaAtiva, mensagensNaoVistas }: SidebarProps) => {
  const { logout } = useAuth();

  return (
    <aside className="bg-white w-64 h-screen fixed shadow-md flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-center py-6 text-xl font-bold text-blue-600 border-b">
          <span className="text-2xl">🧠</span> RH Dashboard
        </div>

        <nav className="mt-6 flex flex-col space-y-2 px-4 text-gray-700 font-medium">
          <button
            onClick={() => setTelaAtiva("home")}
            className={`flex items-center gap-3 p-2 rounded hover:bg-blue-100 ${
              telaAtiva === "home" ? "bg-blue-100 text-blue-600" : ""
            }`}
          >
            <LayoutDashboard size={18} />
            Home
          </button>

          <button
            onClick={() => setTelaAtiva("inbox")}
            className={`flex items-center justify-between p-2 rounded hover:bg-blue-100 ${
              telaAtiva === "inbox" ? "bg-blue-100 text-blue-600" : ""
            }`}
          >
            <span className="flex items-center gap-3">
              <Inbox size={18} />
              Caixa de Entrada
            </span>
            {mensagensNaoVistas.inbox > 0 && (
              <span className="bg-blue-600 text-white text-xs rounded-full px-2">
                {mensagensNaoVistas.inbox}
              </span>
            )}
          </button>

          <button
            onClick={() => setTelaAtiva("enviadas")}
            className={`flex items-center justify-between p-2 rounded hover:bg-blue-100 ${
              telaAtiva === "enviadas" ? "bg-blue-100 text-blue-600" : ""
            }`}
          >
            <span className="flex items-center gap-3">
              <Send size={18} />
              Mensagens Enviadas
            </span>
            {mensagensNaoVistas.enviadas > 0 && (
              <span className="bg-blue-600 text-white text-xs rounded-full px-2">
                {mensagensNaoVistas.enviadas}
              </span>
            )}
          </button>

          <button
            onClick={() => setTelaAtiva("adicionar")}
            className={`flex items-center gap-3 p-2 rounded hover:bg-blue-100 ${
              telaAtiva === "adicionar" ? "bg-blue-100 text-blue-600" : ""
            }`}
          >
            <UserPlus size={18} />
            Adicionar Usuário
          </button>
        </nav>
      </div>

      <div className="p-4 border-t">
        <button
          onClick={logout}
          className="w-full text-left flex items-center gap-3 text-emerald-500 hover:underline cursor-pointer"
        >
          <LogOut size={18} /> Sair
        </button>
      </div>
    </aside>
  );
};
