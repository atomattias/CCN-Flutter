import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Switch,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { pinAuthService } from '../services/pinAuthService';
import { CustomButton } from '../components/CustomButton';
import { CustomInput } from '../components/CustomInput';

export const PinManagementScreen: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [pinConfig, setPinConfig] = useState<any>(null);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showChangeModal, setShowChangeModal] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);
  
  // PIN setup states
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [setupStep, setSetupStep] = useState<'pin' | 'confirm' | 'biometric'>('pin');
  
  // PIN change states
  const [currentPin, setCurrentPin] = useState('');
  const [changeNewPin, setChangeNewPin] = useState('');
  const [changeConfirmPin, setChangeConfirmPin] = useState('');
  
  // PIN disable states
  const [disablePin, setDisablePin] = useState('');
  
  // Biometric states
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricSupported, setBiometricSupported] = useState(false);
  const [biometricTypes, setBiometricTypes] = useState<string[]>([]);

  useEffect(() => {
    loadPinConfiguration();
  }, []);

  const loadPinConfiguration = async () => {
    try {
      setLoading(true);
      const config = await pinAuthService.getPINConfig();
      setPinConfig(config);
      
      const supported = await pinAuthService.isBiometricSupported();
      setBiometricSupported(supported);
      
      if (supported) {
        const types = await pinAuthService.getBiometricTypes();
        setBiometricTypes(types);
        
        const biometricEnabled = await pinAuthService.getPINConfig();
        setBiometricEnabled(biometricEnabled?.biometricEnabled || false);
      }
    } catch (error) {
      console.error('Failed to load PIN configuration:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetupPIN = async () => {
    if (newPin.length < 4) {
      Alert.alert('Invalid PIN', 'PIN must be at least 4 digits');
      return;
    }

    if (newPin !== confirmPin) {
      Alert.alert('PIN Mismatch', 'PINs do not match');
      return;
    }

    try {
      setLoading(true);
      await pinAuthService.setupPIN(newPin);
      
      // Check if biometric is available
      if (biometricSupported) {
        setSetupStep('biometric');
      } else {
        setShowSetupModal(false);
        setNewPin('');
        setConfirmPin('');
        setSetupStep('pin');
        await loadPinConfiguration();
        Alert.alert('Success', 'PIN setup completed successfully!');
      }
    } catch (error) {
      console.error('PIN setup failed:', error);
      Alert.alert('Setup Failed', 'Failed to setup PIN');
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricSetup = async () => {
    try {
      setLoading(true);
      const success = await pinAuthService.authenticateWithBiometric();
      
      if (success) {
        await pinAuthService.toggleBiometric(true);
        setBiometricEnabled(true);
        setShowSetupModal(false);
        setNewPin('');
        setConfirmPin('');
        setSetupStep('pin');
        await loadPinConfiguration();
        Alert.alert('Success', 'PIN and biometric authentication setup completed!');
      } else {
        Alert.alert('Biometric Setup Failed', 'Please try again or skip biometric setup');
      }
    } catch (error) {
      console.error('Biometric setup failed:', error);
      Alert.alert('Biometric Setup Failed', 'Failed to setup biometric authentication');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePIN = async () => {
    if (changeNewPin.length < 4) {
      Alert.alert('Invalid PIN', 'PIN must be at least 4 digits');
      return;
    }

    if (changeNewPin !== changeConfirmPin) {
      Alert.alert('PIN Mismatch', 'PINs do not match');
      return;
    }

    try {
      setLoading(true);
      const isValid = await pinAuthService.validatePIN(currentPin);
      
      if (!isValid) {
        Alert.alert('Invalid PIN', 'Current PIN is incorrect');
        return;
      }

      await pinAuthService.changePIN(currentPin, changeNewPin);
      
      setShowChangeModal(false);
      setCurrentPin('');
      setChangeNewPin('');
      setChangeConfirmPin('');
      await loadPinConfiguration();
      Alert.alert('Success', 'PIN changed successfully!');
    } catch (error) {
      console.error('PIN change failed:', error);
      Alert.alert('Change Failed', 'Failed to change PIN');
    } finally {
      setLoading(false);
    }
  };

  const handleDisablePIN = async () => {
    try {
      setLoading(true);
      const isValid = await pinAuthService.validatePIN(disablePin);
      
      if (!isValid) {
        Alert.alert('Invalid PIN', 'PIN is incorrect');
        return;
      }

      await pinAuthService.disablePIN(disablePin);
      
      setShowDisableModal(false);
      setDisablePin('');
      await loadPinConfiguration();
      Alert.alert('Success', 'PIN authentication disabled successfully!');
    } catch (error) {
      console.error('PIN disable failed:', error);
      Alert.alert('Disable Failed', 'Failed to disable PIN');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBiometric = async () => {
    try {
      setLoading(true);
      const newState = !biometricEnabled;
      await pinAuthService.toggleBiometric(newState);
      setBiometricEnabled(newState);
      await loadPinConfiguration();
      Alert.alert('Success', `Biometric authentication ${newState ? 'enabled' : 'disabled'} successfully!`);
    } catch (error) {
      console.error('Biometric toggle failed:', error);
      Alert.alert('Toggle Failed', 'Failed to toggle biometric authentication');
    } finally {
      setLoading(false);
    }
  };

  const getBiometricIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'fingerprint':
        return 'finger-print';
      case 'face':
        return 'face-recognition';
      case 'iris':
        return 'eye';
      default:
        return 'scan';
    }
  };

  const getBiometricDisplayName = (type: string) => {
    switch (type.toLowerCase()) {
      case 'fingerprint':
        return 'Fingerprint';
      case 'face':
        return 'Face Recognition';
      case 'iris':
        return 'Iris Scan';
      default:
        return type;
    }
  };

  if (loading && !pinConfig) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading PIN Configuration...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="lock-closed" size={32} color="#007AFF" />
        <Text style={styles.title}>PIN & Biometric Security</Text>
        <Text style={styles.subtitle}>Manage your authentication methods</Text>
      </View>

      {/* Current Status */}
      <View style={styles.statusCard}>
        <Text style={styles.statusTitle}>Current Status</Text>
        
        <View style={styles.statusItem}>
          <Ionicons 
            name={pinConfig?.pinEnabled ? "checkmark-circle" : "close-circle"} 
            size={24} 
            color={pinConfig?.pinEnabled ? "#34C759" : "#FF3B30"} 
          />
          <Text style={styles.statusText}>
            PIN Authentication: {pinConfig?.pinEnabled ? 'Enabled' : 'Disabled'}
          </Text>
        </View>

        {biometricSupported && (
          <View style={styles.statusItem}>
            <Ionicons 
              name={biometricEnabled ? "checkmark-circle" : "close-circle"} 
              size={24} 
              color={biometricEnabled ? "#34C759" : "#FF3B30"} 
            />
            <Text style={styles.statusText}>
              Biometric Authentication: {biometricEnabled ? 'Enabled' : 'Disabled'}
            </Text>
          </View>
        )}

        {pinConfig?.pinEnabled && (
          <View style={styles.statusItem}>
            <Ionicons name="information-circle" size={24} color="#007AFF" />
            <Text style={styles.statusText}>
              Remaining Attempts: {pinConfig?.remainingAttempts || 'Unlimited'}
            </Text>
          </View>
        )}
      </View>

      {/* PIN Management */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>PIN Management</Text>
        
        {!pinConfig?.pinEnabled ? (
          <CustomButton
            title="Setup PIN Authentication"
            onPress={() => setShowSetupModal(true)}
            variant="primary"
            icon="lock-closed"
          />
        ) : (
          <View style={styles.buttonGroup}>
            <CustomButton
              title="Change PIN"
              onPress={() => setShowChangeModal(true)}
              variant="secondary"
              icon="key"
            />
            <CustomButton
              title="Disable PIN"
              onPress={() => setShowDisableModal(true)}
              variant="destructive"
              icon="lock-open"
            />
          </View>
        )}
      </View>

      {/* Biometric Management */}
      {biometricSupported && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Biometric Authentication</Text>
          
          <View style={styles.biometricInfo}>
            <Text style={styles.biometricText}>
              Available biometric methods:
            </Text>
            <View style={styles.biometricTypes}>
              {biometricTypes.map((type, index) => (
                <View key={index} style={styles.biometricType}>
                  <Ionicons name={getBiometricIcon(type)} size={20} color="#007AFF" />
                  <Text style={styles.biometricTypeText}>
                    {getBiometricDisplayName(type)}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.biometricToggle}>
            <Text style={styles.toggleLabel}>Enable Biometric Authentication</Text>
            <Switch
              value={biometricEnabled}
              onValueChange={handleToggleBiometric}
              trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
              thumbColor={biometricEnabled ? '#FFFFFF' : '#FFFFFF'}
              disabled={!pinConfig?.pinEnabled}
            />
          </View>

          {!pinConfig?.pinEnabled && (
            <Text style={styles.warningText}>
              PIN authentication must be enabled before using biometric authentication
            </Text>
          )}
        </View>
      )}

      {/* Security Tips */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security Tips</Text>
        
        <View style={styles.tipItem}>
          <Ionicons name="shield-checkmark" size={20} color="#34C759" />
          <Text style={styles.tipText}>
            Use a PIN that's easy to remember but hard to guess
          </Text>
        </View>
        
        <View style={styles.tipItem}>
          <Ionicons name="shield-checkmark" size={20} color="#34C759" />
          <Text style={styles.tipText}>
            Avoid using common patterns like 1234 or repeated digits
          </Text>
        </View>
        
        <View style={styles.tipItem}>
          <Ionicons name="shield-checkmark" size={20} color="#34C759" />
          <Text style={styles.tipText}>
            Enable biometric authentication for faster access
          </Text>
        </View>
        
        <View style={styles.tipItem}>
          <Ionicons name="shield-checkmark" size={20} color="#34C759" />
          <Text style={styles.tipText}>
            Keep your PIN private and don't share it with others
          </Text>
        </View>
      </View>

      {/* PIN Setup Modal */}
      <Modal
        visible={showSetupModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {setupStep === 'pin' && (
              <>
                <Text style={styles.modalTitle}>Setup PIN</Text>
                <Text style={styles.modalSubtitle}>Enter a 4-6 digit PIN</Text>
                
                <CustomInput
                  label="New PIN"
                  placeholder="Enter PIN"
                  value={newPin}
                  onChangeText={setNewPin}
                  secureTextEntry
                  keyboardType="numeric"
                  maxLength={6}
                />
                
                <CustomInput
                  label="Confirm PIN"
                  placeholder="Confirm PIN"
                  value={confirmPin}
                  onChangeText={setConfirmPin}
                  secureTextEntry
                  keyboardType="numeric"
                  maxLength={6}
                />
                
                <View style={styles.modalActions}>
                  <CustomButton
                    title="Cancel"
                    onPress={() => {
                      setShowSetupModal(false);
                      setNewPin('');
                      setConfirmPin('');
                      setSetupStep('pin');
                    }}
                    variant="outline"
                  />
                  <CustomButton
                    title="Next"
                    onPress={handleSetupPIN}
                    variant="primary"
                    disabled={newPin.length < 4 || newPin !== confirmPin}
                  />
                </View>
              </>
            )}

            {setupStep === 'biometric' && (
              <>
                <Text style={styles.modalTitle}>Biometric Setup</Text>
                <Text style={styles.modalSubtitle}>Would you like to enable biometric authentication?</Text>
                
                <View style={styles.biometricSetup}>
                  <Ionicons name="finger-print" size={64} color="#007AFF" />
                  <Text style={styles.biometricSetupText}>
                    This will allow you to use your fingerprint or face to unlock the app
                  </Text>
                </View>
                
                <View style={styles.modalActions}>
                  <CustomButton
                    title="Skip"
                    onPress={() => {
                      setShowSetupModal(false);
                      setNewPin('');
                      setConfirmPin('');
                      setSetupStep('pin');
                      loadPinConfiguration();
                    }}
                    variant="outline"
                  />
                  <CustomButton
                    title="Enable"
                    onPress={handleBiometricSetup}
                    variant="primary"
                  />
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* PIN Change Modal */}
      <Modal
        visible={showChangeModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change PIN</Text>
            <Text style={styles.modalSubtitle}>Enter your current PIN and new PIN</Text>
            
            <CustomInput
              label="Current PIN"
              placeholder="Enter current PIN"
              value={currentPin}
              onChangeText={setCurrentPin}
              secureTextEntry
              keyboardType="numeric"
              maxLength={6}
            />
            
            <CustomInput
              label="New PIN"
              placeholder="Enter new PIN"
              value={changeNewPin}
              onChangeText={setChangeNewPin}
              secureTextEntry
              keyboardType="numeric"
              maxLength={6}
            />
            
            <CustomInput
              label="Confirm New PIN"
              placeholder="Confirm new PIN"
              value={changeConfirmPin}
              onChangeText={setChangeConfirmPin}
              secureTextEntry
              keyboardType="numeric"
              maxLength={6}
            />
            
            <View style={styles.modalActions}>
              <CustomButton
                title="Cancel"
                onPress={() => {
                  setShowChangeModal(false);
                  setCurrentPin('');
                  setChangeNewPin('');
                  setChangeConfirmPin('');
                }}
                variant="outline"
              />
              <CustomButton
                title="Change PIN"
                onPress={handleChangePIN}
                variant="primary"
                disabled={
                  currentPin.length < 4 ||
                  changeNewPin.length < 4 ||
                  changeNewPin !== changeConfirmPin
                }
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* PIN Disable Modal */}
      <Modal
        visible={showDisableModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Disable PIN</Text>
            <Text style={styles.modalSubtitle}>
              Enter your current PIN to disable PIN authentication
            </Text>
            
            <CustomInput
              label="Current PIN"
              placeholder="Enter current PIN"
              value={disablePin}
              onChangeText={setDisablePin}
              secureTextEntry
              keyboardType="numeric"
              maxLength={6}
            />
            
            <View style={styles.modalActions}>
              <CustomButton
                title="Cancel"
                onPress={() => {
                  setShowDisableModal(false);
                  setDisablePin('');
                }}
                variant="outline"
              />
              <CustomButton
                title="Disable PIN"
                onPress={handleDisablePIN}
                variant="destructive"
                disabled={disablePin.length < 4}
              />
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8E8E93',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusText: {
    fontSize: 16,
    color: '#000000',
    marginLeft: 12,
  },
  section: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
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
    color: '#000000',
    marginBottom: 16,
  },
  buttonGroup: {
    gap: 12,
  },
  biometricInfo: {
    marginBottom: 20,
  },
  biometricText: {
    fontSize: 16,
    color: '#000000',
    marginBottom: 12,
  },
  biometricTypes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  biometricType: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  biometricTypeText: {
    fontSize: 14,
    color: '#000000',
    marginLeft: 8,
  },
  biometricToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  toggleLabel: {
    fontSize: 16,
    color: '#000000',
  },
  warningText: {
    fontSize: 14,
    color: '#FF9500',
    fontStyle: 'italic',
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: '#000000',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  biometricSetup: {
    alignItems: 'center',
    marginVertical: 24,
  },
  biometricSetupText: {
    fontSize: 16,
    color: '#000000',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 22,
  },
});



