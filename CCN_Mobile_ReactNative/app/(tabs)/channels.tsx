import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Channel {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  isJoined: boolean;
  category: string;
}

export default function ChannelsScreen() {
  const [channels] = useState<Channel[]>([
    {
      id: '1',
      name: 'General Discussion',
      description: 'General medical discussions and updates',
      memberCount: 245,
      isJoined: true,
      category: 'General',
    },
    {
      id: '2',
      name: 'Emergency Medicine',
      description: 'Emergency cases and urgent consultations',
      memberCount: 89,
      isJoined: false,
      category: 'Emergency',
    },
    {
      id: '3',
      name: 'Cardiology',
      description: 'Cardiovascular medicine discussions',
      memberCount: 156,
      isJoined: true,
      category: 'Specialty',
    },
    {
      id: '4',
      name: 'Pediatrics',
      description: 'Pediatric medicine and child health',
      memberCount: 134,
      isJoined: false,
      category: 'Specialty',
    },
    {
      id: '5',
      name: 'Surgery',
      description: 'Surgical procedures and techniques',
      memberCount: 98,
      isJoined: false,
      category: 'Specialty',
    },
  ]);

  const handleJoinChannel = (channel: Channel) => {
    Alert.alert(
      'Join Channel',
      `Do you want to join "${channel.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Join',
          onPress: () => {
            // Here you would implement the actual join logic
            Alert.alert('Success', `You have joined ${channel.name}`);
          },
        },
      ]
    );
  };

  const handleLeaveChannel = (channel: Channel) => {
    Alert.alert(
      'Leave Channel',
      `Do you want to leave "${channel.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: () => {
            // Here you would implement the actual leave logic
            Alert.alert('Success', `You have left ${channel.name}`);
          },
        },
      ]
    );
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'General':
        return '#007AFF';
      case 'Emergency':
        return '#FF3B30';
      case 'Specialty':
        return '#34C759';
      default:
        return '#8E8E93';
    }
  };

  const joinedChannels = channels.filter(channel => channel.isJoined);
  const availableChannels = channels.filter(channel => !channel.isJoined);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Channels</Text>
        <TouchableOpacity style={styles.createButton}>
          <Ionicons name="add" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {joinedChannels.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Joined Channels</Text>
          {joinedChannels.map((channel) => (
            <View key={channel.id} style={styles.channelCard}>
              <View style={styles.channelHeader}>
                <View style={styles.channelInfo}>
                  <Text style={styles.channelName}>{channel.name}</Text>
                  <Text style={styles.channelDescription}>{channel.description}</Text>
                </View>
                <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(channel.category) }]}>
                  <Text style={styles.categoryText}>{channel.category}</Text>
                </View>
              </View>
              
              <View style={styles.channelFooter}>
                <View style={styles.memberInfo}>
                  <Ionicons name="people" size={16} color="#8E8E93" />
                  <Text style={styles.memberCount}>{channel.memberCount} members</Text>
                </View>
                <TouchableOpacity
                  style={styles.leaveButton}
                  onPress={() => handleLeaveChannel(channel)}
                >
                  <Text style={styles.leaveButtonText}>Leave</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {availableChannels.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Channels</Text>
          {availableChannels.map((channel) => (
            <View key={channel.id} style={styles.channelCard}>
              <View style={styles.channelHeader}>
                <View style={styles.channelInfo}>
                  <Text style={styles.channelName}>{channel.name}</Text>
                  <Text style={styles.channelDescription}>{channel.description}</Text>
                </View>
                <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(channel.category) }]}>
                  <Text style={styles.categoryText}>{channel.category}</Text>
                </View>
              </View>
              
              <View style={styles.channelFooter}>
                <View style={styles.memberInfo}>
                  <Ionicons name="people" size={16} color="#8E8E93" />
                  <Text style={styles.memberCount}>{channel.memberCount} members</Text>
                </View>
                <TouchableOpacity
                  style={styles.joinButton}
                  onPress={() => handleJoinChannel(channel)}
                >
                  <Text style={styles.joinButtonText}>Join</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {channels.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="chatbubbles-outline" size={64} color="#C7C7CC" />
          <Text style={styles.emptyTitle}>No Channels Available</Text>
          <Text style={styles.emptyDescription}>
            Check back later for new channels or create your own.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
  },
  createButton: {
    padding: 8,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  channelInfo: {
    flex: 1,
    marginRight: 12,
  },
  channelName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  channelDescription: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  channelFooter: {
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
  joinButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  joinButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  leaveButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  leaveButtonText: {
    fontSize: 14,
    fontWeight: '600',
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

