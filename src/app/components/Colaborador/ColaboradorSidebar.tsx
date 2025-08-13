// components/Colaborador/ColaboradorSidebar.tsx
'use client';

import { useEffect, useState } from 'react';
import { LayoutDashboard, Inbox, LogOut, X } from 'lucide-react';
import { useAuth } from '@/context/useAuth';
import { useUserData } from '@/hooks/useUserData';
import { db } from '@/services/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';

interface ColaboradorSidebarProps {
  telaAtiva: string;
  setTelaAtiva: (tela: 'home' | 'inbox') => void;
  menuAberto: boolean;
  setMenuAberto: (open: boolean) => void;
}

export const ColaboradorSidebar = ({
  telaAtiva,
  setTelaAtiva,
  menuAberto,
  setMenuAberto,
}: ColaboradorSidebarProps) => {
  const { logout, user } = useAuth();
  const hook = useUserData(user) as any;
  const userData = (hook?.data ?? hook) || null;
  const empresaId = userData?.empresaId;

  const [unread, setUnread] = useState<number>(0);

  // Escuta quantidade de mensagens não lidas do colaborador
  useEffect(() => {
    if (!user?.uid || !empresaId) {
      setUnread(0);
      return;
    }

    const itensRef = collection(db, 'mensagens', empresaId, 'colaboradores', user.uid, 'itens');
    const q = query(itensRef, where('lida', '==', false));

    const unsub = onSnapshot(
      q,
      (snap) => setUnread(snap.size),
      () => setUnread(0)
    );
    return () => unsub();
  }, [user?.uid, empresaId]);

  const handleClick = (tela: 'home' | 'inbox') => {
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
          <h2 className="text-xl font-bold text-emerald-100">Serenzo</h2>
          <button className="md:hidden cursor-pointer" onClick={() => setMenuAberto(false)}>
            <X className="w-5 h-5 text-emerald-200" />
          </button>
        </div>

        <nav className="space-y-3 font-medium">
          <button
            onClick={() => handleClick('home')}
            className={`flex items-center gap-3 w-full p-2 rounded cursor-pointer transition ${
              telaAtiva === 'home'
                ? 'bg-emerald-100 text-emerald-700'
                : 'text-emerald-50 hover:text-emerald-300'
            }`}
          >
            <LayoutDashboard size={18} />
            Início
          </button>

          <button
            onClick={() => handleClick('inbox')}
            className={`flex items-center justify-between w-full p-2 rounded cursor-pointer transition ${
              telaAtiva === 'inbox'
                ? 'bg-emerald-100 text-emerald-700'
                : 'text-emerald-50 hover:text-emerald-300'
            }`}
          >
            <span className="flex items-center gap-3">
              <Inbox size={18} />
              Caixa de Entrada
            </span>
            <span className="bg-emerald-600 text-white text-xs rounded-full px-2 py-0.5 min-w-[1.25rem] text-center">
              {unread}
            </span>
          </button>
        </nav>

        <div className="pt-6 border-t border-emerald-800">
          <button
            onClick={() => {
              logout();
              setMenuAberto(false);
            }}
            className="flex items-center gap-3 text-emerald-300 hover:text-emerald-100 cursor-pointer transition"
          >
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </aside>
    </>
  );
};
