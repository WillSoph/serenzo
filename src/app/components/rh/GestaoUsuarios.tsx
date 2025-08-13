// components/rh/GestaoUsuarios.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { Modal } from "../Dashboard/Modal";
import { useAuth } from "@/context/useAuth";
import { useUserData } from "@/hooks/useUserData";
import { Plus, Search, Trash2, Users } from "lucide-react";

type TipoUsuario = "colaborador" | "rh";

type UsuarioLite = {
  uid: string;
  nome: string;
  email: string;
  tipo: TipoUsuario;
  empresaId: string;
  criadoEm?: string;
};

export default function GestaoUsuarios() {
  const { user } = useAuth();
  const { data: userData, loading: userLoading } = useUserData(user);

  // listagem
  const [usuarios, setUsuarios] = useState<UsuarioLite[]>([]);
  const [loading, setLoading] = useState(false);
  const [busca, setBusca] = useState("");

  // modal adicionar
  const [modalAdd, setModalAdd] = useState(false);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [tipoNovo, setTipoNovo] = useState<TipoUsuario>("colaborador");
  const [salvando, setSalvando] = useState(false);
  const [erroAdd, setErroAdd] = useState("");

  // modal excluir
  const [modalDel, setModalDel] = useState<{ open: boolean; alvo?: UsuarioLite }>({ open: false });
  const [excluindo, setExcluindo] = useState(false);
  const [erroDel, setErroDel] = useState("");

  const empresaId = userData?.empresaId;
  const podeSalvar = !!nome && !!email && !!senha && !!empresaId && !salvando;

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (!q) return usuarios;
    return usuarios.filter(
      (u) =>
        u.nome.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.tipo.toLowerCase().includes(q)
    );
  }, [usuarios, busca]);

  async function carregar() {
    if (!empresaId) return;
    setLoading(true);
    try {
      const res = await fetch("/api/usuarios-da-empresa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ empresaId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Falha ao listar usuários.");
      setUsuarios(data.usuarios || []);
    } catch (e: any) {
      console.error("[GestaoUsuarios] listar:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!userLoading && empresaId) carregar();
  }, [empresaId, userLoading]);

  async function adicionarUsuario() {
    if (!podeSalvar) return;
    setSalvando(true);
    setErroAdd("");
    try {
      const res = await fetch("/api/adicionar-usuario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, senha, empresaId, tipo: tipoNovo }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Erro ao adicionar usuário.");
      // reset
      setNome("");
      setEmail("");
      setSenha("");
      setTipoNovo("colaborador");
      setModalAdd(false);
      // reload
      carregar();
    } catch (e: any) {
      setErroAdd(e.message || "Erro inesperado.");
    } finally {
      setSalvando(false);
    }
  }

  async function excluirUsuario(uid: string) {
    setExcluindo(true);
    setErroDel("");
    try {
      const res = await fetch("/api/excluir-usuario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Erro ao excluir usuário.");
      setModalDel({ open: false });
      carregar();
    } catch (e: any) {
      setErroDel(e.message || "Erro inesperado.");
    } finally {
      setExcluindo(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center">
            <Users className="h-5 w-5 text-emerald-700" />
          </div>
        <div>
          <h2 className="text-2xl font-bold text-emerald-900">Usuários da Empresa</h2>
          <p className="text-sm text-slate-600">Gerencie colaboradores e contas de RH</p>
        </div>
        </div>

        <Button onClick={() => setModalAdd(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar usuário
        </Button>
      </div>

      {/* Barra de busca */}
      <div className="mb-4 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
            placeholder="Buscar por nome, e-mail ou tipo…"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <div className="text-sm text-slate-500">{filtrados.length} resultado(s)</div>
      </div>

      {/* Lista */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="grid grid-cols-12 px-4 py-3 text-xs font-semibold text-slate-500 border-b">
          <div className="col-span-4">Nome</div>
          <div className="col-span-4">E-mail</div>
          <div className="col-span-2">Tipo</div>
          <div className="col-span-2 text-right">Ações</div>
        </div>

        {loading ? (
          <div className="p-6 text-slate-500">Carregando…</div>
        ) : filtrados.length === 0 ? (
          <div className="p-6 text-slate-500">Nenhum usuário encontrado.</div>
        ) : (
          <ul className="divide-y">
            {filtrados.map((u) => (
              <li key={u.uid} className="grid grid-cols-12 items-center px-4 py-4">
                <div className="col-span-4">
                  <div className="font-medium text-slate-900">{u.nome || "—"}</div>
                  {/* <div className="text-xs text-slate-500">UID: {u.uid}</div> */}
                </div>
                <div className="col-span-4 text-slate-700">{u.email}</div>
                <div className="col-span-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${
                      u.tipo === "rh"
                        ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                        : "bg-sky-50 text-sky-700 ring-sky-200"
                    }`}
                  >
                    {u.tipo.toUpperCase()}
                  </span>
                </div>
                <div className="col-span-2 flex justify-end">
                  <button
                    onClick={() => setModalDel({ open: true, alvo: u })}
                    className="inline-flex items-center gap-1 text-rose-600 hover:text-rose-700 cursor-pointer"
                    title="Excluir usuário"
                  >
                    <Trash2 className="h-4 w-4" /> Excluir
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Modal Adicionar */}
      <Modal isOpen={modalAdd} onClose={() => setModalAdd(false)} title="Adicionar novo usuário">
        <div className="grid gap-2">
          <Input
            fullWidth
            placeholder="Nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
          <Input
            fullWidth
            placeholder="E-mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            fullWidth
            placeholder="Senha"
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
          <label className="text-sm text-slate-700 mt-1">Tipo de usuário</label>
          <select
            value={tipoNovo}
            onChange={(e) => setTipoNovo(e.target.value as TipoUsuario)}
            className="w-full border rounded px-3 py-2 bg-white"
          >
            <option value="colaborador">Colaborador</option>
            <option value="rh">RH</option>
          </select>

          {!userLoading && !empresaId && (
            <p className="text-amber-600 text-sm">
              Aviso: empresa do RH não identificada. Recarregue a página ou faça login novamente.
            </p>
          )}

          {erroAdd && <p className="text-rose-600 text-sm">{erroAdd}</p>}

          <div className="mt-3 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setModalAdd(false)}>
              Cancelar
            </Button>
            <Button onClick={adicionarUsuario} disabled={!podeSalvar} loading={salvando}>
              {salvando ? "Salvando…" : "Adicionar"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Excluir */}
      <Modal
        isOpen={modalDel.open}
        onClose={() => setModalDel({ open: false })}
        title="Excluir usuário"
      >
        <p className="text-slate-700">
          Tem certeza de que deseja excluir o usuário{" "}
          <span className="font-semibold">{modalDel.alvo?.nome || modalDel.alvo?.email}</span>?
          Essa ação não pode ser desfeita.
        </p>

        {erroDel && <p className="text-rose-600 text-sm mt-2">{erroDel}</p>}

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setModalDel({ open: false })}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={() => modalDel.alvo && excluirUsuario(modalDel.alvo.uid)}
            loading={excluindo}
          >
            {excluindo ? "Excluindo…" : "Excluir"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
