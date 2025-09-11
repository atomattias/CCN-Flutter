import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, LoginCredentials, AuthResponse } from '../types';
import authService from '../services/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  signUp: (userData: Partial<User> & { password: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Debug state changes
  useEffect(() => {
    console.log('AuthContext: State changed - isAuthenticated:', isAuthenticated, 'isLoading:', isLoading, 'user:', user?.email);
  }, [isAuthenticated, isLoading, user]);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      
      // Check if there's a stored token
      const token = await AsyncStorage.getItem('authToken');
      
      if (token) {
        // Verify token is still valid by getting current user
        const currentUser = await authService.getCurrentUser();
        
        if (currentUser) {
          setUser(currentUser);
          setIsAuthenticated(true);
        } else {
          // Token exists but user data is invalid, clear it
          await clearAuthData();
        }
      } else {
        // No token, user is not authenticated
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      // On error, assume not authenticated and clear any stored data
      await clearAuthData();
    } finally {
      setIsLoading(false);
    }
  };

  const clearAuthData = async () => {
    try {
      await AsyncStorage.multiRemove(['authToken', 'user']);
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      console.log('AuthContext: Starting login process');
      setIsLoading(true);
      
      console.log('AuthContext: Calling authService.login');
      const response = await authService.login(credentials);
      console.log('AuthContext: Received response:', response);
      
      if (response.user && response.token) {
        console.log('AuthContext: Setting user and authentication state');
        setUser(response.user);
        setIsAuthenticated(true);
        console.log('AuthContext: State updated - user:', response.user, 'isAuthenticated: true');
      } else {
        console.log('AuthContext: Invalid response format');
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.log('AuthContext: Login error:', error);
      // Clear any partial auth data on login failure
      await clearAuthData();
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (userData: Partial<User> & { password: string }) => {
    try {
      setIsLoading(true);
      
      const response = await authService.signUp(userData);
      
      if (response.user && response.token) {
        setUser(response.user);
        setIsAuthenticated(true);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      // Clear any partial auth data on signup failure
      await clearAuthData();
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      
      // Call logout service to invalidate token on server
      await authService.logout();
      
      // Clear local auth data
      await clearAuthData();
      
    } catch (error) {
      console.error('Logout error:', error);
      // Even if server logout fails, clear local data
      await clearAuthData();
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    try {
      const updatedUser = await authService.updateProfile(userData);
      setUser(updatedUser);
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  };

  const refreshAuth = async () => {
    await checkAuthStatus();
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    signUp,
    logout,
    updateUser,
    refreshAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};