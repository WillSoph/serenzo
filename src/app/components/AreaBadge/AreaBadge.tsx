'use client';
import * as React from 'react';

type Props = {
  area?: string | null;
  size?: 'sm' | 'md';
  className?: string;
};

export function AreaBadge({ area, size = 'sm', className }: Props) {
  const base = 'inline-flex items-center rounded-full font-medium ring-1';
  const sizing = size === 'sm' ? 'text-[11px] px-2.5 py-0.5' : 'text-xs px-3 py-1';
  const color = 'bg-slate-100 text-slate-700 ring-slate-200';
  const classes = [base, sizing, color, className].filter(Boolean).join(' ');

  return <span className={classes}>{area || '—'}</span>;
}
