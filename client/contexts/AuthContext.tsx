'use client';

import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

type User = {
  id: number;
  username: string;
  email: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = process.env.API_URL || 'http://localhost:3001/api';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // 检查用户是否已登录（页面加载时）
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = Cookies.get('auth_token');
      
      if (storedToken) {
        try {
          setToken(storedToken);
          
          // 配置axios用于获取用户信息
          const response = await axios.get(`${API_URL}/auth/me`, {
            headers: {
              Authorization: `Bearer ${storedToken}`
            }
          });
          
          setUser(response.data.user);
        } catch (error) {
          console.error('获取用户信息失败:', error);
          Cookies.remove('auth_token');
          setToken(null);
        }
      }
      
      setIsLoading(false);
    };

    initAuth();
  }, []);

  // 登录函数
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      });
      
      const { user, token } = response.data;
      setUser(user);
      setToken(token);
      
      // 存储令牌到 cookie
      Cookies.set('auth_token', token, { expires: 30 }); // 30天有效期
      
      router.push('/dashboard');
    } catch (error) {
      console.error('登录失败:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 注册函数
  const register = async (username: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        username,
        email,
        password
      });
      
      const { user, token } = response.data;
      setUser(user);
      setToken(token);
      
      // 存储令牌到 cookie
      Cookies.set('auth_token', token, { expires: 30 }); // 30天有效期
      
      router.push('/dashboard');
    } catch (error) {
      console.error('注册失败:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 登出函数
  const logout = () => {
    setUser(null);
    setToken(null);
    Cookies.remove('auth_token');
    router.push('/login');
  };

  // 更新用户信息
  const updateUser = async (userData: Partial<User>) => {
    if (!token) return;
    
    try {
      const response = await axios.put(`${API_URL}/auth/profile`, userData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setUser(prev => prev ? { ...prev, ...response.data.user } : null);
    } catch (error) {
      console.error('更新用户信息失败:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// 使用认证上下文的钩子
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth 必须在 AuthProvider 内部使用');
  }
  return context;
}; 