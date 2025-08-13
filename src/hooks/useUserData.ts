// hooks/useUserData.ts
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/services/firebase";
import type { User } from "firebase/auth";

export type UserData = {
  uid: string;
  nome: string;
  email: string;
  tipo: "admin" | "rh" | "colaborador";
  empresaId: string;        // <- agora garantido na criação
  criadoEm?: string;
};

export function useUserData(user: User | null | undefined) {
  const [data, setData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        if (!user) {
          setData(null);
          return;
        }
        const snap = await getDoc(doc(db, "usuarios", user.uid));
        if (snap.exists()) {
          setData(snap.data() as UserData);
        } else {
          console.warn("Documento do usuário não encontrado em 'usuarios'.");
          setData(null);
        }
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [user]);

  return { data, loading };
}
