'use client';

import { ReactNode, useEffect, useState } from 'react';
import { RhSidebar } from '../rh/RhSidebar';
import { RhHeader } from '../rh/RhHeader';

interface LayoutDashboardProps {
  children: ReactNode;
  telaAtiva: any;
  setTelaAtiva: (tela: any) => void;
  mensagensNaoVistas: { inbox: number; enviadas: number; ajuda: number };
}

export const LayoutDashboard = ({
  children,
  telaAtiva,
  setTelaAtiva,
  mensagensNaoVistas,
}: LayoutDashboardProps) => {
  const [menuAberto, setMenuAberto] = useState(false);

  useEffect(() => {
    if (menuAberto) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
  }, [menuAberto]);

  return (
    <div className="h-screen overflow-hidden bg-slate-50">
      <RhSidebar
        telaAtiva={telaAtiva}
        setTelaAtiva={setTelaAtiva}
        mensagensNaoVistas={mensagensNaoVistas}
        menuAberto={menuAberto}
        setMenuAberto={setMenuAberto}
      />

      <div className="h-screen md:ml-72">
        <RhHeader
          mensagensNaoVistas={mensagensNaoVistas}
          onMenuClick={() => setMenuAberto(true)}
        />

        <main className="h-[calc(100vh-5rem)] overflow-y-auto px-6 pt-24 pb-8">
          {children}
        </main>
      </div>
    </div>
  );
};
