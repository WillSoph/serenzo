// components/rh/UsuariosEmpresaTable.tsx
'use client';

import { Search, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { TipoChip } from '../TipoChip/TipoChip';
import { AreaBadge } from '../AreaBadge/AreaBadge';

type TipoUsuario = 'admin' | 'comum' | 'rh' | 'colaborador';

export type UsuarioLite = {
  uid: string;
  nome: string;
  email: string;
  tipo: TipoUsuario;
  empresaId: string;
  criadoEm?: string;
  area?: string;
};

interface UsuariosEmpresaTableProps {
  usuarios: UsuarioLite[];
  loading: boolean;
  busca: string;
  onBuscaChange: (value: string) => void;
  onExcluir: (usuario: UsuarioLite) => void;
}

export function UsuariosEmpresaTable({
  usuarios,
  loading,
  busca,
  onBuscaChange,
  onExcluir,
}: UsuariosEmpresaTableProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              value={busca}
              onChange={(e) => onBuscaChange(e.target.value)}
              placeholder="Buscar por nome, e-mail, tipo ou área..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div className="text-sm text-slate-500">
            {usuarios.length} resultado(s)
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-4">Nome</th>
                <th className="px-5 py-4">E-mail</th>
                <th className="px-5 py-4">Área</th>
                <th className="px-5 py-4">Tipo</th>
                <th className="px-5 py-4 text-right">Ações</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-500">
                    Carregando usuários...
                  </td>
                </tr>
              ) : usuarios.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-500">
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              ) : (
                usuarios.map((u) => (
                  <tr key={u.uid} className="transition hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700">
                          {(u.nome || u.email || 'U')[0].toUpperCase()}
                        </div>

                        <div>
                          <p className="font-medium text-slate-900">
                            {u.nome || '—'}
                          </p>
                          <p className="text-xs text-slate-500">
                            Usuário da empresa
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-slate-700">
                      {u.email}
                    </td>

                    <td className="px-5 py-4">
                      <AreaBadge area={u.area} />
                    </td>

                    <td className="px-5 py-4">
                      <TipoChip tipo={u.tipo} />
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end">
                        <Button
                          variant="destructive"
                          onClick={() => onExcluir(u)}
                          className="h-9 px-3 text-sm inline-flex items-center gap-1"
                        >
                          <Trash2 className="h-4 w-4" />
                          Excluir
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}