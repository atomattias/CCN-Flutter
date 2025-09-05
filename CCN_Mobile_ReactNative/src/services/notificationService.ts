import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiService } from './api';

export interface NotificationConfig {
  enabled: boolean;
  messageNotifications: boolean;
  channelNotifications: boolean;
  mentionNotifications: boolean;
  fileUploadNotifications: boolean;
  emergencyNotifications: boolean;
  quietHours: {
    enabled: boolean;
    start: string; // HH:mm format
    end: string;   // HH:mm format
  };
}

export interface NotificationData {
  title: string;
  body: string;
  data?: any;
  channelId?: string;
  messageId?: string;
  type: 'message' | 'channel' | 'mention' | 'file' | 'emergency' | 'system';
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

class NotificationService {
  private api: ApiService;
  private readonly NOTIFICATION_CONFIG_KEY = 'ccn_notification_config';
  private readonly EXPO_PUSH_TOKEN_KEY = 'ccn_expo_push_token';

  constructor() {
    this.api = new ApiService();
    this.setupNotificationHandler();
  }

  // Setup notification handler
  private setupNotificationHandler() {
    Notifications.setNotificationHandler({
      handleNotification: async (notification) => {
        return {
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        };
      },
    });
  }

  // Request notification permissions
  async requestPermissions(): Promise<boolean> {
    try {
      if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== 'granted') {
          Alert.alert(
            'Permission Required',
            'Push notifications are required for real-time updates. Please enable them in your device settings.',
            [{ text: 'OK' }]
          );
          return false;
        }

        return true;
      } else {
        console.log('Must use physical device for Push Notifications');
        return false;
      }
    } catch (error) {
      console.error('Failed to request notification permissions:', error);
      return false;
    }
  }

  // Get Expo push token
  async getExpoPushToken(): Promise<string | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return null;

      const token = await Notifications.getExpoPushTokenAsync({
        projectId: 'your-expo-project-id', // Replace with your actual project ID
      });

      // Store token locally
      await AsyncStorage.setItem(this.EXPO_PUSH_TOKEN_KEY, token.data);
      
      // Send token to backend
      await this.registerPushToken(token.data);

      return token.data;
    } catch (error) {
      console.error('Failed to get Expo push token:', error);
      return null;
    }
  }

  // Register push token with backend
  private async registerPushToken(token: string): Promise<void> {
    try {
      await this.api.post('/notifications/register', { token });
    } catch (error) {
      console.error('Failed to register push token:', error);
    }
  }

  // Unregister push token
  async unregisterPushToken(): Promise<void> {
    try {
      const token = await AsyncStorage.getItem(this.EXPO_PUSH_TOKEN_KEY);
      if (token) {
        await this.api.post('/notifications/unregister', { token });
        await AsyncStorage.removeItem(this.EXPO_PUSH_TOKEN_KEY);
      }
    } catch (error) {
      console.error('Failed to unregister push token:', error);
    }
  }

  // Send local notification
  async sendLocalNotification(notification: NotificationData): Promise<void> {
    try {
      // Check if notifications are enabled
      const config = await this.getNotificationConfig();
      if (!config.enabled) return;

      // Check quiet hours
      if (config.quietHours.enabled && this.isInQuietHours(config.quietHours)) {
        return;
      }

      // Check specific notification type settings
      if (!this.shouldShowNotification(notification.type, config)) {
        return;
      }

      // Schedule notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data || {},
          sound: notification.priority === 'urgent' ? 'urgent.wav' : 'default.wav',
          priority: this.getNotificationPriority(notification.priority),
        },
        trigger: null, // Send immediately
      });
    } catch (error) {
      console.error('Failed to send local notification:', error);
    }
  }

  // Schedule notification for later
  async scheduleNotification(notification: NotificationData, trigger: Notifications.NotificationTriggerInput): Promise<void> {
    try {
      const config = await this.getNotificationConfig();
      if (!config.enabled) return;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data || {},
          sound: notification.priority === 'urgent' ? 'urgent.wav' : 'default.wav',
          priority: this.getNotificationPriority(notification.priority),
        },
        trigger,
      });
    } catch (error) {
      console.error('Failed to schedule notification:', error);
    }
  }

  // Cancel all notifications
  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Failed to cancel notifications:', error);
    }
  }

  // Cancel specific notification
  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('Failed to cancel notification:', error);
    }
  }

  // Get notification configuration
  async getNotificationConfig(): Promise<NotificationConfig> {
    try {
      const configString = await AsyncStorage.getItem(this.NOTIFICATION_CONFIG_KEY);
      if (configString) {
        return JSON.parse(configString);
      }

      // Return default configuration
      return {
        enabled: true,
        messageNotifications: true,
        channelNotifications: true,
        mentionNotifications: true,
        fileUploadNotifications: true,
        emergencyNotifications: true,
        quietHours: {
          enabled: false,
          start: '22:00',
          end: '08:00',
        },
      };
    } catch (error) {
      console.error('Failed to get notification config:', error);
      return this.getDefaultConfig();
    }
  }

  // Update notification configuration
  async updateNotificationConfig(config: Partial<NotificationConfig>): Promise<void> {
    try {
      const currentConfig = await this.getNotificationConfig();
      const updatedConfig = { ...currentConfig, ...config };
      
      await AsyncStorage.setItem(this.NOTIFICATION_CONFIG_KEY, JSON.stringify(updatedConfig));
      
      // Update backend if needed
      await this.api.put('/notifications/config', updatedConfig);
    } catch (error) {
      console.error('Failed to update notification config:', error);
    }
  }

  // Get default notification configuration
  private getDefaultConfig(): NotificationConfig {
    return {
      enabled: true,
      messageNotifications: true,
      channelNotifications: true,
      mentionNotifications: true,
      fileUploadNotifications: true,
      emergencyNotifications: true,
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00',
      },
    };
  }

  // Check if current time is in quiet hours
  private isInQuietHours(quietHours: { start: string; end: string }): boolean {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [startHour, startMinute] = quietHours.start.split(':').map(Number);
    const [endHour, endMinute] = quietHours.end.split(':').map(Number);
    
    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;
    
    if (startTime <= endTime) {
      // Same day (e.g., 08:00 to 22:00)
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // Overnight (e.g., 22:00 to 08:00)
      return currentTime >= startTime || currentTime <= endTime;
    }
  }

  // Check if notification should be shown based on type and config
  private shouldShowNotification(type: string, config: NotificationConfig): boolean {
    switch (type) {
      case 'message':
        return config.messageNotifications;
      case 'channel':
        return config.channelNotifications;
      case 'mention':
        return config.mentionNotifications;
      case 'file':
        return config.fileUploadNotifications;
      case 'emergency':
        return config.emergencyNotifications;
      default:
        return true;
    }
  }

  // Convert priority to notification priority
  private getNotificationPriority(priority: string): Notifications.AndroidNotificationPriority {
    switch (priority) {
      case 'urgent':
        return Notifications.AndroidNotificationPriority.MAX;
      case 'high':
        return Notifications.AndroidNotificationPriority.HIGH;
      case 'normal':
        return Notifications.AndroidNotificationPriority.DEFAULT;
      case 'low':
        return Notifications.AndroidNotificationPriority.MIN;
      default:
        return Notifications.AndroidNotificationPriority.DEFAULT;
    }
  }

  // Get notification history
  async getNotificationHistory(): Promise<any[]> {
    try {
      const response = await this.api.get('/notifications/history');
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to get notification history:', error);
      return [];
    }
  }

  // Mark notification as read
  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      await this.api.put(`/notifications/${notificationId}/read`);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }

  // Mark all notifications as read
  async markAllNotificationsAsRead(): Promise<void> {
    try {
      await this.api.put('/notifications/read-all');
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }

  // Get unread notification count
  async getUnreadCount(): Promise<number> {
    try {
      const response = await this.api.get('/notifications/unread-count');
      return response.data.data || 0;
    } catch (error) {
      console.error('Failed to get unread count:', error);
      return 0;
    }
  }

  // Test notification
  async testNotification(): Promise<void> {
    try {
      await this.sendLocalNotification({
        title: 'Test Notification',
        body: 'This is a test notification from CCN',
        type: 'system',
        priority: 'normal',
      });
    } catch (error) {
      console.error('Test notification failed:', error);
    }
  }
}

export const notificationService = new NotificationService();
export default notificationService;



