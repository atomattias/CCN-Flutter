import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { Channel, Message } from '../types';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  const [recentChannels, setRecentChannels] = useState<Channel[]>([]);
  const [recentMessages, setRecentMessages] = useState<Message[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    // TODO: Fetch recent data
    setTimeout(() => setRefreshing(false), 1000);
  };

  const quickActions = [
    { title: 'New Message', icon: 'chatbubble-ellipses', color: '#007AFF', action: () => navigation.navigate('Chat', { channel: { _id: 'new', owner: '', name: 'New Chat', description: '', tag: '', specialty: false, users: [], createdAt: '', updatedAt: '' } }) },
    { title: 'Join Channel', icon: 'add-circle', color: '#34C759', action: () => navigation.navigate('Main', { screen: 'Channels' }) },
    { title: 'Create Channel', icon: 'create', color: '#FF9500', action: () => Alert.alert('Create Channel', 'Channel creation feature coming soon!') },
    { title: 'Search Users', icon: 'search', color: '#AF52DE', action: () => Alert.alert('Search Users', 'User search feature coming soon!') },
  ];

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Good morning, {user?.fullname?.split(' ')[0] || 'User'}!</Text>
        <Text style={styles.date}>{new Date().toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</Text>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          {quickActions.map((action, index) => (
            <TouchableOpacity key={index} style={styles.actionButton} onPress={action.action}>
              <View style={[styles.actionIcon, { backgroundColor: action.color }]}>
                <Ionicons name={action.icon as any} size={24} color="white" />
              </View>
              <Text style={styles.actionTitle}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Recent Channels */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Channels</Text>
        {recentChannels.length > 0 ? (
          recentChannels.map((channel) => (
            <TouchableOpacity 
              key={channel._id} 
              style={styles.channelItem}
              onPress={() => navigation.navigate('Chat', { channel })}
            >
              <View style={styles.channelIcon}>
                <Ionicons name="chatbubbles" size={20} color="#007AFF" />
              </View>
              <View style={styles.channelInfo}>
                <Text style={styles.channelName}>{channel.name}</Text>
                <Text style={styles.channelDescription}>{channel.description || 'No description'}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={48} color="#C7C7CC" />
            <Text style={styles.emptyStateText}>No recent channels</Text>
            <Text style={styles.emptyStateSubtext}>Join or create channels to get started</Text>
          </View>
        )}
      </View>

      {/* Recent Messages */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Messages</Text>
        {recentMessages.length > 0 ? (
          recentMessages.map((message) => (
            <TouchableOpacity key={message._id} style={styles.messageItem}>
              <View style={styles.messageAvatar}>
                <Text style={styles.avatarText}>
                  {(message.user as any)?.fullname?.charAt(0) || 'U'}
                </Text>
              </View>
              <View style={styles.messageInfo}>
                <Text style={styles.messageSender}>
                  {(message.user as any)?.fullname || 'Unknown User'}
                </Text>
                <Text style={styles.messageContent} numberOfLines={2}>
                  {message.content}
                </Text>
                <Text style={styles.messageTime}>
                  {new Date(message.createdAt).toLocaleTimeString()}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="mail-outline" size={48} color="#C7C7CC" />
            <Text style={styles.emptyStateText}>No recent messages</Text>
            <Text style={styles.emptyStateSubtext}>Start conversations in channels</Text>
          </View>
        )}
      </View>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#007AFF',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  date: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  section: {
    padding: 20,
    backgroundColor: 'white',
    marginTop: 20,
    marginHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 20,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    alignItems: 'center',
    width: '48%',
    marginBottom: 20,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1C1C1E',
    textAlign: 'center',
  },
  channelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  channelIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  channelInfo: {
    flex: 1,
  },
  channelName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  channelDescription: {
    fontSize: 14,
    color: '#8E8E93',
  },
  messageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  messageAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  messageInfo: {
    flex: 1,
  },
  messageSender: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  messageContent: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  messageTime: {
    fontSize: 12,
    color: '#C7C7CC',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#8E8E93',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#C7C7CC',
    textAlign: 'center',
  },
  bottomSpacing: {
    height: 100,
  },
});

