import apiService from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, LoginCredentials, AuthResponse, ApiResponse } from '../types';

class AuthService {
  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiService.post<any>('/api/auth/signin', credentials);
      
      // Handle backend response format: { success: true, data: { token, ...userData } }
      if (response.success && response.data) {
        const { token, ...userData } = response.data;
        
        // Store token and user data
        await AsyncStorage.setItem('authToken', token);
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        
        return {
          token,
          user: userData
        };
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  }

  // Sign up user
  async signUp(userData: Partial<User> & { password: string }): Promise<AuthResponse> {
    try {
      const response = await apiService.post<any>('/api/auth/create-account', userData);
      
      // Handle backend response format: { success: true, data: { token, ...userData } }
      if (response.success && response.data) {
        const { token, ...userData } = response.data;
        
        // Store token and user data
        await AsyncStorage.setItem('authToken', token);
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        
        return {
          token,
          user: userData
        };
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Sign up failed');
    }
  }

  // Send OTP for email verification
  async sendOTP(email: string): Promise<{ message: string }> {
    try {
      const response = await apiService.post<any>('/api/auth/send-otp', { email });
      return { message: response.message || 'OTP sent successfully' };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to send OTP');
    }
  }

  // Verify OTP
  async verifyOTP(email: string, otp: string): Promise<{ message: string }> {
    try {
      const response = await apiService.post<any>('/api/auth/verify-otp', { 
        email, 
        otpCode: otp 
      });
      return { message: response.message || 'OTP verified successfully' };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'OTP verification failed');
    }
  }

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        return JSON.parse(userData);
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      return !!token;
    } catch (error) {
      return false;
    }
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  // Update user profile
  async updateProfile(userData: Partial<User>): Promise<User> {
    try {
      const response = await apiService.put<User>('/api/users/profile', userData);
      
      // Update stored user data
      const currentUser = await this.getCurrentUser();
      if (currentUser) {
        const updatedUser = { ...currentUser, ...response };
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      }
      
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Profile update failed');
    }
  }
}

export const authService = new AuthService();
export default authService;

