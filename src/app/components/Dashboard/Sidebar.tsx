'use client';

import {
  LogOut,
  LayoutDashboard,
  Inbox,
  Send,
  UserPlus,
  Settings,
  Bell,
  ChevronDown,
  BrainCircuit,
} from 'lucide-react';
import { useAuth } from '@/context/useAuth';

interface SidebarProps {
  telaAtiva: string;
  setTelaAtiva: (tela: any) => void;
  mensagensNaoVistas: { inbox: number; enviadas: number };
}

export const Sidebar = ({
  telaAtiva,
  setTelaAtiva,
  mensagensNaoVistas,
}: SidebarProps) => {
  const { logout } = useAuth();

  const menuAtendimento = [
    {
      id: 'home',
      label: 'Visão geral',
      icon: LayoutDashboard,
    },
    {
      id: 'inbox',
      label: 'Cx. de Entrada',
      icon: Inbox,
      badge: mensagensNaoVistas.inbox,
    },
    {
      id: 'enviadas',
      label: 'Mensagens',
      icon: Send,
      badge: mensagensNaoVistas.enviadas,
    },
  ];

  const menuGestao = [
    {
      id: 'adicionar',
      label: 'Usuários',
      icon: UserPlus,
    },
    {
      id: 'alertas',
      label: 'Alertas',
      icon: Bell,
    },
    {
      id: 'configuracoes',
      label: 'Configurações',
      icon: Settings,
    },
  ];

  const renderMenuItem = (item: any) => {
    const Icon = item.icon;
    const isActive = telaAtiva === item.id;

    return (
      <button
        key={item.id}
        onClick={() => setTelaAtiva(item.id)}
        className={`
          group flex w-full items-center justify-between rounded-xl px-3 py-3 text-sm transition-all
          ${
            isActive
              ? 'bg-white/15 text-white shadow-sm'
              : 'text-emerald-50/80 hover:bg-white/10 hover:text-white'
          }
        `}
      >
        <span className="flex items-center gap-3">
          <span
            className={`
              flex h-8 w-8 items-center justify-center rounded-lg transition-all
              ${
                isActive
                  ? 'bg-emerald-400/20 text-emerald-300'
                  : 'bg-white/5 text-emerald-50/70 group-hover:text-emerald-300'
              }
            `}
          >
            <Icon size={18} />
          </span>

          {item.label}
        </span>

        {item.badge > 0 && (
          <span
            className={`
              min-w-6 rounded-full px-2 py-0.5 text-xs font-semibold
              ${
                isActive
                  ? 'bg-emerald-300 text-emerald-950'
                  : 'bg-emerald-500 text-white'
              }
            `}
          >
            {item.badge}
          </span>
        )}
      </button>
    );
  };

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-72 flex-col justify-between overflow-hidden bg-gradient-to-b from-emerald-950 via-emerald-950 to-teal-950 px-4 py-5 text-white shadow-2xl">
      <div>
        <div className="mb-8 flex items-center gap-3 px-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-300/25">
            <BrainCircuit size={26} />
          </div>

          <div>
            <h1 className="text-xl font-bold tracking-wide">PREVISIVA</h1>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-300">
              Cuidar antes
            </p>
          </div>
        </div>

        <nav className="space-y-7">
          <div>
            <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-emerald-100/45">
              Painel
            </p>

            <div className="space-y-1.5">
              {menuAtendimento.map(renderMenuItem)}
            </div>
          </div>

          <div>
            <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-emerald-100/45">
              Gestão
            </p>

            <div className="space-y-1.5">
              {menuGestao.map(renderMenuItem)}
            </div>
          </div>
        </nav>
      </div>

      <div className="space-y-3">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-emerald-50/80 transition hover:bg-white/10 hover:text-white"
        >
          <LogOut size={18} />
          Sair
        </button>

        <div className="flex items-center justify-between rounded-2xl bg-white/10 p-3 ring-1 ring-white/10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-300 text-sm font-bold text-emerald-950">
              W
            </div>

            <div>
              <p className="text-sm font-semibold">Willzao Silva</p>
              <p className="text-xs text-emerald-50/60">Administrador</p>
            </div>
          </div>

          <ChevronDown size={16} className="text-emerald-50/60" />
        </div>
      </div>
    </aside>
  );
};