import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/services/firebase";
import { User } from "firebase/auth";

type UserData = {
  nome: string;
  email: string;
  empresaId: string;
  tipo: "admin" | "rg" | "colaborador";
  criadoEm?: string;
};

export function useUserData(user: User | null | undefined) {
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      try {
        const docRef = doc(db, "usuarios", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setUserData(docSnap.data() as UserData);
        } else {
          console.warn("Usuário não encontrado no Firestore");
        }
      } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error);
      }
    };

    fetchUserData();
  }, [user]);

  return userData;
}
