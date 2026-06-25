// components/Dashboard/MensagensColaboradoresTable.tsx
'use client';

import { useMemo, useState } from 'react';
import { Search, Eye, MessageSquare, MoreVertical } from 'lucide-react';
import type { DocumentData } from 'firebase/firestore';
import { Modal } from './Modal';

interface MensagensColaboradoresTableProps {
  mensagens: DocumentData[];
  onResponder: (mensagem: any, texto: string) => Promise<void>;
  pageIndex: number;
  hasNextPage: boolean;
  loadingPage: boolean;
  totalMensagens: number;
  onNextPage: () => void;
  onFirstPage: () => void;
}

export function MensagensColaboradoresTable({
  mensagens,
  onResponder,
  pageIndex,
  hasNextPage,
  loadingPage,
  onNextPage,
  onFirstPage,
  totalMensagens,
}: MensagensColaboradoresTableProps) {
  const [busca, setBusca] = useState('');
  const [mensagemAberta, setMensagemAberta] = useState<any | null>(null);
  const [resposta, setResposta] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');
const [filtroPrioridade, setFiltroPrioridade] = useState('todas');
const [filtroStatus, setFiltroStatus] = useState('todos');

const getPrioridade = (m: any) => {
    const tipo = (m.tipo ?? m.tipoDetectado ?? '').toLowerCase();

    if (tipo.includes('ajuda') || tipo.includes('crítica') || tipo.includes('critica')) {
      return 'ALTA';
    }

    if (tipo.includes('sugest')) {
      return 'BAIXA';
    }

    return 'MÉDIA';
  };

  const mensagensFiltradas = useMemo(() => {
    const termo = busca.toLowerCase().trim();

    return mensagens.filter((m) => {
        const tipo = (m.tipo ?? m.tipoDetectado ?? '').toString().toLowerCase();
        const prioridade = getPrioridade(m);
        const status = m.respostaRH ? 'respondida' : 'pendente';

        const matchBusca =
        !termo ||
        m.nomeUsuario?.toLowerCase().includes(termo) ||
        m.conteudo?.toLowerCase().includes(termo) ||
        tipo.includes(termo);

        const matchTipo = filtroTipo === 'todos' || tipo.includes(filtroTipo);
        const matchPrioridade = filtroPrioridade === 'todas' || prioridade === filtroPrioridade;
        const matchStatus = filtroStatus === 'todos' || status === filtroStatus;

        return matchBusca && matchTipo && matchPrioridade && matchStatus;
    });
    }, [busca, filtroTipo, filtroPrioridade, filtroStatus, mensagens]);

  

  const getPrioridadeClass = (prioridade: string) => {
    if (prioridade === 'ALTA') return 'bg-rose-100 text-rose-700';
    if (prioridade === 'BAIXA') return 'bg-emerald-100 text-emerald-700';
    return 'bg-amber-100 text-amber-700';
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="grid w-full grid-cols-1 gap-3 md:grid-cols-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar mensagem ou colaborador..."
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                />
            </div>

            <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            >
                <option value="todos">Todos os tipos</option>
                <option value="sugest">Sugestões</option>
                <option value="crit">Críticas</option>
                <option value="ajuda">Pedidos de ajuda</option>
                <option value="elogio">Elogios</option>
            </select>

            <select
                value={filtroPrioridade}
                onChange={(e) => setFiltroPrioridade(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            >
                <option value="todas">Todas as prioridades</option>
                <option value="ALTA">Alta</option>
                <option value="MÉDIA">Média</option>
                <option value="BAIXA">Baixa</option>
            </select>

            <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            >
                <option value="todos">Todos os status</option>
                <option value="pendente">Pendente</option>
                <option value="respondida">Respondida</option>
            </select>
            </div>

            <div className="shrink-0 text-sm text-slate-500">
            {totalMensagens} mensagens encontradas
            </div>
        </div>
        </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-4">Colaborador</th>
                <th className="px-5 py-4">Mensagem</th>
                <th className="px-5 py-4">Tipo</th>
                <th className="px-5 py-4">Prioridade</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Ações</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {mensagensFiltradas.map((m) => {
                const tipoMostrado = (m.tipo ?? m.tipoDetectado ?? 'Não classificado').toString();
                const prioridade = getPrioridade(m);

                return (
                  <tr key={m.id} className="transition hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700">
                          {(m.nomeUsuario || 'C')[0].toUpperCase()}
                        </div>

                        <div>
                          <p className="font-medium text-slate-900">
                            {m.nomeUsuario || 'Colaborador'}
                          </p>
                          <p className="text-xs text-slate-500">Colaborador</p>
                        </div>
                      </div>
                    </td>

                    <td className="max-w-md px-5 py-4">
                      <p className="line-clamp-2 text-slate-700">
                        {m.conteudo}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                        {tipoMostrado}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-lg px-2.5 py-1 text-xs font-bold ${getPrioridadeClass(
                          prioridade
                        )}`}
                      >
                        {prioridade}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      {m.respostaRH ? (
                        <span className="inline-flex items-center gap-2 text-sm text-emerald-700">
                          <span className="h-2 w-2 rounded-full bg-emerald-500" />
                          Respondida
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2 text-sm text-amber-700">
                          <span className="h-2 w-2 rounded-full bg-amber-500" />
                          Pendente
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setMensagemAberta(m);
                            setResposta('');
                          }}
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-emerald-50 hover:text-emerald-700"
                          title="Visualizar"
                        >
                          <Eye size={17} />
                        </button>

                        <button
                          onClick={() => {
                            setMensagemAberta(m);
                            setResposta('');
                          }}
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-emerald-50 hover:text-emerald-700"
                          title="Responder"
                        >
                          <MessageSquare size={17} />
                        </button>

                        <button className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100">
                          <MoreVertical size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4">
            <p className="text-sm text-slate-500">
                Página {pageIndex + 1} · {mensagens.length} de {totalMensagens} itens
            </p>

            <div className="flex items-center gap-2">
                <button
                type="button"
                onClick={onFirstPage}
                disabled={pageIndex === 0 || loadingPage}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                Primeira página
                </button>

                <button
                type="button"
                onClick={onNextPage}
                disabled={!hasNextPage || loadingPage}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                Próxima
                </button>
            </div>
            </div>
        </div>
      </div>

      <Modal
        isOpen={!!mensagemAberta}
        title="Mensagem do colaborador"
        onClose={() => {
            setMensagemAberta(null);
            setResposta('');
        }}
        >
        {mensagemAberta && (
            <div>
            <div className="mb-4">
                <p className="text-sm text-slate-500">
                {mensagemAberta.nomeUsuario || 'Colaborador'} ·{' '}
                {mensagemAberta.tipo ?? mensagemAberta.tipoDetectado}
                </p>
            </div>

            <p className="whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
                {mensagemAberta.conteudo}
            </p>

            {(mensagemAberta.orientacaoRH ?? mensagemAberta.respostaIA) && (
                <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
                    Orientação para RH
                </p>
                <p className="mt-1 text-sm text-emerald-900">
                    {mensagemAberta.orientacaoRH ?? mensagemAberta.respostaIA}
                </p>
                </div>
            )}

            {mensagemAberta.respostaRH ? (
                <div className="mt-4 rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Sua resposta
                </p>
                <p className="mt-1 text-sm text-slate-800">
                    {mensagemAberta.respostaRH}
                </p>
                </div>
            ) : (
                <form
                className="mt-4 space-y-3"
                onSubmit={async (e) => {
                    e.preventDefault();

                    const texto = resposta.trim();
                    if (!texto) return;

                    await onResponder(mensagemAberta, texto);
                    setResposta('');
                    setMensagemAberta(null);
                }}
                >
                <textarea
                    value={resposta}
                    onChange={(e) => setResposta(e.target.value)}
                    placeholder="Escreva uma resposta ao colaborador..."
                    className="min-h-28 w-full resize-none rounded-xl border border-slate-200 p-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                />

                <div className="flex justify-end gap-2">
                    <button
                    type="button"
                    onClick={() => {
                        setMensagemAberta(null);
                        setResposta('');
                    }}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                    Cancelar
                    </button>

                    <button
                    type="submit"
                    className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
                    >
                    Enviar resposta
                    </button>
                </div>
                </form>
            )}
            </div>
        )}
        </Modal>
    </div>
  );
}