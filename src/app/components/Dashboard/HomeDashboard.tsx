// components/Dashboard/HomeDashboard.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Legend,
  Cell,
  LabelList,
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts';
import {
  collectionGroup,
  onSnapshot,
  query,
  where,
  orderBy,
  DocumentData,
} from 'firebase/firestore';
import { db } from '@/services/firebase';
import { useAuth } from '@/context/useAuth';
import { useUserData } from '@/hooks/useUserData';
import { CheckCircle2, Clock3, MessageSquare } from 'lucide-react';

type Msg = {
  id: string;
  empresaId: string;
  conteudo: string;
  tipo?: string;
  tipoDetectado?: string;
  respostaRH?: string;
  createdAt?: any; // Timestamp | Date | string
};

const CORES = {
  sugestao: '#10b981', // emerald-500
  critica: '#f59e0b',  // amber-500
  ajuda:   '#ef4444',  // red-500
};

function normalizeTipo(raw?: string) {
  const t = (raw || '').toLowerCase();
  if (t.includes('sugest')) return 'sugestao';
  if (t.includes('crít') || t.includes('crit')) return 'critica';
  if (t.includes('ajuda') || t.includes('pedido')) return 'ajuda';
  return 'sugestao';
}

function fmtData(d?: any) {
  try {
    const date = d?.toDate ? d.toDate() : d instanceof Date ? d : new Date(d);
    return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(date);
  } catch {
    return '';
  }
}

export function HomeDashboard() {
  const { user } = useAuth();
  const hook = useUserData(user) as any;
  const userData = (hook?.data ?? hook) || null;
  const empresaId = userData?.empresaId;

  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Msg[]>([]);

  // Listener de mensagens da empresa (toda a árvore /itens) — evita "cache-first" desatualizado
  useEffect(() => {
    if (!empresaId) {
      setRows([]);
      setLoading(false);
      return;
    }

    const qy = query(
      collectionGroup(db, 'itens'),
      where('empresaId', '==', empresaId),
      orderBy('createdAt', 'desc') // exige índice composto (console fornece o link se faltar)
    );

    setLoading(true);

    const unsub = onSnapshot(
      qy,
      { includeMetadataChanges: true },
      (snap) => {
        // Ignora snapshot somente-do-cache (sem writes pendentes) para evitar dados desatualizados
        if (snap.metadata.fromCache && !snap.metadata.hasPendingWrites) {
          return;
        }
        const data = snap.docs.map((d) => ({ id: d.id, ...(d.data() as DocumentData) })) as Msg[];
        setRows(data);
        setLoading(false);
      },
      () => setLoading(false)
    );

    return () => unsub();
  }, [empresaId]);

  // Agregações derivadas
  const { kpis, barras, serie } = useMemo(() => {
    const total = rows.length;
    const respondidas = rows.filter((m) => !!m.respostaRH?.trim()).length;
    const pendentes = total - respondidas;

    const counts = { sugestao: 0, critica: 0, ajuda: 0 };
    rows.forEach((m) => {
      const tipo = normalizeTipo(m.tipoDetectado || m.tipo);
      if (counts[tipo as keyof typeof counts] !== undefined) {
        counts[tipo as keyof typeof counts] += 1;
      } else {
        counts.sugestao += 1;
      }
    });

    const barras = [
      { tipo: 'Sugestões', total: counts.sugestao, key: 'sugestao' },
      { tipo: 'Críticas', total: counts.critica, key: 'critica' },
      { tipo: 'Pedidos de Ajuda', total: counts.ajuda, key: 'ajuda' },
    ];

    // Série últimos 14 dias
    const days = 14;
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - (days - 1));
    const bucket = new Map<string, number>();
    for (let i = 0; i < days; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      bucket.set(
        new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(d),
        0
      );
    }
    rows.forEach((m) => {
      const label = fmtData(m.createdAt).slice(0, 5); // dd/mm
      if (bucket.has(label)) bucket.set(label, (bucket.get(label) || 0) + 1);
    });
    const serie = Array.from(bucket.entries()).map(([dia, total]) => ({ dia, total }));

    return {
      kpis: { total, respondidas, pendentes },
      barras,
      serie,
    };
  }, [rows]);

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
          <div className="text-sm text-emerald-800">Total de mensagens</div>
          <div className="mt-1 flex items-baseline gap-2">
            <MessageSquare className="h-5 w-5 text-emerald-600" />
            <span className="text-2xl font-semibold text-emerald-900">{kpis.total}</span>
          </div>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
          <div className="text-sm text-emerald-800">Respondidas</div>
          <div className="mt-1 flex items-baseline gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <span className="text-2xl font-semibold text-emerald-900">{kpis.respondidas}</span>
          </div>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
          <div className="text-sm text-amber-800">Pendentes</div>
          <div className="mt-1 flex items-baseline gap-2">
            <Clock3 className="h-5 w-5 text-amber-600" />
            <span className="text-2xl font-semibold text-amber-900">{kpis.pendentes}</span>
          </div>
        </div>
      </section>

      {/* Gráfico 1 — Barras por tipo */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-emerald-900">Distribuição por tipo</h2>
        </div>

        {loading ? (
          <div className="h-56 rounded-xl bg-emerald-50 animate-pulse" />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={barras}>
              <XAxis dataKey="tipo" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                {barras.map((b, i) => (
                  <Cell key={i} fill={CORES[b.key as keyof typeof CORES]} />
                ))}
                <LabelList dataKey="total" position="top" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </section>

      {/* Gráfico 2 — Série temporal últimos 14 dias */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-emerald-900">
            Mensagens por dia (últimos 14 dias)
          </h2>
        </div>

        {loading ? (
          <div className="h-56 rounded-xl bg-emerald-50 animate-pulse" />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={serie}>
              <defs>
                <linearGradient id="areaEmerald" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="dia" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="total"
                stroke="#10b981"
                fill="url(#areaEmerald)"
                strokeWidth={2}
                dot={{ r: 2 }}
                activeDot={{ r: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </section>
    </div>
  );
}
