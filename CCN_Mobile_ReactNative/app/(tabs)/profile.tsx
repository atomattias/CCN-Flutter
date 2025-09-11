import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';

export default function ProfileScreen() {
  const { user, updateUser, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
  });

  const handleSaveProfile = async () => {
    try {
      await updateUser(editData);
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              Alert.alert('Error', 'Failed to logout');
            }
          },
        },
      ]
    );
  };

  const profileSections = [
    {
      title: 'Account Settings',
      items: [
        {
          icon: 'person-outline',
          title: 'Personal Information',
          subtitle: 'Update your personal details',
          onPress: () => setIsEditing(true),
        },
        {
          icon: 'shield-checkmark-outline',
          title: 'Verification Status',
          subtitle: user?.isVerified ? 'Verified' : 'Pending verification',
          onPress: () => Alert.alert('Verification', 'Medical verification is required for full access'),
        },
        {
          icon: 'notifications-outline',
          title: 'Notifications',
          subtitle: 'Manage notification preferences',
          onPress: () => Alert.alert('Notifications', 'Notification settings coming soon'),
        },
      ],
    },
    {
      title: 'Security',
      items: [
        {
          icon: 'lock-closed-outline',
          title: 'Change Password',
          subtitle: 'Update your password',
          onPress: () => Alert.alert('Change Password', 'Password change feature coming soon'),
        },
        {
          icon: 'key-outline',
          title: 'Two-Factor Authentication',
          subtitle: 'Add extra security to your account',
          onPress: () => Alert.alert('2FA', 'Two-factor authentication coming soon'),
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          icon: 'help-circle-outline',
          title: 'Help & Support',
          subtitle: 'Get help and contact support',
          onPress: () => Alert.alert('Support', 'Support feature coming soon'),
        },
        {
          icon: 'document-text-outline',
          title: 'Terms & Privacy',
          subtitle: 'View terms of service and privacy policy',
          onPress: () => Alert.alert('Terms', 'Terms and privacy policy coming soon'),
        },
      ],
    },
  ];

  const renderEditForm = () => (
    <View style={styles.editForm}>
      <Text style={styles.editFormTitle}>Edit Profile</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>First Name</Text>
        <TextInput
          style={styles.textInput}
          value={editData.firstName}
          onChangeText={(text) => setEditData(prev => ({ ...prev, firstName: text }))}
          placeholder="Enter first name"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Last Name</Text>
        <TextInput
          style={styles.textInput}
          value={editData.lastName}
          onChangeText={(text) => setEditData(prev => ({ ...prev, lastName: text }))}
          placeholder="Enter last name"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.textInput}
          value={editData.email}
          onChangeText={(text) => setEditData(prev => ({ ...prev, email: text }))}
          placeholder="Enter email"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.editFormActions}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => {
            setIsEditing(false);
            setEditData({
              firstName: user?.firstName || '',
              lastName: user?.lastName || '',
              email: user?.email || '',
            });
          }}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.profileInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.firstName?.[0] || user?.email?.[0] || 'U'}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {user?.firstName && user?.lastName 
                ? `${user.firstName} ${user.lastName}` 
                : user?.email || 'User'
              }
            </Text>
            <Text style={styles.userRole}>{user?.role || 'User'}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
        </View>
      </View>

      {isEditing ? (
        renderEditForm()
      ) : (
        <>
          {profileSections.map((section, sectionIndex) => (
            <View key={sectionIndex} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  style={styles.sectionItem}
                  onPress={item.onPress}
                >
                  <View style={styles.itemIcon}>
                    <Ionicons name={item.icon as any} size={24} color="#007AFF" />
                  </View>
                  <View style={styles.itemContent}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
                </TouchableOpacity>
              ))}
            </View>
          ))}

          <View style={styles.logoutSection}>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.appInfo}>
            <Text style={styles.appInfoText}>CCN Mobile App v1.0.0</Text>
            <Text style={styles.appInfoText}>Clinical Communication Network</Text>
          </View>
        </>
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
    backgroundColor: '#FFFFFF',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#8E8E93',
  },
  editForm: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  editFormTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#000000',
  },
  editFormActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#8E8E93',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    padding: 20,
    paddingBottom: 12,
  },
  sectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 2,
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
  },
  logoutSection: {
    margin: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FF3B30',
    marginLeft: 8,
  },
  appInfo: {
    alignItems: 'center',
    padding: 20,
    paddingBottom: 40,
  },
  appInfoText: {
    fontSize: 14,
    color: '#C7C7CC',
    marginBottom: 4,
  },
});

