import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api.ts';
import type { User, UserRole, FreelancerProfile, CompanyProfile } from '../types/index.ts';

interface AuthContextType {
  user: User | null;
  profile: FreelancerProfile | CompanyProfile | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  registerFreelancer: (data: any) => Promise<User>;
  registerCompany: (data: any) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  switchDemoAccount: (targetRole: UserRole) => Promise<void>;
  dbStatus: { connected: boolean; type: string; message: string } | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<FreelancerProfile | CompanyProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [dbStatus, setDbStatus] = useState<{ connected: boolean; type: string; message: string } | null>(null);

  const fetchDbStatus = useCallback(async () => {
    try {
      const res = await api.get('/health');
      if (res.data?.database) {
        setDbStatus(res.data.database);
      }
    } catch {
      // ignore
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('freelance_hub_token');
      if (!token) {
        setUser(null);
        setProfile(null);
        setIsLoading(false);
        return;
      }
      const res = await api.get('/auth/me');
      if (res.data?.success && res.data?.data) {
        setUser({
          _id: res.data.data._id,
          name: res.data.data.name,
          email: res.data.data.email,
          role: res.data.data.role,
          status: res.data.data.status,
          createdAt: res.data.data.createdAt,
          updatedAt: res.data.data.updatedAt,
        });
        setProfile(res.data.data.profile || null);
      } else {
        localStorage.removeItem('freelance_hub_token');
        setUser(null);
        setProfile(null);
      }
    } catch {
      localStorage.removeItem('freelance_hub_token');
      setUser(null);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
    fetchDbStatus();
  }, [refreshUser, fetchDbStatus]);

  const login = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, user: loggedUser } = res.data.data;
      localStorage.setItem('freelance_hub_token', token);
      setUser(loggedUser);
      setProfile(loggedUser.profile || null);
      return loggedUser;
    } finally {
      setIsLoading(false);
    }
  };

  const registerFreelancer = async (data: any): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/register/freelancer', data);
      const { token, user: newUser } = res.data.data;
      localStorage.setItem('freelance_hub_token', token);
      setUser(newUser);
      setProfile(newUser.profile || null);
      return newUser;
    } finally {
      setIsLoading(false);
    }
  };

  const registerCompany = async (data: any): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/register/company', data);
      const { token, user: newUser } = res.data.data;
      localStorage.setItem('freelance_hub_token', token);
      setUser(newUser);
      setProfile(newUser.profile || null);
      return newUser;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore
    } finally {
      localStorage.removeItem('freelance_hub_token');
      setUser(null);
      setProfile(null);
    }
  };

  const switchDemoAccount = async (targetRole: UserRole) => {
    const email =
      targetRole === 'COMPANY' ? 'company.demo@example.com' : 'freelancer.demo@example.com';
    await login(email, 'Demo1234!');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role: user?.role || null,
        isAuthenticated: Boolean(user),
        isLoading,
        login,
        registerFreelancer,
        registerCompany,
        logout,
        refreshUser,
        switchDemoAccount,
        dbStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
