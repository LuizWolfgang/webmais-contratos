import { createContext, useState, type ReactNode } from 'react';
import { login as loginRequest } from '../services/auth.service';
import { TOKEN_STORAGE_KEY } from '../services/api';

const USER_STORAGE_KEY = 'webmais_user';

interface AuthUser {
  id: string;
  username: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_STORAGE_KEY);
  return raw ? (JSON.parse(raw) as AuthUser) : null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(readStoredUser);

  async function login(username: string, password: string) {
    const result = await loginRequest(username, password);
    localStorage.setItem(TOKEN_STORAGE_KEY, result.token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(result.user));
    setUser(result.user);
  }

  function logout() {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
