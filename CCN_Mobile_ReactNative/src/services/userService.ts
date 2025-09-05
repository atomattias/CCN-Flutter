import { ApiService } from './api';
import { User, ApiResponse } from '../types';

export interface SearchUsersParams {
  query: string;
  role?: string;
  limit?: number;
  offset?: number;
}

export interface UpdateProfileData {
  fullname?: string;
  email?: string;
  role?: string;
  avatar?: string;
}

export interface UserConnectionRequest {
  targetUserId: string;
  message?: string;
}

class UserService {
  private api: ApiService;

  constructor() {
    this.api = new ApiService();
  }

  // Search for users
  async searchUsers(params: SearchUsersParams): Promise<User[]> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('q', params.query);
      if (params.role) queryParams.append('role', params.role);
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.offset) queryParams.append('offset', params.offset.toString());

      const response = await this.api.get<ApiResponse<User[]>>(`/users/search?${queryParams.toString()}`);
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to search users:', error);
      throw error;
    }
  }

  // Get user profile by ID
  async getUserProfile(userId: string): Promise<User> {
    try {
      const response = await this.api.get<ApiResponse<User>>(`/users/${userId}`);
      return response.data.data;
    } catch (error) {
      console.error(`Failed to fetch user profile ${userId}:`, error);
      throw error;
    }
  }

  // Get current user profile
  async getCurrentUserProfile(): Promise<User> {
    try {
      const response = await this.api.get<ApiResponse<User>>('/users/profile');
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch current user profile:', error);
      throw error;
    }
  }

  // Update current user profile
  async updateProfile(updateData: UpdateProfileData): Promise<User> {
    try {
      const response = await this.api.put<ApiResponse<User>>('/users/profile', updateData);
      return response.data.data;
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  }

  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.api.post<ApiResponse<{ success: boolean; message: string }>>('/users/change-password', {
        currentPassword,
        newPassword
      });
      return response.data.data;
    } catch (error) {
      console.error('Failed to change password:', error);
      throw error;
    }
  }

  // Get online users
  async getOnlineUsers(): Promise<User[]> {
    try {
      const response = await this.api.get<ApiResponse<User[]>>('/users/online');
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to fetch online users:', error);
      throw error;
    }
  }

  // Get users by role
  async getUsersByRole(role: string): Promise<User[]> {
    try {
      const response = await this.api.get<ApiResponse<User[]>>(`/users/role/${role}`);
      return response.data.data || [];
    } catch (error) {
      console.error(`Failed to fetch users with role ${role}:`, error);
      throw error;
    }
  }

  // Send connection request
  async sendConnectionRequest(requestData: UserConnectionRequest): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.api.post<ApiResponse<{ success: boolean; message: string }>>('/users/connections/request', requestData);
      return response.data.data;
    } catch (error) {
      console.error('Failed to send connection request:', error);
      throw error;
    }
  }

  // Accept connection request
  async acceptConnectionRequest(requestId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.api.post<ApiResponse<{ success: boolean; message: string }>>(`/users/connections/accept/${requestId}`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to accept connection request:', error);
      throw error;
    }
  }

  // Reject connection request
  async rejectConnectionRequest(requestId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.api.post<ApiResponse<{ success: boolean; message: string }>>(`/users/connections/reject/${requestId}`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to reject connection request:', error);
      throw error;
    }
  }

  // Get pending connection requests
  async getPendingConnectionRequests(): Promise<any[]> {
    try {
      const response = await this.api.get<ApiResponse<any[]>>('/users/connections/pending');
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to fetch pending connection requests:', error);
      throw error;
    }
  }

  // Get user connections
  async getUserConnections(): Promise<User[]> {
    try {
      const response = await this.api.get<ApiResponse<User[]>>('/users/connections');
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to fetch user connections:', error);
      throw error;
    }
  }

  // Remove connection
  async removeConnection(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.api.delete<ApiResponse<{ success: boolean; message: string }>>(`/users/connections/${userId}`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to remove connection:', error);
      throw error;
    }
  }

  // Block user
  async blockUser(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.api.post<ApiResponse<{ success: boolean; message: string }>>(`/users/${userId}/block`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to block user:', error);
      throw error;
    }
  }

  // Unblock user
  async unblockUser(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.api.post<ApiResponse<{ success: boolean; message: string }>>(`/users/${userId}/unblock`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to unblock user:', error);
      throw error;
    }
  }

  // Get blocked users
  async getBlockedUsers(): Promise<User[]> {
    try {
      const response = await this.api.get<ApiResponse<User[]>>('/users/blocked');
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to fetch blocked users:', error);
      throw error;
    }
  }

  // Get user statistics
  async getUserStats(userId: string): Promise<{
    messageCount: number;
    channelCount: number;
    connectionCount: number;
    lastSeen: string;
  }> {
    try {
      const response = await this.api.get<ApiResponse<{
        messageCount: number;
        channelCount: number;
        connectionCount: number;
        lastSeen: string;
      }>>(`/users/${userId}/stats`);
      return response.data.data;
    } catch (error) {
      console.error(`Failed to fetch user stats for ${userId}:`, error);
      throw error;
    }
  }
}

export const userService = new UserService();
export default userService;

