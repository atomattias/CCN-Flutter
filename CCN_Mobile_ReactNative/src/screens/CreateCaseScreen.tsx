import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { router } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { ApiService } from '../services/api';

interface StructuredClinicalData {
  demographics: {
    age?: number;
    gender?: 'male' | 'female' | 'other' | 'unknown';
    ethnicity?: string;
    race?: string;
    language?: string;
    maritalStatus?: string;
  };
  vitalSigns: {
    bloodPressure?: {
      systolic: number;
      diastolic: number;
      unit: 'mmHg';
      timestamp: Date;
    };
    heartRate?: {
      value: number;
      unit: 'bpm';
      timestamp: Date;
    };
    temperature?: {
      value: number;
      unit: 'celsius' | 'fahrenheit';
      timestamp: Date;
    };
    respiratoryRate?: {
      value: number;
      unit: 'breaths/min';
      timestamp: Date;
    };
    oxygenSaturation?: {
      value: number;
      unit: '%';
      timestamp: Date;
    };
    weight?: {
      value: number;
      unit: 'kg' | 'lbs';
      timestamp: Date;
    };
    height?: {
      value: number;
      unit: 'cm' | 'inches';
      timestamp: Date;
    };
  };
  labValues: {
    bloodTests?: {
      hemoglobin?: number;
      hematocrit?: number;
      whiteBloodCells?: number;
      platelets?: number;
      glucose?: number;
      creatinine?: number;
      bun?: number;
      sodium?: number;
      potassium?: number;
      chloride?: number;
      co2?: number;
      unit: string;
      timestamp: Date;
    };
    urineTests?: {
      protein?: string;
      glucose?: string;
      blood?: string;
      leukocytes?: string;
      nitrites?: string;
      timestamp: Date;
    };
    otherTests?: Array<{
      name: string;
      value: string | number;
      unit?: string;
      referenceRange?: string;
      timestamp: Date;
    }>;
  };
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    route: string;
    startDate?: Date;
    endDate?: Date;
    prescribedBy?: string;
    indication?: string;
  }>;
  allergies: Array<{
    allergen: string;
    reaction: string;
    severity: 'mild' | 'moderate' | 'severe';
    onsetDate?: Date;
  }>;
  medicalHistory: {
    pastIllnesses?: string[];
    surgeries?: Array<{
      procedure: string;
      date: Date;
      complications?: string;
    }>;
    hospitalizations?: Array<{
      reason: string;
      admissionDate: Date;
      dischargeDate?: Date;
      complications?: string;
    }>;
  };
  familyHistory: Array<{
    relationship: string;
    condition: string;
    ageOfOnset?: number;
    notes?: string;
  }>;
  socialHistory: {
    smoking?: {
      status: 'never' | 'former' | 'current';
      packYears?: number;
      quitDate?: Date;
    };
    alcohol?: {
      status: 'never' | 'former' | 'current';
      drinksPerWeek?: number;
    };
    drugs?: {
      status: 'never' | 'former' | 'current';
      substances?: string[];
    };
    occupation?: string;
    education?: string;
    livingSituation?: string;
  };
}

interface ClinicalImage {
  id: string;
  name: string;
  uri: string;
  type: string;
  size: number;
  description?: string;
  uploadedAt: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  anonymizationStatus: 'pending' | 'processing' | 'completed' | 'failed';
  originalUri?: string;
  anonymizedUri?: string;
  facesDetected?: number;
  anonymizationMethod?: string;
  anonymizationConfidence?: number;
  anonymizationTimestamp?: Date;
}

export default function CreateCaseScreen() {
  // Temporarily disable useAuth to fix the error
  // const { user } = useAuth();
  const user = { id: 'demo-user', email: 'demo@ccn.com', name: 'Demo User' };
  // Temporarily disable ApiService to fix the error
  // const apiService = new ApiService();

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [patientSymptoms, setPatientSymptoms] = useState('');
  const [patientHistory, setPatientHistory] = useState('');
  const [diagnosticTests, setDiagnosticTests] = useState<string[]>([]);
  const [suspectedConditions, setSuspectedConditions] = useState<string[]>([]);
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [specialty, setSpecialty] = useState('');
  const [department, setDepartment] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Structured data state
  const [structuredData, setStructuredData] = useState<StructuredClinicalData>({
    demographics: {},
    vitalSigns: {},
    labValues: {},
    medications: [],
    allergies: [],
    medicalHistory: {},
    familyHistory: [],
    socialHistory: {},
  });

  // Images state
  const [clinicalImages, setClinicalImages] = useState<ClinicalImage[]>([]);
  const [isProcessingImages, setIsProcessingImages] = useState(false);

  // De-identification state
  const [enableDeidentification, setEnableDeidentification] = useState(true);
  const [isProcessingText, setIsProcessingText] = useState(false);
  const [phiDetected, setPhiDetected] = useState<any[]>([]);

  // Form sections state
  const [activeSection, setActiveSection] = useState<'basic' | 'demographics' | 'vitals' | 'labs' | 'medications' | 'history' | 'images'>('basic');

  // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Text de-identification service
  const TEXT_DEIDENTIFICATION_URL = 'http://192.168.1.224:8001';

  // Face anonymization service
  const FACE_ANONYMIZATION_URL = 'http://192.168.1.224:8000';

  useEffect(() => {
    // Set default values based on user
    if (user) {
      setSpecialty(user.specialty || '');
      setDepartment(user.department || '');
    }
  }, [user]);

  const processTextDeidentification = async (text: string, fieldName: string): Promise<string> => {
    if (!enableDeidentification || !text.trim()) return text;

    try {
      setIsProcessingText(true);
      
      const response = await fetch(`${TEXT_DEIDENTIFICATION_URL}/detect-phi`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          method: 'comprehensive',
          sensitivity: 'high',
          preserve_context: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`Text de-identification failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.phi_detected && result.phi_detected.length > 0) {
        // Show PHI detection alert
        Alert.alert(
          'PHI Detected',
          `Found ${result.phi_detected.length} potential PHI items in ${fieldName}. De-identify text?`,
          [
            { text: 'Use Original', onPress: () => {} },
            { 
              text: 'De-identify', 
              onPress: async () => {
                const deidentifiedResponse = await fetch(`${TEXT_DEIDENTIFICATION_URL}/deidentify`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    text: text,
                    method: 'comprehensive',
                    sensitivity: 'high',
                    preserve_context: true,
                  }),
                });

                if (deidentifiedResponse.ok) {
                  const deidentifiedResult = await deidentifiedResponse.json();
                  return deidentifiedResult.deidentified_text;
                }
                return text;
              }
            }
          ]
        );
      }

      return text;
    } catch (error) {
      console.error('Text de-identification error:', error);
      return text;
    } finally {
      setIsProcessingText(false);
    }
  };

  const processImageAnonymization = async (imageUri: string): Promise<ClinicalImage> => {
    try {
      // Convert image to base64
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Call face anonymization service
      const response = await fetch(`${FACE_ANONYMIZATION_URL}/anonymize-json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64,
          method: 'blur',
          quality: 'high',
        }),
      });

      if (!response.ok) {
        throw new Error(`Face anonymization failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.faces_detected > 0) {
        // Show face detection alert
        return new Promise((resolve) => {
          Alert.alert(
            'Faces Detected',
            `Found ${result.faces_detected} face(s) in the image. Anonymize faces?`,
            [
              { 
                text: 'Use Original', 
                onPress: () => resolve(createImageObject(imageUri, 'original'))
              },
              { 
                text: 'Anonymize Faces', 
                onPress: () => resolve(createImageObject(imageUri, 'anonymized', result))
              }
            ]
          );
        });
      }

      return createImageObject(imageUri, 'no_faces');
    } catch (error) {
      console.error('Image anonymization error:', error);
      return createImageObject(imageUri, 'error');
    }
  };

  const createImageObject = (uri: string, status: string, result?: any): ClinicalImage => {
    const timestamp = new Date().toISOString();
    return {
      id: `img_${Date.now()}`,
      name: `clinical_image_${Date.now()}.jpg`,
      uri: uri,
      type: 'image/jpeg',
      size: 0, // Will be calculated
      description: '',
      uploadedAt: timestamp,
      verificationStatus: 'pending',
      anonymizationStatus: status === 'anonymized' ? 'completed' : 'pending',
      facesDetected: result?.faces_detected || 0,
      anonymizationMethod: result?.method || 'none',
      anonymizationConfidence: result?.confidence || 0,
      anonymizationTimestamp: new Date(),
    };
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setIsProcessingImages(true);
        const processedImage = await processImageAnonymization(result.assets[0].uri);
        setClinicalImages(prev => [...prev, processedImage]);
        setIsProcessingImages(false);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image');
      setIsProcessingImages(false);
    }
  };

  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setIsProcessingImages(true);
        const processedImage = await processImageAnonymization(result.assets[0].uri);
        setClinicalImages(prev => [...prev, processedImage]);
        setIsProcessingImages(false);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to take photo');
      setIsProcessingImages(false);
    }
  };

  const removeImage = (imageId: string) => {
    setClinicalImages(prev => prev.filter(img => img.id !== imageId));
  };

  const addMedication = () => {
    setStructuredData(prev => ({
      ...prev,
      medications: [...prev.medications, {
        name: '',
        dosage: '',
        frequency: '',
        route: '',
        indication: '',
      }]
    }));
  };

  const updateMedication = (index: number, field: string, value: string) => {
    setStructuredData(prev => ({
      ...prev,
      medications: prev.medications.map((med, i) => 
        i === index ? { ...med, [field]: value } : med
      )
    }));
  };

  const removeMedication = (index: number) => {
    setStructuredData(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index)
    }));
  };

  const addAllergy = () => {
    setStructuredData(prev => ({
      ...prev,
      allergies: [...prev.allergies, {
        allergen: '',
        reaction: '',
        severity: 'mild' as const,
      }]
    }));
  };

  const updateAllergy = (index: number, field: string, value: string) => {
    setStructuredData(prev => ({
      ...prev,
      allergies: prev.allergies.map((allergy, i) => 
        i === index ? { ...allergy, [field]: value } : allergy
      )
    }));
  };

  const removeAllergy = (index: number) => {
    setStructuredData(prev => ({
      ...prev,
      allergies: prev.allergies.filter((_, i) => i !== index)
    }));
  };

  const validateForm = (): boolean => {
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Please enter a case title');
      return false;
    }
    if (!description.trim()) {
      Alert.alert('Validation Error', 'Please enter a case description');
      return false;
    }
    if (!patientSymptoms.trim()) {
      Alert.alert('Validation Error', 'Please enter patient symptoms');
      return false;
    }
    if (!specialty.trim()) {
      Alert.alert('Validation Error', 'Please select a specialty');
      return false;
    }
    if (!department.trim()) {
      Alert.alert('Validation Error', 'Please enter a department');
      return false;
    }
    return true;
  };

  const submitCase = async () => {
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);

      // Process text de-identification for all text fields
      const processedTitle = await processTextDeidentification(title, 'title');
      const processedDescription = await processTextDeidentification(description, 'description');
      const processedSymptoms = await processTextDeidentification(patientSymptoms, 'symptoms');
      const processedHistory = await processTextDeidentification(patientHistory, 'history');

      const caseData = {
        title: processedTitle,
        description: processedDescription,
        patientSymptoms: processedSymptoms,
        patientHistory: processedHistory,
        diagnosticTests,
        suspectedConditions,
        urgency,
        specialty,
        department,
        tags,
        isAnonymous,
        structuredData,
        clinicalImages,
        deidentificationStatus: enableDeidentification ? 'completed' : 'pending',
        authorId: user?.id,
        authorName: user?.name || 'Unknown',
        authorSpecialty: user?.specialty || '',
        authorHospital: user?.hospital || '',
      };

      const response = await apiService.post('/clinical/questions', caseData);
      
      if (response.data.success) {
        Alert.alert(
          'Success',
          'Clinical case created successfully!',
          [
            {
              text: 'OK',
              onPress: () => router.back()
            }
          ]
        );
      } else {
        throw new Error(response.data.message || 'Failed to create case');
      }
    } catch (error) {
      console.error('Submit case error:', error);
      Alert.alert('Error', 'Failed to create clinical case. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderBasicInfo = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Basic Information</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Case Title *</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Enter case title"
          multiline
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Description *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Enter case description"
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Patient Symptoms *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={patientSymptoms}
          onChangeText={setPatientSymptoms}
          placeholder="Describe patient symptoms"
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Patient History</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={patientHistory}
          onChangeText={setPatientHistory}
          placeholder="Enter patient history"
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.row}>
        <View style={styles.halfWidth}>
          <Text style={styles.label}>Specialty *</Text>
          <TextInput
            style={styles.input}
            value={specialty}
            onChangeText={setSpecialty}
            placeholder="e.g., Cardiology"
          />
        </View>
        <View style={styles.halfWidth}>
          <Text style={styles.label}>Department *</Text>
          <TextInput
            style={styles.input}
            value={department}
            onChangeText={setDepartment}
            placeholder="e.g., Emergency"
          />
        </View>
      </View>

      {/* Urgency Level - Full Width */}
      <View style={[styles.inputGroup, styles.urgencyGroup]}>
        <Text style={styles.label}>Urgency Level</Text>
        <Text style={styles.fieldDescription}>Priority level for this case</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={urgency}
            onValueChange={setUrgency}
            style={styles.picker}
          >
            <Picker.Item label="Low - Routine" value="low" />
            <Picker.Item label="Medium - Standard" value="medium" />
            <Picker.Item label="High - Urgent" value="high" />
            <Picker.Item label="Critical - Emergency" value="critical" />
          </Picker>
        </View>
        <Text style={styles.fieldDescription}>
          Selected: {urgency === 'low' ? 'Low - Routine' : 
                    urgency === 'medium' ? 'Medium - Standard' :
                    urgency === 'high' ? 'High - Urgent' : 'Critical - Emergency'}
        </Text>
      </View>

      {/* Anonymous Case - Full Width */}
      <View style={styles.inputGroup}>
        <View style={styles.switchContainer}>
          <View style={styles.switchLabelContainer}>
            <Text style={styles.label}>Anonymous Case</Text>
            <Text style={styles.fieldDescription}>Hide author identity</Text>
          </View>
          <Switch
            value={isAnonymous}
            onValueChange={setIsAnonymous}
          />
        </View>
      </View>

      {/* Enable De-identification - Full Width */}
      <View style={styles.inputGroup}>
        <View style={styles.switchContainer}>
          <View style={styles.switchLabelContainer}>
            <Text style={styles.label}>Enable De-identification</Text>
            <Text style={styles.fieldDescription}>Automatically remove PHI from text</Text>
          </View>
          <Switch
            value={enableDeidentification}
            onValueChange={setEnableDeidentification}
          />
        </View>
      </View>
    </View>
  );

  const renderDemographics = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Demographics</Text>
      
      <View style={styles.row}>
        <View style={styles.halfWidth}>
          <Text style={styles.label}>Age</Text>
          <TextInput
            style={styles.input}
            value={structuredData.demographics.age?.toString() || ''}
            onChangeText={(text) => setStructuredData(prev => ({
              ...prev,
              demographics: {
                ...prev.demographics,
                age: text ? parseInt(text) : undefined
              }
            }))}
            placeholder="Age"
            keyboardType="numeric"
          />
        </View>
        <View style={styles.halfWidth}>
          <Text style={styles.label}>Gender</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={structuredData.demographics.gender || ''}
              onValueChange={(value) => setStructuredData(prev => ({
                ...prev,
                demographics: {
                  ...prev.demographics,
                  gender: value as any
                }
              }))}
              style={styles.picker}
            >
              <Picker.Item label="Select Gender" value="" />
              <Picker.Item label="Male" value="male" />
              <Picker.Item label="Female" value="female" />
              <Picker.Item label="Other" value="other" />
              <Picker.Item label="Unknown" value="unknown" />
            </Picker>
          </View>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Ethnicity</Text>
        <TextInput
          style={styles.input}
          value={structuredData.demographics.ethnicity || ''}
          onChangeText={(text) => setStructuredData(prev => ({
            ...prev,
            demographics: {
              ...prev.demographics,
              ethnicity: text
            }
          }))}
          placeholder="Ethnicity"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Race</Text>
        <TextInput
          style={styles.input}
          value={structuredData.demographics.race || ''}
          onChangeText={(text) => setStructuredData(prev => ({
            ...prev,
            demographics: {
              ...prev.demographics,
              race: text
            }
          }))}
          placeholder="Race"
        />
      </View>
    </View>
  );

  const renderVitalSigns = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Vital Signs</Text>
      
      <View style={styles.row}>
        <View style={styles.halfWidth}>
          <Text style={styles.label}>Systolic BP</Text>
          <TextInput
            style={styles.input}
            value={structuredData.vitalSigns.bloodPressure?.systolic?.toString() || ''}
            onChangeText={(text) => setStructuredData(prev => ({
              ...prev,
              vitalSigns: {
                ...prev.vitalSigns,
                bloodPressure: {
                  ...prev.vitalSigns.bloodPressure,
                  systolic: text ? parseInt(text) : 0,
                  diastolic: prev.vitalSigns.bloodPressure?.diastolic || 0,
                  unit: 'mmHg',
                  timestamp: new Date()
                }
              }
            }))}
            placeholder="120"
            keyboardType="numeric"
          />
        </View>
        <View style={styles.halfWidth}>
          <Text style={styles.label}>Diastolic BP</Text>
          <TextInput
            style={styles.input}
            value={structuredData.vitalSigns.bloodPressure?.diastolic?.toString() || ''}
            onChangeText={(text) => setStructuredData(prev => ({
              ...prev,
              vitalSigns: {
                ...prev.vitalSigns,
                bloodPressure: {
                  ...prev.vitalSigns.bloodPressure,
                  systolic: prev.vitalSigns.bloodPressure?.systolic || 0,
                  diastolic: text ? parseInt(text) : 0,
                  unit: 'mmHg',
                  timestamp: new Date()
                }
              }
            }))}
            placeholder="80"
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.halfWidth}>
          <Text style={styles.label}>Heart Rate (bpm)</Text>
          <TextInput
            style={styles.input}
            value={structuredData.vitalSigns.heartRate?.value?.toString() || ''}
            onChangeText={(text) => setStructuredData(prev => ({
              ...prev,
              vitalSigns: {
                ...prev.vitalSigns,
                heartRate: {
                  value: text ? parseInt(text) : 0,
                  unit: 'bpm',
                  timestamp: new Date()
                }
              }
            }))}
            placeholder="72"
            keyboardType="numeric"
          />
        </View>
        <View style={styles.halfWidth}>
          <Text style={styles.label}>Temperature (°C)</Text>
          <TextInput
            style={styles.input}
            value={structuredData.vitalSigns.temperature?.value?.toString() || ''}
            onChangeText={(text) => setStructuredData(prev => ({
              ...prev,
              vitalSigns: {
                ...prev.vitalSigns,
                temperature: {
                  value: text ? parseFloat(text) : 0,
                  unit: 'celsius',
                  timestamp: new Date()
                }
              }
            }))}
            placeholder="37.0"
            keyboardType="numeric"
          />
        </View>
      </View>
    </View>
  );

  const renderMedications = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Medications</Text>
        <TouchableOpacity style={styles.addButton} onPress={addMedication}>
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {structuredData.medications.map((med, index) => (
        <View key={index} style={styles.medicationCard}>
          <View style={styles.medicationHeader}>
            <Text style={styles.medicationTitle}>Medication {index + 1}</Text>
            <TouchableOpacity onPress={() => removeMedication(index)}>
              <Text style={styles.removeButton}>Remove</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={med.name}
              onChangeText={(text) => updateMedication(index, 'name', text)}
              placeholder="Medication name"
            />
          </View>

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Dosage</Text>
              <TextInput
                style={styles.input}
                value={med.dosage}
                onChangeText={(text) => updateMedication(index, 'dosage', text)}
                placeholder="e.g., 10mg"
              />
            </View>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Frequency</Text>
              <TextInput
                style={styles.input}
                value={med.frequency}
                onChangeText={(text) => updateMedication(index, 'frequency', text)}
                placeholder="e.g., BID"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Indication</Text>
            <TextInput
              style={styles.input}
              value={med.indication}
              onChangeText={(text) => updateMedication(index, 'indication', text)}
              placeholder="Reason for medication"
            />
          </View>
        </View>
      ))}
    </View>
  );

  const renderAllergies = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Allergies</Text>
        <TouchableOpacity style={styles.addButton} onPress={addAllergy}>
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {structuredData.allergies.map((allergy, index) => (
        <View key={index} style={styles.allergyCard}>
          <View style={styles.allergyHeader}>
            <Text style={styles.allergyTitle}>Allergy {index + 1}</Text>
            <TouchableOpacity onPress={() => removeAllergy(index)}>
              <Text style={styles.removeButton}>Remove</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Allergen</Text>
            <TextInput
              style={styles.input}
              value={allergy.allergen}
              onChangeText={(text) => updateAllergy(index, 'allergen', text)}
              placeholder="e.g., Penicillin"
            />
          </View>

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Reaction</Text>
              <TextInput
                style={styles.input}
                value={allergy.reaction}
                onChangeText={(text) => updateAllergy(index, 'reaction', text)}
                placeholder="e.g., Rash"
              />
            </View>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Severity</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={allergy.severity}
                  onValueChange={(value) => updateAllergy(index, 'severity', value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Mild" value="mild" />
                  <Picker.Item label="Moderate" value="moderate" />
                  <Picker.Item label="Severe" value="severe" />
                </Picker>
              </View>
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  const renderImages = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Clinical Images</Text>
      
      <View style={styles.imageButtons}>
        <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
          <Text style={styles.imageButtonText}>📷 Pick Image</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.imageButton} onPress={takePhoto}>
          <Text style={styles.imageButtonText}>📸 Take Photo</Text>
        </TouchableOpacity>
      </View>

      {isProcessingImages && (
        <View style={styles.processingContainer}>
          <ActivityIndicator size="small" color="#007AFF" />
          <Text style={styles.processingText}>Processing images...</Text>
        </View>
      )}

      {clinicalImages.map((image) => (
        <View key={image.id} style={styles.imageCard}>
          <View style={styles.imageHeader}>
            <Text style={styles.imageName}>{image.name}</Text>
            <TouchableOpacity onPress={() => removeImage(image.id)}>
              <Text style={styles.removeButton}>Remove</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.imageInfo}>
            <Text style={styles.imageStatus}>
              Status: {image.anonymizationStatus}
            </Text>
            {image.facesDetected && image.facesDetected > 0 && (
              <Text style={styles.imageStatus}>
                Faces: {image.facesDetected}
              </Text>
            )}
          </View>
        </View>
      ))}
    </View>
  );

  const renderSection = () => {
    switch (activeSection) {
      case 'basic':
        return renderBasicInfo();
      case 'demographics':
        return renderDemographics();
      case 'vitals':
        return renderVitalSigns();
      case 'medications':
        return renderMedications();
      case 'history':
        return renderAllergies();
      case 'images':
        return renderImages();
      default:
        return renderBasicInfo();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Clinical Case</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView 
          style={styles.sectionTabs} 
          contentContainerStyle={styles.sectionTabsContainer}
          horizontal 
          showsHorizontalScrollIndicator={false}
        >
          {[
            { key: 'basic', label: 'Basic' },
            { key: 'demographics', label: 'Demographics' },
            { key: 'vitals', label: 'Vitals' },
            { key: 'medications', label: 'Medications' },
            { key: 'history', label: 'Allergies' },
            { key: 'images', label: 'Images' },
          ].map((section) => (
            <TouchableOpacity
              key={section.key}
              style={[
                styles.tab,
                activeSection === section.key && styles.activeTab
              ]}
              onPress={() => setActiveSection(section.key as any)}
            >
              <Text style={[
                styles.tabText,
                activeSection === section.key && styles.activeTabText
              ]}>
                {section.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView 
          style={styles.content} 
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {renderSection()}
          
          {/* Submit button inside scroll view */}
          <View style={styles.submitSection}>
            <TouchableOpacity
              style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
              onPress={submitCase}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.submitButtonText}>Create Case</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    fontSize: 16,
    color: '#007AFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 50,
  },
  sectionTabs: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sectionTabsContainer: {
    paddingHorizontal: 15,
  },
  tab: {
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginRight: 5,
  },
  activeTab: {
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 10,
    paddingBottom: 20,
  },
  section: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 0,
    marginTop: 0,
    marginHorizontal: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    marginTop: 0,
  },
  inputGroup: {
    marginBottom: 12,
  },
  urgencyGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  fieldDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    flex: 1,
    marginRight: 10,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f8f8f8',
    minHeight: 50,
    justifyContent: 'center',
    marginBottom: 5,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    backgroundColor: '#f8f8f8',
    color: '#333',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  switchLabelContainer: {
    flex: 1,
    marginRight: 15,
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  medicationCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  medicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  medicationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  allergyCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  allergyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  allergyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  removeButton: {
    color: '#FF3B30',
    fontWeight: 'bold',
  },
  imageButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  imageButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  imageButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  processingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  processingText: {
    marginLeft: 10,
    color: '#666',
  },
  imageCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  imageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  imageName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  imageInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  imageStatus: {
    fontSize: 12,
    color: '#666',
  },
  submitSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
