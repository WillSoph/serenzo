// components/Colaborador/ColaboradorSidebar.tsx
'use client';

import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Inbox,
  LogOut,
  X,
  BrainCircuit,
  HeartHandshake,
} from 'lucide-react';
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

  useEffect(() => {
    if (!user?.uid || !empresaId) {
      setUnread(0);
      return;
    }

    const itensRef = collection(
      db,
      'mensagens',
      empresaId,
      'colaboradores',
      user.uid,
      'itens'
    );

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
    setMenuAberto(false);
  };

  const getItemClass = (active: boolean) =>
    `group flex w-full items-center rounded-xl px-3 py-3 text-sm font-medium transition-all cursor-pointer ${
      active
        ? 'bg-white/15 text-white shadow-sm ring-1 ring-white/10'
        : 'text-emerald-50/75 hover:bg-white/10 hover:text-white'
    }`;

  const getIconClass = (active: boolean) =>
    `flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
      active
        ? 'bg-emerald-400/20 text-emerald-300'
        : 'bg-white/5 text-emerald-50/70 group-hover:text-emerald-300'
    }`;

  return (
    <>
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-72 flex-col justify-between overflow-hidden bg-gradient-to-b from-emerald-950 via-emerald-950 to-teal-950 px-4 py-5 text-white shadow-2xl transition-transform duration-300 ease-in-out md:fixed md:translate-x-0 ${
          menuAberto ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Navegação do colaborador"
      >
        <div>
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-300/25">
                <BrainCircuit size={26} />
              </div>

              <div>
                <h2 className="text-lg font-bold tracking-wide text-white">
                  PREVISIVA
                </h2>
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-300">
                  Cuidar antes
                </p>
              </div>
            </div>

            <button
              className="rounded-lg p-2 text-emerald-50/70 transition hover:bg-white/10 hover:text-white md:hidden"
              onClick={() => setMenuAberto(false)}
              aria-label="Fechar menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="space-y-7">
            <div>
              <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-emerald-100/45">
                Bem-estar
              </p>

              <div className="space-y-1.5">
                <button
                  onClick={() => handleClick('home')}
                  className={getItemClass(telaAtiva === 'home')}
                >
                  <span className={getIconClass(telaAtiva === 'home')}>
                    <LayoutDashboard size={18} />
                  </span>

                  <span className="ml-3">Início</span>
                </button>

                <button
                  onClick={() => handleClick('inbox')}
                  className={`${getItemClass(telaAtiva === 'inbox')} justify-between`}
                >
                  <span className="flex items-center">
                    <span className={getIconClass(telaAtiva === 'inbox')}>
                      <Inbox size={18} />
                    </span>

                    <span className="ml-3">Caixa de Entrada</span>
                  </span>

                  {unread > 0 && (
                    <span
                      className="rounded-full bg-emerald-300 px-2 py-0.5 text-xs font-bold text-emerald-950"
                      aria-label={`${unread} mensagens não lidas`}
                    >
                      {unread}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </nav>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => {
              logout();
              setMenuAberto(false);
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-emerald-50/75 transition hover:bg-white/10 hover:text-white"
          >
            <LogOut size={18} />
            Sair
          </button>

          <div className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/10">
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-emerald-300 text-emerald-950">
              <HeartHandshake size={18} />
            </div>

            <p className="text-sm font-semibold text-white">
              Área do colaborador
            </p>

            <p className="mt-1 text-xs leading-relaxed text-emerald-50/60">
              Compartilhe mensagens com segurança e acompanhe respostas do RH.
            </p>
          </div>
        </div>
      </aside>

      {menuAberto && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setMenuAberto(false)}
          aria-hidden
        />
      )}
    </>
  );
};