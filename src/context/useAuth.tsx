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

type TipoUsuario = "admin" | "rh" | "colaborador" | null;

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
  tipo: null,
  logout: () => {},
  login: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tipo, setTipo] = useState<TipoUsuario>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        const userRef = doc(db, "usuarios", firebaseUser.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          const data = snap.data();
          setTipo(data.tipo as TipoUsuario); // garante que seja um dos valores esperados
        }
      } else {
        setTipo(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = () => {
    signOut(auth);
    setUser(null);
    setTipo(null);
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
