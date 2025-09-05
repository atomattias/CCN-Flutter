import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { verificationService, VerificationStatus, VerificationRequest } from '../services/verificationService';
import { CustomButton } from '../components/CustomButton';

export const ClinicianVerificationScreen: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus | null>(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [totalSteps] = useState(5);

  useEffect(() => {
    loadVerificationStatus();
  }, []);

  const loadVerificationStatus = async () => {
    try {
      setLoading(true);
      const status = await verificationService.getVerificationStatus();
      setVerificationStatus(status);
    } catch (error) {
      console.error('Failed to load verification status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return '#34C759';
      case 'pending':
        return '#FF9500';
      case 'rejected':
        return '#FF3B30';
      case 'suspended':
        return '#AF52DE';
      default:
        return '#8E8E93';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return 'checkmark-circle';
      case 'pending':
        return 'time';
      case 'rejected':
        return 'close-circle';
      case 'suspended':
        return 'pause-circle';
      default:
        return 'help-circle';
    }
  };

  const renderVerificationProgress = () => {
    if (!verificationStatus) return null;

    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Verification Progress</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(verificationStatus.overallStatus) }]}>
            <Text style={styles.statusText}>
              {verificationStatus.overallStatus.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${verificationStatus.progress.total}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {verificationStatus.progress.total}% Complete
        </Text>

        <View style={styles.stepsContainer}>
          <View style={styles.step}>
            <View style={[styles.stepIcon, verificationStatus.progress.personalInfo === 100 && styles.stepCompleted]}>
              <Ionicons
                name={verificationStatus.progress.personalInfo === 100 ? 'checkmark' : 'person'}
                size={20}
                color={verificationStatus.progress.personalInfo === 100 ? 'white' : '#8E8E93'}
              />
            </View>
            <Text style={styles.stepText}>Personal Info</Text>
            <Text style={styles.stepProgress}>{verificationStatus.progress.personalInfo}%</Text>
          </View>

          <View style={styles.step}>
            <View style={[styles.stepIcon, verificationStatus.progress.documents === 100 && styles.stepCompleted]}>
              <Ionicons
                name={verificationStatus.progress.documents === 100 ? 'checkmark' : 'document'}
                size={20}
                color={verificationStatus.progress.documents === 100 ? 'white' : '#8E8E93'}
              />
            </View>
            <Text style={styles.stepText}>Documents</Text>
            <Text style={styles.stepProgress}>{verificationStatus.progress.documents}%</Text>
          </View>

          <View style={styles.step}>
            <View style={[styles.stepIcon, verificationStatus.progress.institution === 100 && styles.stepCompleted]}>
              <Ionicons
                name={verificationStatus.progress.institution === 100 ? 'checkmark' : 'business'}
                size={20}
                color={verificationStatus.progress.institution === 100 ? 'white' : '#8E8E93'}
              />
            </View>
            <Text style={styles.stepText}>Institution</Text>
            <Text style={styles.stepProgress}>{verificationStatus.progress.institution}%</Text>
          </View>

          <View style={styles.step}>
            <View style={[styles.stepIcon, verificationStatus.progress.background === 100 && styles.stepCompleted]}>
              <Ionicons
                name={verificationStatus.progress.background === 100 ? 'checkmark' : 'shield-checkmark'}
                size={20}
                color={verificationStatus.progress.background === 100 ? 'white' : '#8E8E93'}
              />
            </View>
            <Text style={styles.stepText}>Background</Text>
            <Text style={styles.stepProgress}>{verificationStatus.progress.background}%</Text>
          </View>
        </View>

        {verificationStatus.nextSteps.length > 0 && (
          <View style={styles.nextStepsContainer}>
            <Text style={styles.nextStepsTitle}>Next Steps:</Text>
            {verificationStatus.nextSteps.map((step, index) => (
              <View key={index} style={styles.nextStepItem}>
                <Ionicons name="arrow-forward" size={16} color="#007AFF" />
                <Text style={styles.nextStepText}>{step}</Text>
              </View>
            ))}
          </View>
        )}

        {verificationStatus.estimatedCompletion && (
          <View style={styles.estimatedCompletion}>
            <Text style={styles.estimatedCompletionText}>
              Estimated Completion: {verificationStatus.estimatedCompletion}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderVerificationRequirements = () => {
    return (
      <View style={styles.requirementsContainer}>
        <Text style={styles.requirementsTitle}>Verification Requirements</Text>
        
        <View style={styles.requirementItem}>
          <Ionicons name="checkmark-circle" size={20} color="#34C759" />
          <Text style={styles.requirementText}>Valid Medical License</Text>
        </View>
        
        <View style={styles.requirementItem}>
          <Ionicons name="checkmark-circle" size={20} color="#34C759" />
          <Text style={styles.requirementText}>Medical Degree Certificate</Text>
        </View>
        
        <View style={styles.requirementItem}>
          <Ionicons name="checkmark-circle" size={20} color="#34C759" />
          <Text style={styles.requirementText}>Institution Affiliation</Text>
        </View>
        
        <View style={styles.requirementItem}>
          <Ionicons name="checkmark-circle" size={20} color="#34C759" />
          <Text style={styles.requirementText}>Government Database Verification</Text>
        </View>
        
        <View style={styles.requirementItem}>
          <Ionicons name="checkmark-circle" size={20} color="#34C759" />
          <Text style={styles.requirementText}>Background Check Consent</Text>
        </View>
        
        <View style={styles.requirementItem}>
          <Ionicons name="checkmark-circle" size={20} color="#34C759" />
          <Text style={styles.requirementText}>Peer Review (Optional)</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading verification status...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="shield-checkmark" size={32} color="#007AFF" />
          <Text style={styles.title}>Clinician Verification</Text>
          <Text style={styles.subtitle}>Verify your credentials to join CCN</Text>
        </View>

        {/* Verification Status */}
        {verificationStatus && renderVerificationProgress()}

        {/* Requirements */}
        {renderVerificationRequirements()}

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          {verificationStatus?.overallStatus === 'verified' ? (
            <View style={styles.verifiedContainer}>
              <Ionicons name="checkmark-circle" size={64} color="#34C759" />
              <Text style={styles.verifiedTitle}>Verification Complete!</Text>
              <Text style={styles.verifiedText}>
                You can now access all CCN features and participate in clinical discussions.
              </Text>
            </View>
          ) : verificationStatus?.overallStatus === 'pending' ? (
            <CustomButton
              title="Continue Verification"
              onPress={() => setShowVerificationModal(true)}
              variant="primary"
              icon="arrow-forward"
            />
          ) : (
            <CustomButton
              title="Start Verification"
              onPress={() => setShowVerificationModal(true)}
              variant="primary"
              icon="shield-checkmark"
            />
          )}
        </View>
      </ScrollView>

      {/* Verification Modal */}
      <Modal
        visible={showVerificationModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Clinician Verification</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowVerificationModal(false)}
              >
                <Ionicons name="close" size={24} color="#8E8E93" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              <Text style={styles.modalSubtitle}>
                Complete the verification process to join the Clinical Communication Network
              </Text>
              
              <View style={styles.modalSteps}>
                <Text style={styles.modalStepsTitle}>Verification Process:</Text>
                
                <View style={styles.modalStep}>
                  <View style={styles.modalStepNumber}>1</View>
                  <View style={styles.modalStepContent}>
                    <Text style={styles.modalStepTitle}>Personal Information</Text>
                    <Text style={styles.modalStepDescription}>
                      Provide your basic information and medical credentials
                    </Text>
                  </View>
                </View>
                
                <View style={styles.modalStep}>
                  <View style={styles.modalStepNumber}>2</View>
                  <View style={styles.modalStepContent}>
                    <Text style={styles.modalStepTitle}>Document Upload</Text>
                    <Text style={styles.modalStepDescription}>
                      Upload your medical license, degree, and certifications
                    </Text>
                  </View>
                </View>
                
                <View style={styles.modalStep}>
                  <View style={styles.modalStepNumber}>3</View>
                  <View style={styles.modalStepContent}>
                    <Text style={styles.modalStepTitle}>Institution Verification</Text>
                    <Text style={styles.modalStepDescription}>
                      Verify your affiliation with medical institutions
                    </Text>
                  </View>
                </View>
                
                <View style={styles.modalStep}>
                  <View style={styles.modalStepNumber}>4</View>
                  <View style={styles.modalStepContent}>
                    <Text style={styles.modalStepTitle}>Background Check</Text>
                    <Text style={styles.modalStepDescription}>
                      Complete background verification process
                    </Text>
                  </View>
                </View>
                
                <View style={styles.modalStep}>
                  <View style={styles.modalStepNumber}>5</View>
                  <View style={styles.modalStepContent}>
                    <Text style={styles.modalStepTitle}>Final Review</Text>
                    <Text style={styles.modalStepDescription}>
                      Review and approval by verification team
                    </Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.modalActions}>
                <CustomButton
                  title="Cancel"
                  onPress={() => setShowVerificationModal(false)}
                  variant="outline"
                />
                <CustomButton
                  title="Start Verification"
                  onPress={() => {
                    setShowVerificationModal(false);
                    Alert.alert('Verification', 'Verification form will open in the next update');
                  }}
                  variant="primary"
                  icon="shield-checkmark"
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
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
  content: {
    flex: 1,
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
  progressContainer: {
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
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#F2F2F7',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 20,
  },
  stepsContainer: {
    gap: 16,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCompleted: {
    backgroundColor: '#34C759',
  },
  stepText: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
    fontWeight: '500',
  },
  stepProgress: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '600',
  },
  nextStepsContainer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  nextStepsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  nextStepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  nextStepText: {
    fontSize: 14,
    color: '#000000',
  },
  estimatedCompletion: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  estimatedCompletionText: {
    fontSize: 14,
    color: '#007AFF',
    textAlign: 'center',
    fontWeight: '600',
  },
  requirementsContainer: {
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
  requirementsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  requirementText: {
    fontSize: 14,
    color: '#000000',
  },
  actionContainer: {
    margin: 16,
    marginBottom: 32,
  },
  verifiedContainer: {
    backgroundColor: '#FFFFFF',
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  verifiedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: 16,
    marginBottom: 8,
  },
  verifiedText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
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
    width: '95%',
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 24,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  modalSteps: {
    marginBottom: 24,
  },
  modalStepsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  modalStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    marginBottom: 20,
  },
  modalStepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalStepContent: {
    flex: 1,
  },
  modalStepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  modalStepDescription: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
});



