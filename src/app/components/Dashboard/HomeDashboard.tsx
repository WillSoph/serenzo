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
import { CheckCircle2, Clock3, MessageSquare, AlertTriangle } from 'lucide-react';

type Msg = {
  id: string;
  empresaId: string;
  conteudo: string;
  tipo?: string;
  tipoDetectado?: string;
  respostaRH?: string;
  createdAt?: any;
  // possíveis campos vindos na msg
  setor?: string;
  departamento?: string;
  area?: string;
  time?: string;
  // possíveis chaves de autor
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

// tenta extrair o uid do autor independentemente do nome do campo
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

  // mensagens da empresa
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
        const data = snap.docs.map((d) => ({ id: d.id, ...(d.data() as DocumentData) })) as Msg[];
        setRows(data);
        setLoading(false);
      },
      () => setLoading(false)
    );
    return () => unsub();
  }, [empresaId]);

  // 🔗 mapa uid → área/setor do usuário (top-level "usuarios" com empresaId)
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
        const area =
          d?.area || d?.setor || d?.departamento || d?.time || 'Sem setor';
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

    const counts = { sugestao: 0, critica: 0, ajuda: 0 };
    const setoresAgg: Record<
      string,
      { setor: string; criticas: number; pedidosAjuda: number; total: number }
    > = {};

    rows.forEach((m) => {
      const tipo = normalizeTipo(m.tipoDetectado || m.tipo);

      // barras por tipo
      if ((counts as any)[tipo] !== undefined) (counts as any)[tipo] += 1;
      else counts.sugestao += 1;

      // setor: tenta dos campos da msg; se não houver, cai na área do autor; senão "Sem setor"
      const autorUid = getAutorUid(m);
      const setorMsg =
        m.setor || m.departamento || m.area || m.time || (autorUid ? userAreasMap[autorUid] : '');
      const setor = setorMsg ? String(setorMsg) : 'Sem setor';

      // agrega apenas críticas e pedidos de ajuda
      if (tipo === 'critica' || tipo === 'ajuda') {
        if (!setoresAgg[setor]) {
          setoresAgg[setor] = { setor, criticas: 0, pedidosAjuda: 0, total: 0 };
        }
        if (tipo === 'critica') setoresAgg[setor].criticas += 1;
        if (tipo === 'ajuda') setoresAgg[setor].pedidosAjuda += 1;
        setoresAgg[setor].total = setoresAgg[setor].criticas + setoresAgg[setor].pedidosAjuda;
      }
    });

    const barras = [
      { tipo: 'Sugestões', total: counts.sugestao, key: 'sugestao' },
      { tipo: 'Críticas', total: counts.critica, key: 'critica' },
      { tipo: 'Pedidos de Ajuda', total: counts.ajuda, key: 'ajuda' },
    ];

    // série últimos 14 dias
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
      const label = fmtData(m.createdAt).slice(0, 5);
      if (bucket.has(label)) bucket.set(label, (bucket.get(label) || 0) + 1);
    });
    const serie = Array.from(bucket.entries()).map(([dia, total]) => ({ dia, total }));

    // ordena setores por maior atenção
    const setoresAtencao = Object.values(setoresAgg).sort((a, b) => b.total - a.total);

    return { kpis: { total, respondidas, pendentes }, barras, serie, setoresAtencao };
  }, [rows, userAreasMap]);

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

      {/* Distribuição por tipo + Setores com atenção */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-emerald-900">Distribuição por tipo</h2>
          </div>

          {loading ? (
            <div className="h-[260px] rounded-xl bg-emerald-50 animate-pulse" />
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
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-emerald-900 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Setores que precisam de atenção
            </h2>
          </div>

          {loading ? (
            <div className="h-[260px] rounded-xl bg-emerald-50 animate-pulse" />
          ) : setoresAtencao.length === 0 ? (
            <div className="h-[260px] flex items-center justify-center text-slate-500 text-sm">
              Nenhum setor com críticas ou pedidos de ajuda.
            </div>
          ) : (
            <div className="h-[260px] overflow-auto pr-1">
              <ul className="divide-y divide-slate-100">
                {setoresAtencao.map((s, idx) => (
                  <li key={s.setor} className="py-2 flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-6 text-slate-400 text-sm tabular-nums">{idx + 1}.</span>
                      <span className="font-medium text-slate-800 truncate">{s.setor}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs rounded-full bg-amber-100 text-amber-700 px-2 py-0.5">
                        {s.criticas} críticas
                      </span>
                      <span className="text-xs rounded-full bg-red-100 text-red-700 px-2 py-0.5">
                        {s.pedidosAjuda} pedidos
                      </span>
                      <span className="text-xs rounded-full bg-slate-100 text-slate-700 px-2 py-0.5">
                        {s.total} total
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* Série temporal últimos 14 dias */}
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
