import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Notification {
  id: string;
  type: 'case' | 'ai' | 'privacy' | 'system';
  title: string;
  message: string;
  time: string;
  isRead: boolean;
}

export default function NotificationsScreen() {
  // Mock notifications data - in real app, this would come from a context or API
  const notifications: Notification[] = [
    {
      id: '1',
      type: 'case',
      title: 'New Case Created',
      message: 'Complex cardiac anomaly in pediatric patient',
      time: '2 hours ago',
      isRead: false,
    },
    {
      id: '2',
      type: 'ai',
      title: 'AI Search Results',
      message: 'Found 3 similar cases in knowledge base',
      time: '4 hours ago',
      isRead: false,
    },
    {
      id: '3',
      type: 'privacy',
      title: 'Data Anonymized',
      message: 'Patient data anonymized using GDPR protocols',
      time: '1 day ago',
      isRead: true,
    },
    {
      id: '4',
      type: 'system',
      title: 'System Update',
      message: 'Explainable AI models updated with latest improvements',
      time: '2 days ago',
      isRead: true,
    },
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'case':
        return <Ionicons name="medical" size={20} color="#007AFF" />;
      case 'ai':
        return <Ionicons name="search" size={20} color="#34C759" />;
      case 'privacy':
        return <Ionicons name="shield-checkmark" size={20} color="#FF9500" />;
      case 'system':
        return <Ionicons name="settings" size={20} color="#AF52DE" />;
      default:
        return <Ionicons name="notifications" size={20} color="#8E8E93" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'case':
        return '#007AFF';
      case 'ai':
        return '#34C759';
      case 'privacy':
        return '#FF9500';
      case 'system':
        return '#AF52DE';
      default:
        return '#8E8E93';
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Activity</Text>
          <TouchableOpacity style={styles.markAllButton}>
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        </View>

        {/* Notifications List */}
        <ScrollView style={styles.notificationsList} showsVerticalScrollIndicator={false}>
          {notifications.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              style={[
                styles.notificationItem,
                !notification.isRead && styles.unreadNotification
              ]}
            >
              <View style={styles.notificationContent}>
                <View style={styles.notificationIcon}>
                  {getNotificationIcon(notification.type)}
                </View>
                <View style={styles.notificationText}>
                  <Text style={[
                    styles.notificationTitle,
                    !notification.isRead && styles.unreadTitle
                  ]}>
                    {notification.title}
                  </Text>
                  <Text style={styles.notificationMessage}>
                    {notification.message}
                  </Text>
                  <Text style={styles.notificationTime}>
                    {notification.time}
                  </Text>
                </View>
                {!notification.isRead && (
                  <View style={[
                    styles.unreadDot,
                    { backgroundColor: getNotificationColor(notification.type) }
                  ]} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Empty State (if no notifications) */}
        {notifications.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-outline" size={64} color="#8E8E93" />
            <Text style={styles.emptyStateTitle}>No Activity</Text>
            <Text style={styles.emptyStateMessage}>
              You'll see recent activity and notifications here
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  markAllButton: {
    padding: 8,
  },
  markAllText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  notificationsList: {
    flex: 1,
    padding: 16,
  },
  notificationItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
  },
  notificationIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  notificationText: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  unreadTitle: {
    fontWeight: '700',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
    lineHeight: 20,
  },
  notificationTime: {
    fontSize: 12,
    color: '#8E8E93',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateMessage: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 24,
  },
});
