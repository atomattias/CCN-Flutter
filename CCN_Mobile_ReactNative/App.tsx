import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';

// Main App Component with Clinical Features
const CCNMobileApp: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentScreen, setCurrentScreen] = useState('home');

  const handleLogin = () => {
    if (email === 'admin@test.com' && password === 'admin123456') {
      setIsLoggedIn(true);
    } else {
      Alert.alert('Login Failed', 'Invalid credentials. Use admin@test.com / admin123456');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentScreen('home');
    setEmail('');
    setPassword('');
  };

  if (!isLoggedIn) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>CCN Mobile App</Text>
        <Text style={styles.subtitle}>Clinical Communication Network</Text>
        
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
          
          <Text style={styles.demoText}>
            Demo: admin@test.com / admin123456
          </Text>
        </View>
      </View>
    );
  }

  // Main Dashboard
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>CCN Dashboard</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {currentScreen === 'home' && (
          <View>
            <Text style={styles.sectionTitle}>Welcome to CCN!</Text>
            <Text style={styles.sectionSubtitle}>Clinical Communication Network</Text>
            
            <View style={styles.featureGrid}>
              <TouchableOpacity 
                style={styles.featureCard} 
                onPress={() => setCurrentScreen('clinical')}
              >
                <Text style={styles.featureIcon}>🏥</Text>
                <Text style={styles.featureTitle}>Clinical Q&A</Text>
                <Text style={styles.featureDesc}>Ask clinical questions and get AI analysis</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.featureCard} 
                onPress={() => setCurrentScreen('chat')}
              >
                <Text style={styles.featureIcon}>💬</Text>
                <Text style={styles.featureTitle}>Real-time Chat</Text>
                <Text style={styles.featureDesc}>Communicate with healthcare professionals</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.featureCard} 
                onPress={() => setCurrentScreen('channels')}
              >
                <Text style={styles.featureIcon}>📋</Text>
                <Text style={styles.featureTitle}>Channels</Text>
                <Text style={styles.featureDesc}>Join specialty-specific channels</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.featureCard} 
                onPress={() => setCurrentScreen('security')}
              >
                <Text style={styles.featureIcon}>🔒</Text>
                <Text style={styles.featureTitle}>Security</Text>
                <Text style={styles.featureDesc}>HIPAA compliance and encryption</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {currentScreen === 'clinical' && (
          <View>
            <TouchableOpacity style={styles.backButton} onPress={() => setCurrentScreen('home')}>
              <Text style={styles.backText}>← Back to Dashboard</Text>
            </TouchableOpacity>
            <Text style={styles.sectionTitle}>Clinical Q&A System</Text>
            <Text style={styles.sectionSubtitle}>AI-Powered Clinical Decision Support</Text>
            
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Features Available:</Text>
              <Text style={styles.infoItem}>• Post clinical questions with patient data</Text>
              <Text style={styles.infoItem}>• Upload medical images for AI analysis</Text>
              <Text style={styles.infoItem}>• Get differential diagnosis suggestions</Text>
              <Text style={styles.infoItem}>• Peer review and voting system</Text>
              <Text style={styles.infoItem}>• HIPAA-compliant data handling</Text>
            </View>
          </View>
        )}

        {currentScreen === 'chat' && (
          <View>
            <TouchableOpacity style={styles.backButton} onPress={() => setCurrentScreen('home')}>
              <Text style={styles.backText}>← Back to Dashboard</Text>
            </TouchableOpacity>
            <Text style={styles.sectionTitle}>Real-time Chat</Text>
            <Text style={styles.sectionSubtitle}>Secure Healthcare Communication</Text>
            
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Features Available:</Text>
              <Text style={styles.infoItem}>• End-to-end encrypted messaging</Text>
              <Text style={styles.infoItem}>• File sharing with medical documents</Text>
              <Text style={styles.infoItem}>• Voice and video calls (coming soon)</Text>
              <Text style={styles.infoItem}>• Message history and search</Text>
              <Text style={styles.infoItem}>• Push notifications</Text>
            </View>
          </View>
        )}

        {currentScreen === 'channels' && (
          <View>
            <TouchableOpacity style={styles.backButton} onPress={() => setCurrentScreen('home')}>
              <Text style={styles.backText}>← Back to Dashboard</Text>
            </TouchableOpacity>
            <Text style={styles.sectionTitle}>Specialty Channels</Text>
            <Text style={styles.sectionSubtitle}>Join Professional Communities</Text>
            
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Available Channels:</Text>
              <Text style={styles.infoItem}>• Cardiology</Text>
              <Text style={styles.infoItem}>• Emergency Medicine</Text>
              <Text style={styles.infoItem}>• Radiology</Text>
              <Text style={styles.infoItem}>• Pediatrics</Text>
              <Text style={styles.infoItem}>• General Medicine</Text>
            </View>
          </View>
        )}

        {currentScreen === 'security' && (
          <View>
            <TouchableOpacity style={styles.backButton} onPress={() => setCurrentScreen('home')}>
              <Text style={styles.backText}>← Back to Dashboard</Text>
            </TouchableOpacity>
            <Text style={styles.sectionTitle}>Security & Compliance</Text>
            <Text style={styles.sectionSubtitle}>HIPAA & GDPR Compliant</Text>
            
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Security Features:</Text>
              <Text style={styles.infoItem}>• End-to-end encryption</Text>
              <Text style={styles.infoItem}>• PIN and biometric authentication</Text>
              <Text style={styles.infoItem}>• Role-based access control</Text>
              <Text style={styles.infoItem}>• Audit logging</Text>
              <Text style={styles.infoItem}>• Data retention policies</Text>
            </View>
          </View>
        )}
      </ScrollView>
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
    padding: 20,
    backgroundColor: '#007AFF',
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  logoutButton: {
    padding: 8,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6C757D',
    marginBottom: 40,
    textAlign: 'center',
  },
  form: {
    width: '100%',
    maxWidth: 300,
    alignSelf: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#DEE2E6',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  demoText: {
    fontSize: 14,
    color: '#6C757D',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 10,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#6C757D',
    marginBottom: 20,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 5,
    textAlign: 'center',
  },
  featureDesc: {
    fontSize: 12,
    color: '#6C757D',
    textAlign: 'center',
    lineHeight: 16,
  },
  backButton: {
    marginBottom: 20,
  },
  backText: {
    color: '#007AFF',
    fontSize: 16,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 15,
  },
  infoItem: {
    fontSize: 16,
    color: '#495057',
    marginBottom: 8,
    lineHeight: 22,
  },
});

export default function App() {
  return (
    <>
      <StatusBar style="auto" />
      <CCNMobileApp />
    </>
  );
}
