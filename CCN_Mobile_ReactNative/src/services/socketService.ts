import { io, Socket } from 'socket.io-client';
import { Message, Channel, User } from '../types';

export interface SocketEvents {
  // Connection events
  connect: () => void;
  disconnect: () => void;
  connect_error: (error: Error) => void;
  
  // Chat events
  message: (message: Message) => void;
  message_sent: (message: Message) => void;
  message_error: (error: { message: string; channelId: string }) => void;
  
  // Channel events
  channel_joined: (channel: Channel) => void;
  channel_left: (channelId: string) => void;
  channel_updated: (channel: Channel) => void;
  
  // User events
  user_online: (userId: string) => void;
  user_offline: (userId: string) => void;
  user_typing: (data: { userId: string; channelId: string; isTyping: boolean }) => void;
  
  // System events
  notification: (data: { type: string; message: string; channelId?: string }) => void;
}

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  // Event listeners
  private listeners: Map<keyof SocketEvents, Function[]> = new Map();

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners() {
    // Connection events
    this.on('connect', () => {
      console.log('Socket connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    this.on('disconnect', () => {
      console.log('Socket disconnected');
      this.isConnected = false;
    });

    this.on('connect_error', (error: Error) => {
      console.error('Socket connection error:', error);
      this.isConnected = false;
      this.handleReconnect();
    });
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        if (this.socket) {
          this.socket.connect();
        }
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  connect(token: string, userId: string) {
    if (this.socket && this.isConnected) {
      console.log('Socket already connected');
      return;
    }

    try {
      this.socket = io('http://localhost:3000', {
        auth: {
          token: token
        },
        query: {
          userId: userId
        },
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true
      });

      // Setup socket event handlers
      this.setupSocketEventHandlers();
      
    } catch (error) {
      console.error('Failed to create socket connection:', error);
    }
  }

  private setupSocketEventHandlers() {
    if (!this.socket) return;

    // Forward all events to our listeners
    Object.keys(SocketEvents).forEach((event) => {
      this.socket!.on(event, (data: any) => {
        this.emitToListeners(event as keyof SocketEvents, data);
      });
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Join a channel
  joinChannel(channelId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join_channel', { channelId });
    }
  }

  // Leave a channel
  leaveChannel(channelId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave_channel', { channelId });
    }
  }

  // Send a message
  sendMessage(message: Omit<Message, '_id' | 'createdAt' | 'updatedAt'>) {
    if (this.socket && this.isConnected) {
      this.socket.emit('send_message', message);
    } else {
      console.error('Socket not connected');
    }
  }

  // Start typing indicator
  startTyping(channelId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing_start', { channelId });
    }
  }

  // Stop typing indicator
  stopTyping(channelId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing_stop', { channelId });
    }
  }

  // Event listener management
  on<T extends keyof SocketEvents>(event: T, callback: SocketEvents[T]) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback as Function);
  }

  off<T extends keyof SocketEvents>(event: T, callback: SocketEvents[T]) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event)!;
      const index = callbacks.indexOf(callback as Function);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private emitToListeners<T extends keyof SocketEvents>(event: T, data: any) {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in socket event listener for ${event}:`, error);
        }
      });
    }
  }

  // Utility methods
  isSocketConnected(): boolean {
    return this.isConnected && this.socket !== null;
  }

  getSocketId(): string | null {
    return this.socket?.id || null;
  }
}

// Export singleton instance
export const socketService = new SocketService();
export default socketService;

