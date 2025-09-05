import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Channel } from '../types';
import { CustomButton } from '../components/CustomButton';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';

export const ChannelsScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Mock data for now - will be replaced with API calls
  useEffect(() => {
    loadChannels();
  }, []);

  const loadChannels = async () => {
    setLoading(true);
    // TODO: Replace with actual API call
    const mockChannels: Channel[] = [
      {
        _id: '1',
        owner: 'admin',
        name: 'General Discussion',
        description: 'General topics and announcements',
        tag: 'general',
        specialty: false,
        users: ['admin', 'user1', 'user2'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: '2',
        owner: 'admin',
        name: 'Emergency Alerts',
        description: 'Critical updates and emergency information',
        tag: 'emergency',
        specialty: true,
        users: ['admin', 'user1'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: '3',
        owner: 'user1',
        name: 'Medical Updates',
        description: 'Latest medical research and updates',
        tag: 'medical',
        specialty: true,
        users: ['user1', 'user2'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    
    setChannels(mockChannels);
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadChannels();
    setRefreshing(false);
  };

  const handleJoinChannel = (channel: Channel) => {
    Alert.alert(
      'Join Channel',
      `Would you like to join "${channel.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Join', onPress: () => joinChannel(channel) }
      ]
    );
  };

  const joinChannel = async (channel: Channel) => {
    // TODO: Implement API call to join channel
    Alert.alert('Success', `You have joined ${channel.name}!`);
  };

  const handleCreateChannel = () => {
    Alert.alert('Create Channel', 'Channel creation feature coming soon!');
  };

  const renderChannelItem = ({ item }: { item: Channel }) => (
    <TouchableOpacity 
      style={styles.channelItem}
      onPress={() => navigation.navigate('Chat', { channel: item })}
    >
      <View style={styles.channelHeader}>
        <View style={styles.channelInfo}>
          <Text style={styles.channelName}>{item.name}</Text>
          <View style={styles.channelMeta}>
            <View style={[styles.tag, { backgroundColor: item.specialty ? '#FF9500' : '#34C759' }]}>
              <Text style={styles.tagText}>{item.specialty ? 'Specialty' : 'General'}</Text>
            </View>
            <Text style={styles.userCount}>{item.users.length} members</Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.joinButton}
          onPress={() => handleJoinChannel(item)}
        >
          <Ionicons name="add-circle-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>
      
      <Text style={styles.channelDescription}>{item.description}</Text>
      
      <View style={styles.channelFooter}>
        <Text style={styles.channelTag}>#{item.tag}</Text>
        <Text style={styles.channelDate}>
          Created {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="chatbubbles-outline" size={64} color="#C7C7CC" />
        <Text style={styles.loadingText}>Loading channels...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Channels</Text>
        <TouchableOpacity style={styles.createButton} onPress={handleCreateChannel}>
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Channel List */}
      <FlatList
        data={channels}
        renderItem={renderChannelItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={64} color="#C7C7CC" />
            <Text style={styles.emptyStateText}>No channels available</Text>
            <Text style={styles.emptyStateSubtext}>Create a channel to get started</Text>
            <CustomButton
              title="Create Channel"
              onPress={handleCreateChannel}
              style={styles.createChannelButton}
            />
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  createButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 20,
  },
  channelItem: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
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
  },
  channelName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  channelMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 12,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'white',
  },
  userCount: {
    fontSize: 12,
    color: '#8E8E93',
  },
  joinButton: {
    padding: 8,
  },
  channelDescription: {
    fontSize: 14,
    color: '#6C757D',
    lineHeight: 20,
    marginBottom: 16,
  },
  channelFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  channelTag: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  channelDate: {
    fontSize: 12,
    color: '#8E8E93',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#8E8E93',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#C7C7CC',
    textAlign: 'center',
    marginBottom: 24,
  },
  createChannelButton: {
    width: 200,
  },
});

