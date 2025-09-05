import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';

// Main App Component with Clinical Features
const CCNMobileApp: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentScreen, setCurrentScreen] = useState('home');
  const [selectedChannel, setSelectedChannel] = useState(null);

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
    setSelectedChannel(null);
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
            
            <View style={styles.headerSection}>
              <Text style={styles.sectionTitle}>Clinical Q&A System</Text>
              <Text style={styles.sectionSubtitle}>AI-Powered Clinical Decision Support</Text>
            </View>

            <View style={styles.featureGrid}>
              <TouchableOpacity style={styles.featureCard}>
                <View style={styles.featureIconContainer}>
                  <Text style={styles.featureIcon}>📝</Text>
                </View>
                <Text style={styles.featureTitle}>Post Question</Text>
                <Text style={styles.featureDesc}>Submit clinical cases with patient data</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.featureCard}>
                <View style={styles.featureIconContainer}>
                  <Text style={styles.featureIcon}>🖼️</Text>
                </View>
                <Text style={styles.featureTitle}>Image Analysis</Text>
                <Text style={styles.featureDesc}>Upload medical images for AI analysis</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.featureCard}>
                <View style={styles.featureIconContainer}>
                  <Text style={styles.featureIcon}>🤖</Text>
                </View>
                <Text style={styles.featureTitle}>AI Diagnosis</Text>
                <Text style={styles.featureDesc}>Get differential diagnosis suggestions</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.featureCard}>
                <View style={styles.featureIconContainer}>
                  <Text style={styles.featureIcon}>👥</Text>
                </View>
                <Text style={styles.featureTitle}>Peer Review</Text>
                <Text style={styles.featureDesc}>Collaborate with other clinicians</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>1,247</Text>
                <Text style={styles.statLabel}>Questions Asked</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>89%</Text>
                <Text style={styles.statLabel}>AI Accuracy</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>156</Text>
                <Text style={styles.statLabel}>Active Clinicians</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Start New Question</Text>
            </TouchableOpacity>
          </View>
        )}

        {currentScreen === 'chat' && (
          <View>
            <TouchableOpacity style={styles.backButton} onPress={() => setCurrentScreen('home')}>
              <Text style={styles.backText}>← Back to Dashboard</Text>
            </TouchableOpacity>
            
            <View style={styles.headerSection}>
              <Text style={styles.sectionTitle}>Real-time Chat</Text>
              <Text style={styles.sectionSubtitle}>Secure Healthcare Communication</Text>
            </View>

            <View style={styles.chatPreview}>
              <View style={styles.chatItem}>
                <View style={styles.chatAvatar}>
                  <Text style={styles.chatAvatarText}>DR</Text>
                </View>
                <View style={styles.chatContent}>
                  <Text style={styles.chatName}>Dr. Sarah Johnson</Text>
                  <Text style={styles.chatMessage}>Can you review this chest X-ray?</Text>
                  <Text style={styles.chatTime}>2 min ago</Text>
                </View>
                <View style={styles.chatBadge}>
                  <Text style={styles.chatBadgeText}>2</Text>
                </View>
              </View>

              <View style={styles.chatItem}>
                <View style={styles.chatAvatar}>
                  <Text style={styles.chatAvatarText}>MR</Text>
                </View>
                <View style={styles.chatContent}>
                  <Text style={styles.chatName}>Dr. Michael Rodriguez</Text>
                  <Text style={styles.chatMessage}>Emergency case discussion</Text>
                  <Text style={styles.chatTime}>5 min ago</Text>
                </View>
              </View>

              <View style={styles.chatItem}>
                <View style={styles.chatAvatar}>
                  <Text style={styles.chatAvatarText}>AL</Text>
                </View>
                <View style={styles.chatContent}>
                  <Text style={styles.chatName}>Dr. Alice Lee</Text>
                  <Text style={styles.chatMessage}>Patient consultation notes</Text>
                  <Text style={styles.chatTime}>1 hour ago</Text>
                </View>
              </View>
            </View>

            <View style={styles.featureGrid}>
              <TouchableOpacity style={styles.featureCard}>
                <View style={styles.featureIconContainer}>
                  <Text style={styles.featureIcon}>🔒</Text>
                </View>
                <Text style={styles.featureTitle}>Encrypted</Text>
                <Text style={styles.featureDesc}>End-to-end encryption</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.featureCard}>
                <View style={styles.featureIconContainer}>
                  <Text style={styles.featureIcon}>📎</Text>
                </View>
                <Text style={styles.featureTitle}>File Share</Text>
                <Text style={styles.featureDesc}>Medical documents</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.featureCard}>
                <View style={styles.featureIconContainer}>
                  <Text style={styles.featureIcon}>🔍</Text>
                </View>
                <Text style={styles.featureTitle}>Search</Text>
                <Text style={styles.featureDesc}>Message history</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.featureCard}>
                <View style={styles.featureIconContainer}>
                  <Text style={styles.featureIcon}>🔔</Text>
                </View>
                <Text style={styles.featureTitle}>Notifications</Text>
                <Text style={styles.featureDesc}>Real-time alerts</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Start New Chat</Text>
            </TouchableOpacity>
          </View>
        )}

        {currentScreen === 'channels' && (
          <View>
            <TouchableOpacity style={styles.backButton} onPress={() => setCurrentScreen('home')}>
              <Text style={styles.backText}>← Back to Dashboard</Text>
            </TouchableOpacity>
            
            <View style={styles.headerSection}>
              <Text style={styles.sectionTitle}>Specialty Channels</Text>
              <Text style={styles.sectionSubtitle}>Join Professional Communities</Text>
            </View>

            <View style={styles.channelList}>
              <TouchableOpacity style={styles.channelItem} onPress={() => { setSelectedChannel('cardiology'); setCurrentScreen('channel'); }}>
                <View style={styles.channelIcon}>
                  <Text style={styles.channelEmoji}>❤️</Text>
                </View>
                <View style={styles.channelInfo}>
                  <Text style={styles.channelName}>Cardiology</Text>
                  <Text style={styles.channelDesc}>Heart and cardiovascular system</Text>
                  <Text style={styles.channelMembers}>342 members • 12 online</Text>
                </View>
                <View style={styles.channelBadge}>
                  <Text style={styles.channelBadgeText}>Active</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.channelItem} onPress={() => { setSelectedChannel('emergency'); setCurrentScreen('channel'); }}>
                <View style={styles.channelIcon}>
                  <Text style={styles.channelEmoji}>🚨</Text>
                </View>
                <View style={styles.channelInfo}>
                  <Text style={styles.channelName}>Emergency Medicine</Text>
                  <Text style={styles.channelDesc}>Urgent care and trauma</Text>
                  <Text style={styles.channelMembers}>189 members • 8 online</Text>
                </View>
                <View style={styles.channelBadge}>
                  <Text style={styles.channelBadgeText}>Active</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.channelItem} onPress={() => { setSelectedChannel('radiology'); setCurrentScreen('channel'); }}>
                <View style={styles.channelIcon}>
                  <Text style={styles.channelEmoji}>📷</Text>
                </View>
                <View style={styles.channelInfo}>
                  <Text style={styles.channelName}>Radiology</Text>
                  <Text style={styles.channelDesc}>Medical imaging and diagnostics</Text>
                  <Text style={styles.channelMembers}>156 members • 5 online</Text>
                </View>
                <View style={styles.channelBadge}>
                  <Text style={styles.channelBadgeText}>Active</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.channelItem} onPress={() => { setSelectedChannel('pediatrics'); setCurrentScreen('channel'); }}>
                <View style={styles.channelIcon}>
                  <Text style={styles.channelEmoji}>👶</Text>
                </View>
                <View style={styles.channelInfo}>
                  <Text style={styles.channelName}>Pediatrics</Text>
                  <Text style={styles.channelDesc}>Child and adolescent medicine</Text>
                  <Text style={styles.channelMembers}>278 members • 15 online</Text>
                </View>
                <View style={styles.channelBadge}>
                  <Text style={styles.channelBadgeText}>Active</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.channelItem} onPress={() => { setSelectedChannel('general'); setCurrentScreen('channel'); }}>
                <View style={styles.channelIcon}>
                  <Text style={styles.channelEmoji}>🩺</Text>
                </View>
                <View style={styles.channelInfo}>
                  <Text style={styles.channelName}>General Medicine</Text>
                  <Text style={styles.channelDesc}>Primary care and general practice</Text>
                  <Text style={styles.channelMembers}>445 members • 23 online</Text>
                </View>
                <View style={styles.channelBadge}>
                  <Text style={styles.channelBadgeText}>Active</Text>
                </View>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Create New Channel</Text>
            </TouchableOpacity>
          </View>
        )}

        {currentScreen === 'security' && (
          <View>
            <TouchableOpacity style={styles.backButton} onPress={() => setCurrentScreen('home')}>
              <Text style={styles.backText}>← Back to Dashboard</Text>
            </TouchableOpacity>
            
            <View style={styles.headerSection}>
              <Text style={styles.sectionTitle}>Security & Compliance</Text>
              <Text style={styles.sectionSubtitle}>HIPAA & GDPR Compliant</Text>
            </View>

            <View style={styles.securityStatus}>
              <View style={styles.statusCard}>
                <View style={styles.statusIcon}>
                  <Text style={styles.statusEmoji}>🔒</Text>
                </View>
                <Text style={styles.statusTitle}>Encryption</Text>
                <Text style={styles.statusValue}>Active</Text>
                <Text style={styles.statusDesc}>AES-256 & RSA-4096</Text>
              </View>

              <View style={styles.statusCard}>
                <View style={styles.statusIcon}>
                  <Text style={styles.statusEmoji}>🛡️</Text>
                </View>
                <Text style={styles.statusTitle}>HIPAA</Text>
                <Text style={styles.statusValue}>Compliant</Text>
                <Text style={styles.statusDesc}>100% compliance</Text>
              </View>

              <View style={styles.statusCard}>
                <View style={styles.statusIcon}>
                  <Text style={styles.statusEmoji}>🔐</Text>
                </View>
                <Text style={styles.statusTitle}>Authentication</Text>
                <Text style={styles.statusValue}>Secure</Text>
                <Text style={styles.statusDesc}>PIN + Biometric</Text>
              </View>
            </View>

            <View style={styles.complianceGrid}>
              <View style={styles.complianceItem}>
                <Text style={styles.complianceIcon}>✅</Text>
                <Text style={styles.complianceTitle}>End-to-End Encryption</Text>
                <Text style={styles.complianceDesc}>All data encrypted in transit and at rest</Text>
              </View>

              <View style={styles.complianceItem}>
                <Text style={styles.complianceIcon}>✅</Text>
                <Text style={styles.complianceTitle}>Role-Based Access</Text>
                <Text style={styles.complianceDesc}>Granular permissions and access control</Text>
              </View>

              <View style={styles.complianceItem}>
                <Text style={styles.complianceIcon}>✅</Text>
                <Text style={styles.complianceTitle}>Audit Logging</Text>
                <Text style={styles.complianceDesc}>Complete activity tracking and monitoring</Text>
              </View>

              <View style={styles.complianceItem}>
                <Text style={styles.complianceIcon}>✅</Text>
                <Text style={styles.complianceTitle}>Data Retention</Text>
                <Text style={styles.complianceDesc}>Automated data lifecycle management</Text>
              </View>
            </View>

            <View style={styles.securityMetrics}>
              <Text style={styles.metricsTitle}>Security Metrics</Text>
              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>Last Security Scan:</Text>
                <Text style={styles.metricValue}>2 hours ago</Text>
              </View>
              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>Vulnerabilities Found:</Text>
                <Text style={styles.metricValue}>0</Text>
              </View>
              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>Compliance Score:</Text>
                <Text style={styles.metricValue}>100%</Text>
              </View>
            </View>
          </View>
        )}

        {currentScreen === 'channel' && (
          <View>
            <TouchableOpacity style={styles.backButton} onPress={() => { setCurrentScreen('channels'); setSelectedChannel(null); }}>
              <Text style={styles.backText}>← Back to Channels</Text>
            </TouchableOpacity>
            
            {selectedChannel === 'cardiology' && (
              <View>
                <View style={styles.channelHeader}>
                  <View style={styles.channelHeaderIcon}>
                    <Text style={styles.channelHeaderEmoji}>❤️</Text>
                  </View>
                  <View style={styles.channelHeaderInfo}>
                    <Text style={styles.channelHeaderTitle}>Cardiology</Text>
                    <Text style={styles.channelHeaderSubtitle}>Heart and Cardiovascular System</Text>
                    <Text style={styles.channelHeaderStats}>342 members • 12 online • 24 discussions today</Text>
                  </View>
                </View>

                <View style={styles.channelTabs}>
                  <TouchableOpacity style={styles.channelTab}>
                    <Text style={styles.channelTabText}>Discussions</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.channelTab}>
                    <Text style={styles.channelTabText}>Cases</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.channelTab}>
                    <Text style={styles.channelTabText}>Resources</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.channelContent}>
                  <View style={styles.discussionItem}>
                    <View style={styles.discussionHeader}>
                      <View style={styles.discussionAvatar}>
                        <Text style={styles.discussionAvatarText}>DR</Text>
                      </View>
                      <View style={styles.discussionInfo}>
                        <Text style={styles.discussionAuthor}>Dr. Sarah Johnson</Text>
                        <Text style={styles.discussionTime}>2 hours ago</Text>
                      </View>
                      <View style={styles.discussionBadge}>
                        <Text style={styles.discussionBadgeText}>Hot</Text>
                      </View>
                    </View>
                    <Text style={styles.discussionTitle}>Acute MI Management Protocol</Text>
                    <Text style={styles.discussionPreview}>What's the latest evidence on dual antiplatelet therapy duration for STEMI patients?</Text>
                    <View style={styles.discussionStats}>
                      <Text style={styles.discussionStat}>💬 12 replies</Text>
                      <Text style={styles.discussionStat}>👍 8 likes</Text>
                      <Text style={styles.discussionStat}>👁️ 45 views</Text>
                    </View>
                  </View>

                  <View style={styles.discussionItem}>
                    <View style={styles.discussionHeader}>
                      <View style={styles.discussionAvatar}>
                        <Text style={styles.discussionAvatarText}>MR</Text>
                      </View>
                      <View style={styles.discussionInfo}>
                        <Text style={styles.discussionAuthor}>Dr. Michael Rodriguez</Text>
                        <Text style={styles.discussionTime}>4 hours ago</Text>
                      </View>
                    </View>
                    <Text style={styles.discussionTitle}>Echocardiogram Interpretation</Text>
                    <Text style={styles.discussionPreview}>Need help interpreting this echo showing moderate mitral regurgitation...</Text>
                    <View style={styles.discussionStats}>
                      <Text style={styles.discussionStat}>💬 7 replies</Text>
                      <Text style={styles.discussionStat}>👍 5 likes</Text>
                      <Text style={styles.discussionStat}>👁️ 32 views</Text>
                    </View>
                  </View>

                  <View style={styles.discussionItem}>
                    <View style={styles.discussionHeader}>
                      <View style={styles.discussionAvatar}>
                        <Text style={styles.discussionAvatarText}>AL</Text>
                      </View>
                      <View style={styles.discussionInfo}>
                        <Text style={styles.discussionAuthor}>Dr. Alice Lee</Text>
                        <Text style={styles.discussionTime}>6 hours ago</Text>
                      </View>
                    </View>
                    <Text style={styles.discussionTitle}>Heart Failure Guidelines Update</Text>
                    <Text style={styles.discussionPreview}>New ESC guidelines for heart failure management - key changes and implications</Text>
                    <View style={styles.discussionStats}>
                      <Text style={styles.discussionStat}>💬 15 replies</Text>
                      <Text style={styles.discussionStat}>👍 12 likes</Text>
                      <Text style={styles.discussionStat}>👁️ 67 views</Text>
                    </View>
                  </View>
                </View>

                <TouchableOpacity style={styles.primaryButton}>
                  <Text style={styles.primaryButtonText}>Start New Discussion</Text>
                </TouchableOpacity>
              </View>
            )}

            {selectedChannel === 'emergency' && (
              <View>
                <View style={styles.channelHeader}>
                  <View style={styles.channelHeaderIcon}>
                    <Text style={styles.channelHeaderEmoji}>🚨</Text>
                  </View>
                  <View style={styles.channelHeaderInfo}>
                    <Text style={styles.channelHeaderTitle}>Emergency Medicine</Text>
                    <Text style={styles.channelHeaderSubtitle}>Urgent Care and Trauma</Text>
                    <Text style={styles.channelHeaderStats}>189 members • 8 online • 15 cases today</Text>
                  </View>
                </View>

                <View style={styles.channelTabs}>
                  <TouchableOpacity style={styles.channelTab}>
                    <Text style={styles.channelTabText}>Active Cases</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.channelTab}>
                    <Text style={styles.channelTabText}>Protocols</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.channelTab}>
                    <Text style={styles.channelTabText}>Alerts</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.channelContent}>
                  <View style={styles.emergencyAlert}>
                    <View style={styles.alertHeader}>
                      <Text style={styles.alertIcon}>🚨</Text>
                      <Text style={styles.alertTitle}>URGENT: Trauma Protocol</Text>
                      <Text style={styles.alertTime}>5 min ago</Text>
                    </View>
                    <Text style={styles.alertMessage}>Multiple trauma victims incoming - activate Level 1 trauma protocol</Text>
                    <View style={styles.alertActions}>
                      <TouchableOpacity style={styles.alertButton}>
                        <Text style={styles.alertButtonText}>Acknowledge</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.alertButtonSecondary}>
                        <Text style={styles.alertButtonSecondaryText}>View Details</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.discussionItem}>
                    <View style={styles.discussionHeader}>
                      <View style={styles.discussionAvatar}>
                        <Text style={styles.discussionAvatarText}>DR</Text>
                      </View>
                      <View style={styles.discussionInfo}>
                        <Text style={styles.discussionAuthor}>Dr. Sarah Johnson</Text>
                        <Text style={styles.discussionTime}>1 hour ago</Text>
                      </View>
                      <View style={styles.discussionBadge}>
                        <Text style={styles.discussionBadgeText}>Active</Text>
                      </View>
                    </View>
                    <Text style={styles.discussionTitle}>Chest Pain Workup</Text>
                    <Text style={styles.discussionPreview}>65-year-old male with acute chest pain, normal EKG, elevated troponins...</Text>
                    <View style={styles.discussionStats}>
                      <Text style={styles.discussionStat}>💬 8 replies</Text>
                      <Text style={styles.discussionStat}>👍 3 likes</Text>
                      <Text style={styles.discussionStat}>👁️ 28 views</Text>
                    </View>
                  </View>

                  <View style={styles.discussionItem}>
                    <View style={styles.discussionHeader}>
                      <View style={styles.discussionAvatar}>
                        <Text style={styles.discussionAvatarText}>MR</Text>
                      </View>
                      <View style={styles.discussionInfo}>
                        <Text style={styles.discussionAuthor}>Dr. Michael Rodriguez</Text>
                        <Text style={styles.discussionTime}>3 hours ago</Text>
                      </View>
                    </View>
                    <Text style={styles.discussionTitle}>Sepsis Protocol Update</Text>
                    <Text style={styles.discussionPreview}>New sepsis bundle requirements - antibiotic timing and fluid resuscitation</Text>
                    <View style={styles.discussionStats}>
                      <Text style={styles.discussionStat}>💬 12 replies</Text>
                      <Text style={styles.discussionStat}>👍 9 likes</Text>
                      <Text style={styles.discussionStat}>👁️ 41 views</Text>
                    </View>
                  </View>
                </View>

                <TouchableOpacity style={styles.primaryButton}>
                  <Text style={styles.primaryButtonText}>Report Emergency Case</Text>
                </TouchableOpacity>
              </View>
            )}

            {selectedChannel === 'radiology' && (
              <View>
                <View style={styles.channelHeader}>
                  <View style={styles.channelHeaderIcon}>
                    <Text style={styles.channelHeaderEmoji}>📷</Text>
                  </View>
                  <View style={styles.channelHeaderInfo}>
                    <Text style={styles.channelHeaderTitle}>Radiology</Text>
                    <Text style={styles.channelHeaderSubtitle}>Medical Imaging and Diagnostics</Text>
                    <Text style={styles.channelHeaderStats}>156 members • 5 online • 18 studies today</Text>
                  </View>
                </View>

                <View style={styles.channelTabs}>
                  <TouchableOpacity style={styles.channelTab}>
                    <Text style={styles.channelTabText}>Studies</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.channelTab}>
                    <Text style={styles.channelTabText}>AI Analysis</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.channelTab}>
                    <Text style={styles.channelTabText}>Protocols</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.channelContent}>
                  <View style={styles.studyItem}>
                    <View style={styles.studyHeader}>
                      <View style={styles.studyAvatar}>
                        <Text style={styles.studyAvatarText}>DR</Text>
                      </View>
                      <View style={styles.studyInfo}>
                        <Text style={styles.studyAuthor}>Dr. Sarah Johnson</Text>
                        <Text style={styles.studyTime}>30 min ago</Text>
                      </View>
                      <View style={styles.studyBadge}>
                        <Text style={styles.studyBadgeText}>AI Ready</Text>
                      </View>
                    </View>
                    <Text style={styles.studyTitle}>Chest X-Ray - Pneumonia</Text>
                    <Text style={styles.studyPreview}>45-year-old female with fever and cough. Please review for consolidation patterns.</Text>
                    <View style={styles.studyStats}>
                      <Text style={styles.studyStat}>🤖 AI Analysis: 87% confidence</Text>
                      <Text style={styles.studyStat}>👁️ 12 views</Text>
                    </View>
                  </View>

                  <View style={styles.studyItem}>
                    <View style={styles.studyHeader}>
                      <View style={styles.studyAvatar}>
                        <Text style={styles.studyAvatarText}>MR</Text>
                      </View>
                      <View style={styles.studyInfo}>
                        <Text style={styles.studyAuthor}>Dr. Michael Rodriguez</Text>
                        <Text style={styles.studyTime}>2 hours ago</Text>
                      </View>
                    </View>
                    <Text style={styles.studyTitle}>CT Abdomen - Appendicitis</Text>
                    <Text style={styles.studyPreview}>28-year-old male with RLQ pain. CT shows possible appendiceal wall thickening.</Text>
                    <View style={styles.studyStats}>
                      <Text style={styles.studyStat}>🤖 AI Analysis: 92% confidence</Text>
                      <Text style={styles.studyStat}>👁️ 8 views</Text>
                    </View>
                  </View>

                  <View style={styles.studyItem}>
                    <View style={styles.studyHeader}>
                      <View style={styles.studyAvatar}>
                        <Text style={styles.studyAvatarText}>AL</Text>
                      </View>
                      <View style={styles.studyInfo}>
                        <Text style={styles.studyAuthor}>Dr. Alice Lee</Text>
                        <Text style={styles.studyTime}>4 hours ago</Text>
                      </View>
                    </View>
                    <Text style={styles.studyTitle}>MRI Brain - Stroke</Text>
                    <Text style={styles.studyPreview}>67-year-old male with acute onset weakness. DWI shows hyperintense lesion in MCA territory.</Text>
                    <View style={styles.studyStats}>
                      <Text style={styles.studyStat}>🤖 AI Analysis: 95% confidence</Text>
                      <Text style={styles.studyStat}>👁️ 15 views</Text>
                    </View>
                  </View>
                </View>

                <TouchableOpacity style={styles.primaryButton}>
                  <Text style={styles.primaryButtonText}>Upload New Study</Text>
                </TouchableOpacity>
              </View>
            )}

            {selectedChannel === 'pediatrics' && (
              <View>
                <View style={styles.channelHeader}>
                  <View style={styles.channelHeaderIcon}>
                    <Text style={styles.channelHeaderEmoji}>👶</Text>
                  </View>
                  <View style={styles.channelHeaderInfo}>
                    <Text style={styles.channelHeaderTitle}>Pediatrics</Text>
                    <Text style={styles.channelHeaderSubtitle}>Child and Adolescent Medicine</Text>
                    <Text style={styles.channelHeaderStats}>278 members • 15 online • 22 cases today</Text>
                  </View>
                </View>

                <View style={styles.channelTabs}>
                  <TouchableOpacity style={styles.channelTab}>
                    <Text style={styles.channelTabText}>Cases</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.channelTab}>
                    <Text style={styles.channelTabText}>Growth Charts</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.channelTab}>
                    <Text style={styles.channelTabText}>Vaccines</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.channelContent}>
                  <View style={styles.discussionItem}>
                    <View style={styles.discussionHeader}>
                      <View style={styles.discussionAvatar}>
                        <Text style={styles.discussionAvatarText}>DR</Text>
                      </View>
                      <View style={styles.discussionInfo}>
                        <Text style={styles.discussionAuthor}>Dr. Sarah Johnson</Text>
                        <Text style={styles.discussionTime}>1 hour ago</Text>
                      </View>
                      <View style={styles.discussionBadge}>
                        <Text style={styles.discussionBadgeText}>Urgent</Text>
                      </View>
                    </View>
                    <Text style={styles.discussionTitle}>Febrile Seizure in 18-month-old</Text>
                    <Text style={styles.discussionPreview}>First-time febrile seizure, temperature 39.2°C, duration 2 minutes. Need guidance on workup.</Text>
                    <View style={styles.discussionStats}>
                      <Text style={styles.discussionStat}>💬 6 replies</Text>
                      <Text style={styles.discussionStat}>👍 4 likes</Text>
                      <Text style={styles.discussionStat}>👁️ 23 views</Text>
                    </View>
                  </View>

                  <View style={styles.discussionItem}>
                    <View style={styles.discussionHeader}>
                      <View style={styles.discussionAvatar}>
                        <Text style={styles.discussionAvatarText}>MR</Text>
                      </View>
                      <View style={styles.discussionInfo}>
                        <Text style={styles.discussionAuthor}>Dr. Michael Rodriguez</Text>
                        <Text style={styles.discussionTime}>3 hours ago</Text>
                      </View>
                    </View>
                    <Text style={styles.discussionTitle}>ADHD Medication Management</Text>
                    <Text style={styles.discussionPreview}>8-year-old with ADHD, current on methylphenidate. Parents concerned about side effects.</Text>
                    <View style={styles.discussionStats}>
                      <Text style={styles.discussionStat}>💬 9 replies</Text>
                      <Text style={styles.discussionStat}>👍 7 likes</Text>
                      <Text style={styles.discussionStat}>👁️ 31 views</Text>
                    </View>
                  </View>

                  <View style={styles.discussionItem}>
                    <View style={styles.discussionHeader}>
                      <View style={styles.discussionAvatar}>
                        <Text style={styles.discussionAvatarText}>AL</Text>
                      </View>
                      <View style={styles.discussionInfo}>
                        <Text style={styles.discussionAuthor}>Dr. Alice Lee</Text>
                        <Text style={styles.discussionTime}>5 hours ago</Text>
                      </View>
                    </View>
                    <Text style={styles.discussionTitle}>Vaccination Schedule Update</Text>
                    <Text style={styles.discussionPreview}>New CDC recommendations for COVID-19 vaccination in children 6 months to 5 years</Text>
                    <View style={styles.discussionStats}>
                      <Text style={styles.discussionStat}>💬 14 replies</Text>
                      <Text style={styles.discussionStat}>👍 11 likes</Text>
                      <Text style={styles.discussionStat}>👁️ 52 views</Text>
                    </View>
                  </View>
                </View>

                <TouchableOpacity style={styles.primaryButton}>
                  <Text style={styles.primaryButtonText}>Post Pediatric Case</Text>
                </TouchableOpacity>
              </View>
            )}

            {selectedChannel === 'general' && (
              <View>
                <View style={styles.channelHeader}>
                  <View style={styles.channelHeaderIcon}>
                    <Text style={styles.channelHeaderEmoji}>🩺</Text>
                  </View>
                  <View style={styles.channelHeaderInfo}>
                    <Text style={styles.channelHeaderTitle}>General Medicine</Text>
                    <Text style={styles.channelHeaderSubtitle}>Primary Care and General Practice</Text>
                    <Text style={styles.channelHeaderStats}>445 members • 23 online • 35 discussions today</Text>
                  </View>
                </View>

                <View style={styles.channelTabs}>
                  <TouchableOpacity style={styles.channelTab}>
                    <Text style={styles.channelTabText}>General</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.channelTab}>
                    <Text style={styles.channelTabText}>Prevention</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.channelTab}>
                    <Text style={styles.channelTabText}>Guidelines</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.channelContent}>
                  <View style={styles.discussionItem}>
                    <View style={styles.discussionHeader}>
                      <View style={styles.discussionAvatar}>
                        <Text style={styles.discussionAvatarText}>DR</Text>
                      </View>
                      <View style={styles.discussionInfo}>
                        <Text style={styles.discussionAuthor}>Dr. Sarah Johnson</Text>
                        <Text style={styles.discussionTime}>2 hours ago</Text>
                      </View>
                      <View style={styles.discussionBadge}>
                        <Text style={styles.discussionBadgeText}>Popular</Text>
                      </View>
                    </View>
                    <Text style={styles.discussionTitle}>Hypertension Management 2024</Text>
                    <Text style={styles.discussionPreview}>Updated guidelines for blood pressure management in primary care settings</Text>
                    <View style={styles.discussionStats}>
                      <Text style={styles.discussionStat}>💬 18 replies</Text>
                      <Text style={styles.discussionStat}>👍 15 likes</Text>
                      <Text style={styles.discussionStat}>👁️ 89 views</Text>
                    </View>
                  </View>

                  <View style={styles.discussionItem}>
                    <View style={styles.discussionHeader}>
                      <View style={styles.discussionAvatar}>
                        <Text style={styles.discussionAvatarText}>MR</Text>
                      </View>
                      <View style={styles.discussionInfo}>
                        <Text style={styles.discussionAuthor}>Dr. Michael Rodriguez</Text>
                        <Text style={styles.discussionTime}>4 hours ago</Text>
                      </View>
                    </View>
                    <Text style={styles.discussionTitle}>Diabetes Screening Protocol</Text>
                    <Text style={styles.discussionPreview}>Best practices for diabetes screening in asymptomatic adults - HbA1c vs FPG</Text>
                    <View style={styles.discussionStats}>
                      <Text style={styles.discussionStat}>💬 11 replies</Text>
                      <Text style={styles.discussionStat}>👍 8 likes</Text>
                      <Text style={styles.discussionStat}>👁️ 45 views</Text>
                    </View>
                  </View>

                  <View style={styles.discussionItem}>
                    <View style={styles.discussionHeader}>
                      <View style={styles.discussionAvatar}>
                        <Text style={styles.discussionAvatarText}>AL</Text>
                      </View>
                      <View style={styles.discussionInfo}>
                        <Text style={styles.discussionAuthor}>Dr. Alice Lee</Text>
                        <Text style={styles.discussionTime}>6 hours ago</Text>
                      </View>
                    </View>
                    <Text style={styles.discussionTitle}>Mental Health Screening Tools</Text>
                    <Text style={styles.discussionPreview}>PHQ-9, GAD-7, and other validated screening tools for primary care</Text>
                    <View style={styles.discussionStats}>
                      <Text style={styles.discussionStat}>💬 13 replies</Text>
                      <Text style={styles.discussionStat}>👍 10 likes</Text>
                      <Text style={styles.discussionStat}>👁️ 67 views</Text>
                    </View>
                  </View>
                </View>

                <TouchableOpacity style={styles.primaryButton}>
                  <Text style={styles.primaryButtonText}>Start Discussion</Text>
                </TouchableOpacity>
              </View>
            )}
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
  headerSection: {
    marginBottom: 30,
  },
  featureIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#6C757D',
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 20,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  chatPreview: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F4',
  },
  chatAvatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  chatAvatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  chatContent: {
    flex: 1,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  chatMessage: {
    fontSize: 14,
    color: '#6C757D',
    marginBottom: 2,
  },
  chatTime: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  chatBadge: {
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  chatBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  channelList: {
    marginBottom: 20,
  },
  channelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  channelIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  channelEmoji: {
    fontSize: 24,
  },
  channelInfo: {
    flex: 1,
  },
  channelName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  channelDesc: {
    fontSize: 14,
    color: '#6C757D',
    marginBottom: 2,
  },
  channelMembers: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  channelBadge: {
    backgroundColor: '#34C759',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  channelBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  securityStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  statusCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusEmoji: {
    fontSize: 20,
  },
  statusTitle: {
    fontSize: 12,
    color: '#6C757D',
    marginBottom: 2,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34C759',
    marginBottom: 2,
  },
  statusDesc: {
    fontSize: 10,
    color: '#9E9E9E',
    textAlign: 'center',
  },
  complianceGrid: {
    marginBottom: 25,
  },
  complianceItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  complianceIcon: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2,
  },
  complianceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
    flex: 1,
  },
  complianceDesc: {
    fontSize: 14,
    color: '#6C757D',
    lineHeight: 20,
    flex: 1,
  },
  securityMetrics: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 15,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F4',
  },
  metricLabel: {
    fontSize: 14,
    color: '#6C757D',
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  channelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  channelHeaderIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  channelHeaderEmoji: {
    fontSize: 28,
  },
  channelHeaderInfo: {
    flex: 1,
  },
  channelHeaderTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  channelHeaderSubtitle: {
    fontSize: 14,
    color: '#6C757D',
    marginBottom: 4,
  },
  channelHeaderStats: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  channelTabs: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  channelTab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  channelTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  channelContent: {
    marginBottom: 20,
  },
  discussionItem: {
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
  discussionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  discussionAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  discussionAvatarText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  discussionInfo: {
    flex: 1,
  },
  discussionAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  discussionTime: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  discussionBadge: {
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  discussionBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  discussionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
    lineHeight: 22,
  },
  discussionPreview: {
    fontSize: 14,
    color: '#6C757D',
    lineHeight: 20,
    marginBottom: 12,
  },
  discussionStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  discussionStat: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  emergencyAlert: {
    backgroundColor: '#FFF3CD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#856404',
    flex: 1,
  },
  alertTime: {
    fontSize: 12,
    color: '#856404',
  },
  alertMessage: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
    marginBottom: 12,
  },
  alertActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  alertButton: {
    backgroundColor: '#FFC107',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  alertButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  alertButtonSecondary: {
    backgroundColor: 'transparent',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    flex: 1,
    borderWidth: 1,
    borderColor: '#FFC107',
    alignItems: 'center',
  },
  alertButtonSecondaryText: {
    color: '#FFC107',
    fontSize: 14,
    fontWeight: '600',
  },
  studyItem: {
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
  studyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  studyAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  studyAvatarText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  studyInfo: {
    flex: 1,
  },
  studyAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  studyTime: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  studyBadge: {
    backgroundColor: '#34C759',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  studyBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  studyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
    lineHeight: 22,
  },
  studyPreview: {
    fontSize: 14,
    color: '#6C757D',
    lineHeight: 20,
    marginBottom: 12,
  },
  studyStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  studyStat: {
    fontSize: 12,
    color: '#9E9E9E',
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
