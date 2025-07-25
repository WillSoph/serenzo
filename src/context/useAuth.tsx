"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";
import {
  onAuthStateChanged,
  signOut,
  User
} from "firebase/auth";
import {
  doc,
  getDoc
} from "firebase/firestore";
import { auth } from "@/services/firebase";
import { db } from "@/services/firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  tipo: string | null;
  logout: () => void;
  
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  tipo: null,
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tipo, setTipo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        const userRef = doc(db, "usuarios", firebaseUser.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          const data = snap.data();
          setTipo(data.tipo); // Ex: "colaborador" ou "admin"
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

  return (
    <AuthContext.Provider value={{ user, loading, tipo, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
