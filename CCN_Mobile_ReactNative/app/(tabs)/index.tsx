import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/contexts/AuthContext';
import { router } from 'expo-router';

interface Channel {
  id: string;
  name: string;
  type: 'general' | 'specific';
  members: number;
  description?: string;
}

export default function HomeScreen() {
  const { user, logout } = useAuth();

  console.log('HomeScreen: Rendering home screen for user:', user?.email);

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleCreateCase = () => {
    router.push('/CreateCaseScreen');
  };





  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Ionicons name="medical" size={20} color="#007AFF" />
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.welcomeText}>Welcome back, Dr. {user?.email?.split('@')[0]}!</Text>
              <Text style={styles.userRole}>{user?.role} • Verified Medical Practitioner</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={18} color="#FF3B30" />
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity 
              style={[styles.actionCard, styles.primaryAction]} 
              onPress={handleCreateCase}
            >
              <Ionicons name="add-circle-outline" size={24} color="#FFFFFF" />
              <Text style={[styles.actionText, { color: '#FFFFFF' }]}>Create Case</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionCard} 
              onPress={() => router.push('/(tabs)/channels')}
            >
              <Ionicons name="chatbubbles-outline" size={24} color="#007AFF" />
              <Text style={styles.actionText}>Browse Channels</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Features Grid */}
        <View style={styles.featuresGrid}>
          <TouchableOpacity 
            style={styles.featureCard}
            onPress={() => router.push('/(tabs)/channels')}
          >
            <Ionicons name="chatbubbles-outline" size={32} color="#007AFF" />
            <Text style={styles.featureTitle}>Channels</Text>
            <Text style={styles.featureSubtitle}>Medical discussions</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.featureCard}
            onPress={() => Alert.alert('Messages', 'View your direct messages and communications')}
          >
            <Ionicons name="mail-outline" size={32} color="#34C759" />
            <Text style={styles.featureTitle}>Messages</Text>
            <Text style={styles.featureSubtitle}>Direct communications</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.featureCard}
            onPress={() => Alert.alert('Files', 'File management feature coming soon')}
          >
            <Ionicons name="document-outline" size={32} color="#FF9500" />
            <Text style={styles.featureTitle}>Files</Text>
            <Text style={styles.featureSubtitle}>Document sharing</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.featureCard}
            onPress={() => Alert.alert('Subscriptions', 'Subscription management feature coming soon')}
          >
            <Ionicons name="card-outline" size={32} color="#AF52DE" />
            <Text style={styles.featureTitle}>Subscriptions</Text>
            <Text style={styles.featureSubtitle}>Manage access</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Activity */}
        <View style={styles.activitySection}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityList}>
            <View style={styles.activityItem}>
              <Ionicons name="chatbubble-outline" size={20} color="#007AFF" />
              <View style={styles.activityContent}>
                <Text style={styles.activityText}>New message in Cardiology Specialists</Text>
                <Text style={styles.activityTime}>2 hours ago</Text>
              </View>
            </View>
            <View style={styles.activityItem}>
              <Ionicons name="mail-outline" size={20} color="#34C759" />
              <View style={styles.activityContent}>
                <Text style={styles.activityText}>New direct message from Dr. Smith</Text>
                <Text style={styles.activityTime}>4 hours ago</Text>
              </View>
            </View>
            <View style={styles.activityItem}>
              <Ionicons name="document-outline" size={20} color="#FF9500" />
              <View style={styles.activityContent}>
                <Text style={styles.activityText}>New file shared in Emergency Medicine</Text>
                <Text style={styles.activityTime}>1 day ago</Text>
              </View>
            </View>
          </View>
        </View>


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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 8,
    minHeight: 80,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  userDetails: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  userRole: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  logoutButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#FF3B3010',
  },
  quickActions: {
    padding: 16,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryAction: {
    backgroundColor: '#007AFF',
    width: '100%',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    marginTop: 8,
    textAlign: 'center',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    paddingTop: 0,
    paddingBottom: 8,
    justifyContent: 'space-between',
  },
  featureCard: {
    backgroundColor: '#FFFFFF',
    width: '48%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  featureSubtitle: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
  },
  activitySection: {
    padding: 16,
    paddingTop: 0,
    paddingBottom: 16,
  },
  activityList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  activityContent: {
    marginLeft: 12,
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: '#1C1C1E',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    color: '#8E8E93',
  },
});