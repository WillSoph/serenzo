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
    console.log("ABRIU")
    if (menuAberto) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
  }, [menuAberto]);

  return (
    <div className="flex">
      <RhSidebar
        telaAtiva={telaAtiva}
        setTelaAtiva={setTelaAtiva}
        mensagensNaoVistas={mensagensNaoVistas}
        menuAberto={menuAberto}
        setMenuAberto={setMenuAberto}
      />
      <div className="flex-1 md:ml-64">
      <RhHeader
        mensagensNaoVistas={mensagensNaoVistas}
        onMenuClick={() => setMenuAberto(true)}
      />
        <main className="pt-20 px-6">{children}</main>
      </div>
    </div>
  );
};
