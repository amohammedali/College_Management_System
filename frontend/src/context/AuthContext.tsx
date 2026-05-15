import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface User {
  _id: string;
  email: string;
  role: 'admin' | 'staff' | 'student' | 'non-teaching';
  token: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

// ─── CRITICAL: Set token BEFORE any component renders ───────────
// This runs synchronously at module load time, ensuring that
// axios has the Authorization header set before any query fires.
const stored = localStorage.getItem('cms_user');
if (stored) {
  try {
    const parsed = JSON.parse(stored);
    if (parsed?.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${parsed.token}`;
    }
  } catch (_) {
    localStorage.removeItem('cms_user');
  }
}
// ────────────────────────────────────────────────────────────────

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    // Initialize state synchronously from localStorage
    const s = localStorage.getItem('cms_user');
    if (!s) return null;
    try { return JSON.parse(s); } catch { return null; }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Keep axios header in sync whenever user changes
  useEffect(() => {
    if (user?.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [user]);

  const login = async (email: string, password: string) => {
    setError(null);
    try {
      const { data } = await axios.post(`${API}/auth/login`, { email, password });
      setUser(data);
      localStorage.setItem('cms_user', JSON.stringify(data));
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials');
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('cms_user');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
