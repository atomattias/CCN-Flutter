import { ApiService } from './api';
import { Channel, ApiResponse } from '../types';

export interface CreateChannelData {
  name: string;
  description: string;
  tag: string;
  specialty: boolean;
}

export interface JoinChannelData {
  channelId: string;
}

export interface UpdateChannelData {
  name?: string;
  description?: string;
  tag?: string;
  specialty?: boolean;
}

class ChannelService {
  private api: ApiService;

  constructor() {
    this.api = new ApiService();
  }

  // Get all available channels
  async getChannels(): Promise<Channel[]> {
    try {
      const response = await this.api.get<ApiResponse<Channel[]>>('/channels');
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to fetch channels:', error);
      throw error;
    }
  }

  // Get channels that the user has joined
  async getJoinedChannels(): Promise<Channel[]> {
    try {
      const response = await this.api.get<ApiResponse<Channel[]>>('/channels/joined');
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to fetch joined channels:', error);
      throw error;
    }
  }

  // Get a specific channel by ID
  async getChannel(channelId: string): Promise<Channel> {
    try {
      const response = await this.api.get<ApiResponse<Channel>>(`/channels/${channelId}`);
      return response.data.data;
    } catch (error) {
      console.error(`Failed to fetch channel ${channelId}:`, error);
      throw error;
    }
  }

  // Create a new channel
  async createChannel(channelData: CreateChannelData): Promise<Channel> {
    try {
      const response = await this.api.post<ApiResponse<Channel>>('/channels', channelData);
      return response.data.data;
    } catch (error) {
      console.error('Failed to create channel:', error);
      throw error;
    }
  }

  // Join a channel
  async joinChannel(channelId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.api.post<ApiResponse<{ success: boolean; message: string }>>(
        `/channels/${channelId}/join`
      );
      return response.data.data;
    } catch (error) {
      console.error(`Failed to join channel ${channelId}:`, error);
      throw error;
    }
  }

  // Leave a channel
  async leaveChannel(channelId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.api.post<ApiResponse<{ success: boolean; message: string }>>(
        `/channels/${channelId}/leave`
      );
      return response.data.data;
    } catch (error) {
      console.error(`Failed to leave channel ${channelId}:`, error);
      throw error;
    }
  }

  // Update channel (only for channel owners)
  async updateChannel(channelId: string, updateData: UpdateChannelData): Promise<Channel> {
    try {
      const response = await this.api.put<ApiResponse<Channel>>(`/channels/${channelId}`, updateData);
      return response.data.data;
    } catch (error) {
      console.error(`Failed to update channel ${channelId}:`, error);
      throw error;
    }
  }

  // Delete channel (only for channel owners)
  async deleteChannel(channelId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.api.delete<ApiResponse<{ success: boolean; message: string }>>(
        `/channels/${channelId}`
      );
      return response.data.data;
    } catch (error) {
      console.error(`Failed to delete channel ${channelId}:`, error);
      throw error;
    }
  }

  // Search channels by name or tag
  async searchChannels(query: string): Promise<Channel[]> {
    try {
      const response = await this.api.get<ApiResponse<Channel[]>>(`/channels/search?q=${encodeURIComponent(query)}`);
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to search channels:', error);
      throw error;
    }
  }

  // Get channel members
  async getChannelMembers(channelId: string): Promise<any[]> {
    try {
      const response = await this.api.get<ApiResponse<any[]>>(`/channels/${channelId}/members`);
      return response.data.data || [];
    } catch (error) {
      console.error(`Failed to fetch channel members for ${channelId}:`, error);
      throw error;
    }
  }

  // Add user to channel (only for channel owners/admins)
  async addUserToChannel(channelId: string, userId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.api.post<ApiResponse<{ success: boolean; message: string }>>(
        `/channels/${channelId}/members`,
        { userId }
      );
      return response.data.data;
    } catch (error) {
      console.error(`Failed to add user ${userId} to channel ${channelId}:`, error);
      throw error;
    }
  }

  // Remove user from channel (only for channel owners/admins)
  async removeUserFromChannel(channelId: string, userId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.api.delete<ApiResponse<{ success: boolean; message: string }>>(
        `/channels/${channelId}/members/${userId}`
      );
      return response.data.data;
    } catch (error) {
      console.error(`Failed to remove user ${userId} from channel ${channelId}:`, error);
      throw error;
    }
  }

  // Get channel statistics
  async getChannelStats(channelId: string): Promise<{
    memberCount: number;
    messageCount: number;
    lastActivity: string;
  }> {
    try {
      const response = await this.api.get<ApiResponse<{
        memberCount: number;
        messageCount: number;
        lastActivity: string;
      }>>(`/channels/${channelId}/stats`);
      return response.data.data;
    } catch (error) {
      console.error(`Failed to fetch channel stats for ${channelId}:`, error);
      throw error;
    }
  }
}

export const channelService = new ChannelService();
export default channelService;

