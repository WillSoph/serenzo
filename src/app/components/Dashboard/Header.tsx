'use client';

import { Bell } from 'lucide-react';
import { useAuth } from '@/context/useAuth';

interface HeaderProps {
  mensagensNaoVistas: { ajuda: number };
}

export const Header = ({ mensagensNaoVistas }: HeaderProps) => {
  const { user } = useAuth();

  return (
    <header className="bg-white shadow-sm flex justify-between items-center px-6 h-16 ml-64 fixed top-0 right-0 left-0">
      <h1 className="text-lg font-semibold">Painel do RH</h1>
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
      </div>
    </header>
  );
};
