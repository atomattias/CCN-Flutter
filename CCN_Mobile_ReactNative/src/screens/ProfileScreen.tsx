import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { CustomButton } from '../components/CustomButton';

export const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: logout }
      ]
    );
  };

  const handleEditProfile = () => {
    Alert.alert('Edit Profile', 'Profile editing feature coming soon!');
  };

  const handleChangePassword = () => {
    Alert.alert('Change Password', 'Password change feature coming soon!');
  };

  const handlePrivacySettings = () => {
    Alert.alert('Privacy Settings', 'Privacy settings feature coming soon!');
  };

  const handleAbout = () => {
    Alert.alert('About CCN', 'CCN - Secure Healthcare Communication Platform\nVersion 1.0.0');
  };

  const profileSections = [
    {
      title: 'Account',
      items: [
        { icon: 'person-outline', title: 'Edit Profile', onPress: handleEditProfile },
        { icon: 'lock-closed-outline', title: 'Change Password', onPress: handleChangePassword },
        { icon: 'shield-checkmark-outline', title: 'Privacy Settings', onPress: handlePrivacySettings },
      ]
    },
    {
      title: 'Preferences',
      items: [
        { 
          icon: 'notifications-outline', 
          title: 'Push Notifications', 
          type: 'switch',
          value: notificationsEnabled,
          onValueChange: setNotificationsEnabled
        },
        { 
          icon: 'moon-outline', 
          title: 'Dark Mode', 
          type: 'switch',
          value: darkModeEnabled,
          onValueChange: setDarkModeEnabled
        },
        { 
          icon: 'finger-print-outline', 
          title: 'Biometric Login', 
          type: 'switch',
          value: biometricEnabled,
          onValueChange: setBiometricEnabled
        },
      ]
    },
    {
      title: 'Support',
      items: [
        { icon: 'help-circle-outline', title: 'Help & Support', onPress: () => Alert.alert('Help', 'Help feature coming soon!') },
        { icon: 'document-text-outline', title: 'Terms of Service', onPress: () => Alert.alert('Terms', 'Terms of service coming soon!') },
        { icon: 'information-circle-outline', title: 'About', onPress: handleAbout },
      ]
    }
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.fullname?.charAt(0) || 'U'}
            </Text>
          </View>
          <TouchableOpacity style={styles.editAvatarButton}>
            <Ionicons name="camera" size={16} color="white" />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.userName}>{user?.fullname || 'Unknown User'}</Text>
        <Text style={styles.userEmail}>{user?.email || 'No email'}</Text>
        <Text style={styles.userRole}>{user?.role || 'Unknown Role'}</Text>
        
        <CustomButton
          title="Edit Profile"
          onPress={handleEditProfile}
          style={styles.editProfileButton}
        />
      </View>

      {/* Profile Sections */}
      {profileSections.map((section, sectionIndex) => (
        <View key={sectionIndex} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          
          {section.items.map((item, itemIndex) => (
            <TouchableOpacity 
              key={itemIndex} 
              style={styles.sectionItem}
              onPress={item.onPress}
              disabled={item.type === 'switch'}
            >
              <View style={styles.itemLeft}>
                <View style={styles.itemIcon}>
                  <Ionicons name={item.icon as any} size={20} color="#007AFF" />
                </View>
                <Text style={styles.itemTitle}>{item.title}</Text>
              </View>
              
              {item.type === 'switch' ? (
                <Switch
                  value={item.value}
                  onValueChange={item.onValueChange}
                  trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
                  thumbColor={item.value ? 'white' : '#F2F2F7'}
                />
              ) : (
                <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      ))}

      {/* Logout Button */}
      <View style={styles.logoutSection}>
        <CustomButton
          title="Logout"
          onPress={handleLogout}
          style={styles.logoutButton}
          textStyle={styles.logoutButtonText}
        />
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
  profileHeader: {
    backgroundColor: 'white',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  userEmail: {
    fontSize: 16,
    color: '#6C757D',
    marginBottom: 8,
  },
  userRole: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
    marginBottom: 20,
    textTransform: 'uppercase',
  },
  editProfileButton: {
    width: 150,
  },
  section: {
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
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    padding: 20,
    paddingBottom: 10,
  },
  sectionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  itemTitle: {
    fontSize: 16,
    color: '#1C1C1E',
  },
  logoutSection: {
    marginTop: 30,
    marginHorizontal: 20,
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
  },
  logoutButtonText: {
    color: 'white',
  },
  bottomSpacing: {
    height: 100,
  },
});


