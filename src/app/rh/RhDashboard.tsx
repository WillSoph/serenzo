'use client';

import { useState } from 'react';
import { Bell, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '@/context/useAuth';
import { HomeDashboard } from '../components/Dashboard/HomeDashboard';
import { CaixaDeEntrada } from '../components/Dashboard/CaixaDeEntrada';
import { MensagensEnviadas } from '../components/Dashboard/MensagensEnviadas';
import GestaoUsuarios from '../components/rh/GestaoUsuarios';
import { RhSidebar } from '../components/rh/RhSidebar';
import { RhHeader } from '../components/rh/RhHeader';

export default function RhDashboard() {
  const mensagensNaoVistas = { inbox: 3, enviadas: 2, ajuda: 1 };
  const [menuAberto, setMenuAberto] = useState(false);
  const [telaAtiva, setTelaAtiva] = useState<'home' | 'inbox' | 'enviadas' | 'adicionar'>('home');
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-gray-100 overflow-x-hidden">
      <RhSidebar
        telaAtiva={telaAtiva}
        setTelaAtiva={setTelaAtiva}
        mensagensNaoVistas={mensagensNaoVistas}
        menuAberto={menuAberto}
        setMenuAberto={setMenuAberto}
      />

      <main className="flex-1 ml-0">
      <RhHeader
        mensagensNaoVistas={mensagensNaoVistas}
        onMenuClick={() => setMenuAberto(true)}
      />

        <div className="pt-20 p-6 max-w-screen max-h-screen">
          {telaAtiva === 'home' && <HomeDashboard />}
          {telaAtiva === 'inbox' && <CaixaDeEntrada />}
          {telaAtiva === 'enviadas' && <MensagensEnviadas />}
          {telaAtiva === 'adicionar' && <GestaoUsuarios />}
        </div>
      </main>
    </div>
  );
}
