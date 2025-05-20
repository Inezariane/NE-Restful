import React, { createContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'user';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (firstName: string, lastName: string, email: string, password: string, role: 'admin' | 'user') => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.get('http://localhost:3001/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      }).then(response => {
        setUser(response.data.user);
      }).catch(() => {
        localStorage.removeItem('token');
        setUser(null);
      });
    }
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    const response = await axios.post('http://localhost:3001/api/auth/login', {
      email,
      password
    });
    localStorage.setItem('token', response.data.token);
    setUser(response.data.user);
  };

  const register = async (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    role: 'admin' | 'user'
  ): Promise<void> => {
    const response = await axios.post('http://localhost:3001/api/auth/register', {
      firstName,
      lastName,
      email,
      password,
      role
    });
    localStorage.setItem('token', response.data.token);
    setUser(response.data.user);
  };

  const logout = (): void => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};