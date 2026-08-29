import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, Role } from '../types';
import { UserService } from '../services/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password?: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      UserService.getMe()
        .then((freshUser) => {
          setUser(freshUser);
          localStorage.setItem('admin_user', JSON.stringify(freshUser));
        })
        .catch(() => {
          localStorage.removeItem('admin_user');
          localStorage.removeItem('jwt_token');
          setUser(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password?: string) => {
    setIsLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'https://juanda-backend-production.up.railway.app/api';
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      if (!res.ok) {
        throw new Error('Credenciales inválidas');
      }
      
      const data = await res.json();
      
      localStorage.setItem('jwt_token', data.token);
      
      const loggedUser: User = {
        id: 'user-id', // En un caso real el backend retornaría el ID también
        name: email.split('@')[0],
        email: email,
        role: { id: 'r1', name: data.role as any },
        storeIds: data.storeIds ? data.storeIds.map(String) : [],
        isActive: true
      };
      
      setUser(loggedUser);
      localStorage.setItem('admin_user', JSON.stringify(loggedUser));
    } catch (e: any) {
      throw new Error(e.message || 'Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('admin_user');
    localStorage.removeItem('jwt_token');
  };

  const refreshUser = async () => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      try {
        const freshUser = await UserService.getMe();
        setUser(freshUser);
        localStorage.setItem('admin_user', JSON.stringify(freshUser));
      } catch (e) {
        logout();
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
