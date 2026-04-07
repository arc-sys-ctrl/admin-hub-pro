import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import api from "@/lib/api";

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => void;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: () => {},
  setUser: () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('sophix_token');
    const storedUser = localStorage.getItem('sophix_user');
    
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        // Verify token with health check
        api.get('/health').catch(() => {
          signOut();
        });
      } catch (e) {
        signOut();
      }
    }
    setLoading(false);
  }, []);

  const signOut = () => {
    localStorage.removeItem('sophix_token');
    localStorage.removeItem('sophix_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

