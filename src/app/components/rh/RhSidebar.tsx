// components/rh/RhSidebar.tsx
'use client';

import { LayoutDashboard, Inbox, UserPlus, LogOut, X } from 'lucide-react';
import { useAuth } from '@/context/useAuth';
import { useUserData } from '@/hooks/useUserData';
import { useUnreadCountRH } from '@/hooks/useUnreadCountRH';

interface RhSidebarProps {
  telaAtiva: 'home' | 'inbox' | 'adicionar' | 'enviadas';
  setTelaAtiva: (tela: RhSidebarProps['telaAtiva']) => void;
  menuAberto: boolean;
  setMenuAberto: (open: boolean) => void;
  mensagensNaoVistas?: {
    inbox?: number;
    enviadas?: number;
    ajuda?: number;
  };
}

export const RhSidebar = ({
  telaAtiva,
  setTelaAtiva,
  menuAberto,
  setMenuAberto,
}: RhSidebarProps) => {
  const { logout, user } = useAuth();

  // compat com seus dois formatos de hook:
  const ud = useUserData(user) as any;
  const empresaId = ud?.data?.empresaId ?? ud?.empresaId;

  // contador realtime de não lidas
  const { count: unreadCount } = useUnreadCountRH(empresaId);

  const handleClick = (tela: RhSidebarProps['telaAtiva']) => {
    setTelaAtiva(tela);
    setMenuAberto(false);
  };

  return (
    <>
      <aside
        className={`bg-emerald-950 text-emerald-50 shadow-lg p-6 space-y-6 fixed md:static top-0 left-0 h-screen z-50 w-64 transition-transform duration-300 ease-in-out transform ${
          menuAberto ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
        aria-label="Navegação RH"
      >
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-emerald-100">RH Dashboard</h2>
          <button
            className="md:hidden cursor-pointer"
            onClick={() => setMenuAberto(false)}
            aria-label="Fechar menu"
          >
            <X className="w-5 h-5 text-emerald-100" />
          </button>
        </div>

        <nav className="space-y-3 font-medium">
          <button
            onClick={() => handleClick('home')}
            className={`flex items-center gap-3 w-full p-2 rounded cursor-pointer transition-colors ${
              telaAtiva === 'home'
                ? 'bg-emerald-100 text-emerald-700'
                : 'text-emerald-50 hover:text-emerald-300'
            }`}
          >
            <LayoutDashboard size={18} />
            Home
          </button>

          <button
            onClick={() => handleClick('inbox')}
            className={`flex items-center justify-between w-full p-2 rounded cursor-pointer transition-colors ${
              telaAtiva === 'inbox'
                ? 'bg-emerald-100 text-emerald-700'
                : 'text-emerald-50 hover:text-emerald-300'
            }`}
          >
            <span className="flex items-center gap-3">
              <Inbox size={18} />
              Cx de Entrada
            </span>

            {unreadCount > 0 && (
              <span
                className="bg-emerald-600 text-white text-xs rounded-full px-2 py-0.5"
                aria-label={`${unreadCount} mensagens não lidas`}
              >
                {unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={() => handleClick('adicionar')}
            className={`flex items-center gap-3 w-full p-2 rounded cursor-pointer transition-colors ${
              telaAtiva === 'adicionar'
                ? 'bg-emerald-100 text-emerald-700'
                : 'text-emerald-50 hover:text-emerald-300'
            }`}
          >
            <UserPlus size={18} />
            Gestão de Usuários
          </button>
        </nav>

        <div className="pt-6 border-t border-emerald-800/50">
          <button
            onClick={() => {
              logout();
              setMenuAberto(false);
            }}
            className="flex items-center gap-3 text-emerald-300 hover:text-emerald-100 cursor-pointer"
          >
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </aside>

      {/* overlay mobile */}
      {menuAberto && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMenuAberto(false)}
          aria-hidden
        />
      )}
    </>
  );
};
