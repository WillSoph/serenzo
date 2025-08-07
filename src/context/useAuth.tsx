"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  User
} from "firebase/auth";
import {
  doc,
  getDoc
} from "firebase/firestore";
import { auth } from "@/services/firebase";
import { db } from "@/services/firebase";
import { useRouter } from "next/navigation";

type TipoUsuario = "admin" | "rh" | "colaborador" | undefined;

interface AuthContextType {
  user: User | null;
  loading: boolean;
  tipo: TipoUsuario;
  logout: () => void;
  login: (email: string, senha: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  tipo: undefined,
  logout: () => {},
  login: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {  
  const [user, setUser] = useState<User | null>(null);
  const [tipo, setTipo] = useState<TipoUsuario>(undefined);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("[useAuth] Firebase user →", firebaseUser);
      setUser(firebaseUser);
  
      if (firebaseUser) {
        try {
          const userRef = doc(db, "usuarios", firebaseUser.uid);
          const snap = await getDoc(userRef);
          if (snap.exists()) {
            const data = snap.data();
            console.log("[useAuth] Dados Firestore →", data);
            setTipo(data.tipo as TipoUsuario);
          } else {
            console.warn("[useAuth] Documento não encontrado no Firestore");
            setTipo(undefined);
          }
        } catch (err) {
          console.error("[useAuth] Erro ao buscar dados:", err);
          setTipo(undefined);
        }
      } else {
        setTipo(undefined);
      }
  
      setLoading(false);
    });
  
    return () => unsubscribe();
  }, []);
  

  const logout = () => {
    signOut(auth);
    setUser(null);
    setTipo(undefined);
    router.push("/");
  };

  const login = async (email: string, senha: string) => {
    await signInWithEmailAndPassword(auth, email, senha);
  };

  return (
    <AuthContext.Provider value={{ user, loading, tipo, logout, login }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
