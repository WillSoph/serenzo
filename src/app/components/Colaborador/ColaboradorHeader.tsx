// RhHeader.tsx
'use client';

import { Bell } from 'lucide-react';
import { useAuth } from '@/context/useAuth';

interface RhHeaderProps {
  mensagensNaoVistas: { inbox: number; enviadas: number; ajuda: number };
  onMenuClick?: () => void;
}

export const ColaboradorHeader = ({ mensagensNaoVistas, onMenuClick }: RhHeaderProps) => {
  const { user } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 shadow-sm flex items-center px-4 z-40 md:ml-64">
      {/* Botão de menu hamburguer (visível apenas no mobile) */}
      {/* {onMenuClick && ( */}
        <button
          onClick={onMenuClick}
          className="md:hidden mr-4 p-2 text-gray-600 hover:text-black focus:outline-none cursor-pointer"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      {/* )} */}

      <h1 className="text-lg font-semibold">Painel do Colaborador</h1>

      <div className="ml-auto flex items-center space-x-4">
        <div className="relative">
          <Bell className="w-6 h-6 text-gray-700" />
          {(mensagensNaoVistas?.inbox || mensagensNaoVistas?.ajuda) > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">
              {mensagensNaoVistas.inbox + mensagensNaoVistas.ajuda}
            </span>
          )}
        </div>
        <div className="text-sm text-gray-700">{user?.email}</div>
      </div>
    </header>
  );
};
