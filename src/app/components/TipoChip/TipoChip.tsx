'use client';
import * as React from 'react';

export type TipoUsuario = 'admin' | 'comum' | 'rh' | 'colaborador';

function isAdmin(tipo: string) {
  const t = String(tipo || '').toLowerCase();
  return t === 'admin' || t === 'rh';
}

type Props = {
  tipo: TipoUsuario | string;
  size?: 'sm' | 'md';
  className?: string;
};

export function TipoChip({ tipo, size = 'sm', className }: Props) {
  const admin = isAdmin(tipo);

  const base = 'inline-flex items-center rounded-full font-semibold ring-1';
  const sizing = size === 'sm' ? 'text-[11px] px-2.5 py-0.5' : 'text-xs px-3 py-1';
  const color = admin
    ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
    : 'bg-sky-50 text-sky-700 ring-sky-200';

  const classes = [base, sizing, color, className].filter(Boolean).join(' ');
  const display = admin ? 'ADMIN' : 'COMUM';

  return <span className={classes}>{display}</span>;
}
