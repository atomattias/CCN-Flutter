import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/contexts/AuthContext';
import { router } from 'expo-router';

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

  const handleSecondOpinion = () => {
    router.push('/SecondOpinionScreen');
  };

  const handleAISearch = () => {
    router.push('/AISearchScreen');
  };

  const handleExplainableAI = () => {
    router.push('/ExplainableAIScreen');
  };

  const handlePatientConsultation = () => {
    router.push('/PatientConsultationScreen');
  };

  const handleChannels = () => {
    router.push('/channels');
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
              <Text style={styles.welcomeText}>Welcome, Dr. {user?.email?.split('@')[0]}</Text>
              <Text style={styles.userRole}>Clinical Communication Network</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={18} color="#FF3B30" />
          </TouchableOpacity>
        </View>

        {/* Core Features */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Core Features</Text>
          <View style={styles.featuresGrid}>
            <TouchableOpacity 
              style={[styles.featureCard, styles.primaryFeature]} 
              onPress={handleSecondOpinion}
            >
              <Ionicons name="people" size={28} color="#FFFFFF" />
              <Text style={[styles.featureTitle, { color: '#FFFFFF' }]}>Second Opinion</Text>
              <Text style={[styles.featureSubtitle, { color: '#FFFFFF' }]}>Peer consultation & case sharing</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.featureCard}
              onPress={handleChannels}
            >
              <Ionicons name="chatbubbles" size={28} color="#FF3B30" />
              <Text style={styles.featureTitle}>Channels</Text>
              <Text style={styles.featureSubtitle}>Clinical discussions</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.featureCard}
              onPress={handleAISearch}
            >
              <Ionicons name="search" size={28} color="#007AFF" />
              <Text style={styles.featureTitle}>AI Search</Text>
              <Text style={styles.featureSubtitle}>Find similar cases with AI</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.featureCard}
              onPress={handleExplainableAI}
            >
              <Ionicons name="analytics" size={28} color="#AF52DE" />
              <Text style={styles.featureTitle}>Explainable AI</Text>
              <Text style={styles.featureSubtitle}>Grad-CAM, SHAP, IG</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.featureCard}
              onPress={handlePatientConsultation}
            >
              <Ionicons name="videocam" size={28} color="#FF9500" />
              <Text style={styles.featureTitle}>Patient Consultation</Text>
              <Text style={styles.featureSubtitle}>Online patient care</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.featureCard}
              onPress={handleCreateCase}
            >
              <Ionicons name="medical" size={28} color="#34C759" />
              <Text style={styles.featureTitle}>Create Case</Text>
              <Text style={styles.featureSubtitle}>Document & structure clinical cases</Text>
            </TouchableOpacity>
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
    fontSize: 16,
    fontWeight: '700',
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
  featuresSection: {
    padding: 16,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
  primaryFeature: {
    backgroundColor: '#007AFF',
    width: '100%',
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
});