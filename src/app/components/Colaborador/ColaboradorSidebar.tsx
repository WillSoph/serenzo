// ColaboradorSidebar.tsx
'use client';

import { LayoutDashboard, Inbox, LogOut, X } from 'lucide-react';
import { useAuth } from '@/context/useAuth';

interface ColaboradorSidebarProps {
  telaAtiva: string;
  setTelaAtiva: (tela: any) => void;
  mensagensNaoVistas: { inbox: number };
  menuAberto: boolean;
  setMenuAberto: (open: boolean) => void;
}

export const ColaboradorSidebar = ({
  telaAtiva,
  setTelaAtiva,
  mensagensNaoVistas,
  menuAberto,
  setMenuAberto,
}: ColaboradorSidebarProps) => {
  const { logout } = useAuth();

  const handleClick = (tela: string) => {
    setTelaAtiva(tela);
    setMenuAberto(false); // Fecha o menu no mobile
  };

  return (
    <>
      {/* Overlay escurecido */}
      {menuAberto && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMenuAberto(false)}
        />
      )}

      <aside
        className={`bg-emerald-950 shadow-lg p-6 space-y-6 fixed md:static top-0 left-0 h-screen z-50 w-64 transition-transform duration-300 ease-in-out transform ${
          menuAberto ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-emerald-100">Colaborador</h2>
          <button className="md:hidden cursor-pointer" onClick={() => setMenuAberto(false)}>
            <X className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        <nav className="space-y-3 text-gray-700 font-medium">
          <button
            onClick={() => handleClick('home')}
            className={`flex text-emerald-50 items-center gap-3 w-full p-2 rounded cursor-pointer ${
              telaAtiva === 'home' ? 'bg-emerald-100 text-emerald-600' : 'hover:text-emerald-600'
            }`}
          >
            <LayoutDashboard size={18} />
            Início
          </button>

          <button
            onClick={() => handleClick('inbox')}
            className={`flex text-emerald-50 items-center justify-between w-full p-2 rounded cursor-pointer ${
              telaAtiva === 'inbox' ? 'bg-emerald-100 text-emerald-600' : 'hover:text-emerald-600'
            }`}
          >
            <span className="flex items-center gap-3">
              <Inbox size={18} />
              Caixa de Entrada
            </span>
            <span className="bg-emerald-600 text-white text-xs rounded-full px-2">
              {mensagensNaoVistas.inbox}
            </span>
          </button>
        </nav>

        <div className="pt-6 border-t">
          <button
            onClick={() => {
              logout();
              setMenuAberto(false);
            }}
            className="flex items-center gap-3 text-emerald-500 hover:underline cursor-pointer"
          >
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </aside>
    </>
  );
};
