"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User } from "@/lib/types";
import { api } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("dela_langa_token");
    const savedUser = localStorage.getItem("dela_langa_user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem("dela_langa_token", newToken);
    localStorage.setItem("dela_langa_user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem("dela_langa_token");
    localStorage.removeItem("dela_langa_user");
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const updated = await api.auth.me();
      localStorage.setItem("dela_langa_user", JSON.stringify(updated));
      setUser(updated);
    } catch {
      logout();
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
