import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

interface Channel {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  isJoined: boolean;
  type: 'general' | 'specific';
}

export default function ChannelsScreen() {
  const [channels, setChannels] = useState<Channel[]>([
    {
      id: '1',
      name: 'General Medical Discussion',
      description: 'Open discussions for all medical topics and general healthcare questions',
      memberCount: 1247,
      isJoined: true,
      type: 'general',
    },
    {
      id: '2',
      name: 'Cardiology Specialists',
      description: 'Specialized discussions for cardiology professionals and heart-related cases',
      memberCount: 89,
      isJoined: true,
      type: 'specific',
    },
    {
      id: '3',
      name: 'Emergency Medicine',
      description: 'Fast-paced discussions for emergency care and urgent medical situations',
      memberCount: 156,
      isJoined: false,
      type: 'specific',
    },
    {
      id: '4',
      name: 'Pediatrics',
      description: 'Child healthcare, pediatric medicine, and developmental discussions',
      memberCount: 203,
      isJoined: false,
      type: 'specific',
    },
    {
      id: '5',
      name: 'Neurology Network',
      description: 'Connect with neurologists and share knowledge about brain and nervous system disorders',
      memberCount: 45,
      isJoined: false,
      type: 'specific',
    },
    {
      id: '6',
      name: 'Dermatology Insights',
      description: 'Discussions on skin conditions, treatments, and dermatological procedures',
      memberCount: 30,
      isJoined: false,
      type: 'specific',
    },
    {
      id: '7',
      name: 'Surgery',
      description: 'Surgical procedures, techniques, and post-operative care discussions',
      memberCount: 98,
      isJoined: false,
      type: 'specific',
    },
    {
      id: '8',
      name: 'Radiology',
      description: 'Medical imaging, diagnostic procedures, and radiological findings',
      memberCount: 67,
      isJoined: false,
      type: 'specific',
    },
  ]);

  const handleJoinChannel = (channelId: string) => {
    setChannels(prevChannels =>
      prevChannels.map(channel =>
        channel.id === channelId
          ? { ...channel, isJoined: true, memberCount: channel.memberCount + 1 }
          : channel
      )
    );
    const channel = channels.find(c => c.id === channelId);
    Alert.alert('Success', `You have joined ${channel?.name}`);
  };

  const handleLeaveChannel = (channelId: string) => {
    setChannels(prevChannels =>
      prevChannels.map(channel =>
        channel.id === channelId
          ? { ...channel, isJoined: false, memberCount: Math.max(0, channel.memberCount - 1) }
          : channel
      )
    );
    const channel = channels.find(c => c.id === channelId);
    Alert.alert('Success', `You have left ${channel?.name}`);
  };


  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Channels</Text>
          <Text style={styles.subtitle}>Join medical discussion channels</Text>
        </View>

        <View style={styles.channelsList}>
          {channels.map((channel) => (
            <TouchableOpacity 
              key={channel.id} 
              style={styles.channelCard}
              onPress={() => router.push(`/channel/${channel.id}`)}
            >
              <View style={styles.channelHeader}>
                <View style={styles.channelInfo}>
                  <View style={styles.channelTitleRow}>
                    <Ionicons 
                      name={channel.type === 'general' ? 'globe-outline' : 'lock-closed-outline'} 
                      size={20} 
                      color={channel.type === 'general' ? '#007AFF' : '#34C759'} 
                    />
                    <Text style={styles.channelName}>{channel.name}</Text>
                  </View>
                  <Text style={styles.channelDescription}>{channel.description}</Text>
                  <View style={styles.channelMeta}>
                    <View style={styles.memberInfo}>
                      <Ionicons name="people-outline" size={16} color="#8E8E93" />
                      <Text style={styles.memberCount}>{channel.memberCount} members</Text>
                    </View>
                    <View style={[styles.typeBadge, { backgroundColor: channel.type === 'general' ? '#007AFF' : '#34C759' }]}>
                      <Text style={styles.typeText}>
                        {channel.type === 'general' ? 'General' : 'Specialist'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
              
              <View style={styles.channelActions}>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    channel.isJoined ? styles.leaveButton : styles.joinButton
                  ]}
                  onPress={(e) => {
                    e.stopPropagation();
                    channel.isJoined ? handleLeaveChannel(channel.id) : handleJoinChannel(channel.id);
                  }}
                >
                  <Text style={[
                    styles.actionButtonText,
                    channel.isJoined ? styles.leaveButtonText : styles.joinButtonText
                  ]}>
                    {channel.isJoined ? 'Joined' : 'Join'}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {channels.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={64} color="#C7C7CC" />
            <Text style={styles.emptyTitle}>No Channels Available</Text>
            <Text style={styles.emptyDescription}>
              Check back later for new channels.
            </Text>
          </View>
        )}
      </ScrollView>
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
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
  },
  channelsList: {
    padding: 16,
  },
  channelCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  channelHeader: {
    marginBottom: 16,
  },
  channelInfo: {
    flex: 1,
  },
  channelTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  channelName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginLeft: 8,
    flex: 1,
  },
  channelDescription: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
    marginBottom: 12,
  },
  channelMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberCount: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 4,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  channelActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  actionButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  joinButton: {
    backgroundColor: '#007AFF',
  },
  leaveButton: {
    backgroundColor: '#FF3B30',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  joinButtonText: {
    color: '#FFFFFF',
  },
  leaveButtonText: {
    color: '#FFFFFF',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#C7C7CC',
    textAlign: 'center',
    lineHeight: 22,
  },
});