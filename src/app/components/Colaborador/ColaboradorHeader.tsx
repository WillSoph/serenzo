// components/Colaborador/ColaboradorHeader.tsx
'use client';

import {
  Bell,
  Menu,
  UserCircle2,
} from 'lucide-react';
import { useAuth } from '@/context/useAuth';

interface ColaboradorHeaderProps {
  mensagensNaoVistas: {
    inbox: number;
    enviadas: number;
    ajuda: number;
  };
  onMenuClick?: () => void;
}

export const ColaboradorHeader = ({
  mensagensNaoVistas,
  onMenuClick,
}: ColaboradorHeaderProps) => {
  const { user } = useAuth();

  const totalNotificacoes =
    (mensagensNaoVistas?.inbox || 0) +
    (mensagensNaoVistas?.enviadas || 0) +
    (mensagensNaoVistas?.ajuda || 0);

  const primeiraLetra =
    user?.email?.charAt(0).toUpperCase() || 'C';

  return (
    <header className="fixed top-0 right-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-6 backdrop-blur-sm md:left-72">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="rounded-xl p-2 text-slate-600 transition hover:bg-slate-100 md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Área do Colaborador
          </h1>

          <p className="text-sm text-slate-500">
            Compartilhe feedbacks e acompanhe respostas do RH
          </p>
        </div>
      </div>

      <div className="flex items-center gap-5">
        <button className="relative rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700">
          <Bell className="h-5 w-5" />

          {totalNotificacoes > 0 && (
            <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-emerald-500" />
          )}
        </button>

        <div className="flex items-center gap-3 border-l border-slate-200 pl-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 font-semibold text-emerald-700">
            {primeiraLetra}
          </div>

          <div className="hidden text-left sm:block">
            <p className="text-sm font-semibold text-slate-900">
              Área do Colaborador
            </p>

            <p className="text-xs text-slate-500">
              {user?.email}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};