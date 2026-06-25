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
  LabelList,
  AreaChart,
  Area,
  CartesianGrid,
  Cell,
} from 'recharts';
import {
  collectionGroup,
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  DocumentData,
} from 'firebase/firestore';
import { db } from '@/services/firebase';
import { useAuth } from '@/context/useAuth';
import { useUserData } from '@/hooks/useUserData';
import {
  CheckCircle2,
  Clock3,
  MessageSquare,
  AlertTriangle,
  Users,
  Inbox,
} from 'lucide-react';

type Msg = {
  id: string;
  empresaId: string;
  conteudo: string;
  tipo?: string;
  tipoDetectado?: string;
  respostaRH?: string;
  lida?: boolean;
  createdAt?: any;
  setor?: string;
  departamento?: string;
  area?: string;
  time?: string;
  uid?: string;
  autorUid?: string;
  userId?: string;
  usuarioUid?: string;
  colaboradorUid?: string;
  remetenteUid?: string;
};

const CORES = {
  sugestao: '#10b981',
  critica: '#f59e0b',
  ajuda: '#ef4444',
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

function getAutorUid(m: Msg): string | undefined {
  return (
    m.autorUid ||
    m.uid ||
    m.userId ||
    m.usuarioUid ||
    m.colaboradorUid ||
    m.remetenteUid ||
    undefined
  );
}

export function HomeDashboard() {
  const { user } = useAuth();
  const hook = useUserData(user) as any;
  const userData = (hook?.data ?? hook) || null;
  const empresaId = userData?.empresaId;

  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Msg[]>([]);
  const [userAreasMap, setUserAreasMap] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!empresaId) {
      setRows([]);
      setLoading(false);
      return;
    }

    const qy = query(
      collectionGroup(db, 'itens'),
      where('empresaId', '==', empresaId),
      orderBy('createdAt', 'desc')
    );

    setLoading(true);

    const unsub = onSnapshot(
      qy,
      { includeMetadataChanges: true },
      (snap) => {
        if (snap.metadata.fromCache && !snap.metadata.hasPendingWrites) return;

        const data = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as DocumentData),
        })) as Msg[];

        setRows(data);
        setLoading(false);
      },
      () => setLoading(false)
    );

    return () => unsub();
  }, [empresaId]);

  useEffect(() => {
    if (!empresaId) {
      setUserAreasMap({});
      return;
    }

    const qUsers = query(collection(db, 'usuarios'), where('empresaId', '==', empresaId));

    const unsub = onSnapshot(qUsers, (snap) => {
      const map: Record<string, string> = {};

      snap.forEach((doc) => {
        const d = doc.data() as any;
        const uid = d?.uid || doc.id;
        const area = d?.area || d?.setor || d?.departamento || d?.time || 'Sem setor';

        if (uid) map[uid] = String(area);
      });

      setUserAreasMap(map);
    });

    return () => unsub();
  }, [empresaId]);

  const { kpis, barras, serie, setoresAtencao } = useMemo(() => {
    const total = rows.length;
    const respondidas = rows.filter((m) => !!m.respostaRH?.trim()).length;
    const pendentes = total - respondidas;
    const naoLidas = rows.filter((m) => !m.lida).length;
    const colaboradoresAtivos = new Set(rows.map(getAutorUid).filter(Boolean)).size;

    const percentualRespondidas =
      total > 0 ? Number(((respondidas / total) * 100).toFixed(1)) : 0;

    const counts = { sugestao: 0, critica: 0, ajuda: 0 };

    const setoresAgg: Record<
      string,
      { setor: string; criticas: number; pedidosAjuda: number; total: number }
    > = {};

    rows.forEach((m) => {
      const tipo = normalizeTipo(m.tipoDetectado || m.tipo);

      if ((counts as any)[tipo] !== undefined) {
        (counts as any)[tipo] += 1;
      } else {
        counts.sugestao += 1;
      }

      const autorUid = getAutorUid(m);
      const setorMsg =
        m.setor ||
        m.departamento ||
        m.area ||
        m.time ||
        (autorUid ? userAreasMap[autorUid] : '');

      const setor = setorMsg ? String(setorMsg) : 'Sem setor';

      if (tipo === 'critica' || tipo === 'ajuda') {
        if (!setoresAgg[setor]) {
          setoresAgg[setor] = { setor, criticas: 0, pedidosAjuda: 0, total: 0 };
        }

        if (tipo === 'critica') setoresAgg[setor].criticas += 1;
        if (tipo === 'ajuda') setoresAgg[setor].pedidosAjuda += 1;

        setoresAgg[setor].total =
          setoresAgg[setor].criticas + setoresAgg[setor].pedidosAjuda;
      }
    });

    const barras = [
      { tipo: 'Sugestões', total: counts.sugestao, key: 'sugestao' },
      { tipo: 'Críticas', total: counts.critica, key: 'critica' },
      { tipo: 'Pedidos de Ajuda', total: counts.ajuda, key: 'ajuda' },
    ];

    const days = 14;
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - (days - 1));

    const bucket = new Map<string, number>();

    for (let i = 0; i < days; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);

      bucket.set(
        new Intl.DateTimeFormat('pt-BR', {
          day: '2-digit',
          month: '2-digit',
        }).format(d),
        0
      );
    }

    rows.forEach((m) => {
      const label = fmtData(m.createdAt).slice(0, 5);
      if (bucket.has(label)) bucket.set(label, (bucket.get(label) || 0) + 1);
    });

    const serie = Array.from(bucket.entries()).map(([dia, total]) => ({
      dia,
      total,
    }));

    const setoresAtencao = Object.values(setoresAgg).sort((a, b) => b.total - a.total);

    return {
      kpis: {
        total,
        respondidas,
        pendentes,
        percentualRespondidas,
        naoLidas,
        colaboradoresAtivos,
      },
      barras,
      serie,
      setoresAtencao,
    };
  }, [rows, userAreasMap]);

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <KpiCard
          title="Total de mensagens"
          value={kpis.total}
          subtitle="Todos os canais"
          icon={<MessageSquare className="h-6 w-6" />}
          variant="emerald"
        />

        <KpiCard
          title="Respondidas"
          value={kpis.respondidas}
          subtitle={`${kpis.percentualRespondidas}% do total`}
          icon={<CheckCircle2 className="h-6 w-6" />}
          variant="emerald"
        />

        <KpiCard
          title="Pendentes"
          value={kpis.pendentes}
          subtitle="Requer atenção"
          icon={<Clock3 className="h-6 w-6" />}
          variant="amber"
        />
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.1fr_0.95fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Distribuição por tipo</h2>

            <button className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50">
              Últimos 14 dias
            </button>
          </div>

          {loading ? (
            <div className="h-[280px] animate-pulse rounded-2xl bg-slate-100" />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={barras} barSize={80}>
                <XAxis dataKey="tipo" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="total" radius={[8, 8, 0, 0]}>
                  {barras.map((b) => (
                    <Cell key={b.key} fill={CORES[b.key as keyof typeof CORES]} />
                  ))}
                  <LabelList dataKey="total" position="top" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}

          <div className="mt-4 flex flex-wrap items-center justify-center gap-5 text-sm text-slate-500">
            <LegendDot color="bg-emerald-500" label="Sugestões" />
            <LegendDot color="bg-amber-500" label="Críticas" />
            <LegendDot color="bg-red-500" label="Pedidos de Ajuda" />
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Setores que precisam de atenção
            </h2>

            <button className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50">
              Ver todos
            </button>
          </div>

          {loading ? (
            <div className="h-[280px] animate-pulse rounded-2xl bg-slate-100" />
          ) : setoresAtencao.length === 0 ? (
            <div className="flex h-[280px] items-center justify-center rounded-2xl bg-slate-50 text-sm text-slate-500">
              Nenhum setor com críticas ou pedidos de ajuda.
            </div>
          ) : (
            <div className="space-y-4">
              {setoresAtencao.slice(0, 5).map((s, idx) => (
                <div key={s.setor} className="rounded-2xl border border-slate-100 p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500">
                        {idx + 1}
                      </span>

                      <p className="truncate font-semibold text-slate-800">{s.setor}</p>
                    </div>

                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                      {s.total} total
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                      {s.criticas} críticas
                    </span>

                    <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
                      {s.pedidosAjuda} pedidos
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">
            Mensagens por dia (últimos 14 dias)
          </h2>

          <button className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50">
            Últimos 14 dias
          </button>
        </div>

        {loading ? (
          <div className="h-[260px] animate-pulse rounded-2xl bg-slate-100" />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={serie}>
              <defs>
                <linearGradient id="areaEmerald" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.03} />
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
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <SmallMetricCard
          title="Mensagens não lidas"
          value={kpis.naoLidas}
          subtitle="Aguardando leitura"
          icon={<Inbox className="h-6 w-6" />}
          variant="amber"
        />

        <SmallMetricCard
          title="Colaboradores ativos"
          value={kpis.colaboradoresAtivos}
          subtitle="Participaram este mês"
          icon={<Users className="h-6 w-6" />}
          variant="purple"
        />

        <SmallMetricCard
          title="Taxa de resposta"
          value={`${kpis.percentualRespondidas}%`}
          subtitle="Mensagens respondidas"
          icon={<CheckCircle2 className="h-6 w-6" />}
          variant="emerald"
        />
      </section>
    </div>
  );
}

function KpiCard({
  title,
  value,
  subtitle,
  icon,
  variant,
}: {
  title: string;
  value: number | string;
  subtitle: string;
  icon: React.ReactNode;
  variant: 'emerald' | 'amber';
}) {
  const styles = {
    emerald: {
      card: 'border-emerald-100 bg-gradient-to-br from-white to-emerald-50/70',
      icon: 'bg-emerald-100 text-emerald-600',
    },
    amber: {
      card: 'border-amber-100 bg-gradient-to-br from-white to-amber-50/80',
      icon: 'bg-amber-100 text-amber-600',
    },
  }[variant];

  return (
    <div className={`rounded-3xl border p-6 shadow-sm transition hover:shadow-md ${styles.card}`}>
      <div className="flex items-center gap-5">
        <div className={`flex h-16 w-16 items-center justify-center rounded-full ${styles.icon}`}>
          {icon}
        </div>

        <div>
          <p className="text-sm font-medium text-slate-600">{title}</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{value}</p>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

function SmallMetricCard({
  title,
  value,
  subtitle,
  icon,
  variant,
}: {
  title: string;
  value: number | string;
  subtitle: string;
  icon: React.ReactNode;
  variant: 'emerald' | 'amber' | 'purple';
}) {
  const styles = {
    emerald: 'bg-emerald-100 text-emerald-600',
    amber: 'bg-amber-100 text-amber-600',
    purple: 'bg-purple-100 text-purple-600',
  }[variant];

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-center gap-4">
        <div className={`flex h-14 w-14 items-center justify-center rounded-full ${styles}`}>
          {icon}
        </div>

        <div>
          <p className="text-sm font-medium text-slate-600">{title}</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`h-3 w-3 rounded-full ${color}`} />
      {label}
    </span>
  );
}