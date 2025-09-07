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
  const [showDiscussionForm, setShowDiscussionForm] = useState(false);
  const [showClinicalForm, setShowClinicalForm] = useState(false);
  const [discussionData, setDiscussionData] = useState({
    title: '',
    content: '',
    urgency: 'normal',
    category: '',
    attachments: []
  });
  const [clinicalData, setClinicalData] = useState({
    title: '',
    question: '',
    specialty: 'general',
    urgency: 'medium',
    patientAge: '',
    patientGender: '',
    symptoms: [],
    labValues: '',
    vitalSigns: '',
    medications: '',
    allergies: '',
    familyHistory: '',
    socialHistory: '',
    physicalExam: '',
    clinicalImages: [],
    comorbidities: []
  });
  const [joinedChannels, setJoinedChannels] = useState(new Set(['general'])); // User starts in general channel
  const [isAnonymousMode, setIsAnonymousMode] = useState(false); // Identity hiding mode
  const [showRegistration, setShowRegistration] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [forgotPasswordData, setForgotPasswordData] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Registration form fields
  const [registrationData, setRegistrationData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: '',
    
    // Professional Information
    medicalLicenseNumber: '',
    specialty: '',
    subSpecialty: '',
    yearsOfExperience: '',
    currentHospital: '',
    currentPosition: '',
    medicalSchool: '',
    graduationYear: '',
    
    // Professional Certifications
    boardCertifications: [],
    additionalCertifications: [],
    
    // Contact Information
    workAddress: '',
    workCity: '',
    workState: '',
    workCountry: '',
    workPostalCode: '',
    
    // Preferences
    preferredLanguage: 'English',
    timeZone: '',
    notificationPreferences: {
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      clinicalAlerts: true,
      peerReviewRequests: true,
      systemUpdates: false
    },
    
    // Terms and Conditions
    agreeToTerms: false,
    agreeToPrivacyPolicy: false,
    agreeToDataProcessing: false,
    agreeToClinicalGuidelines: false
  });

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
    setShowDiscussionForm(false);
    setShowClinicalForm(false);
    setDiscussionData({
      title: '',
      content: '',
      urgency: 'normal',
      category: '',
      attachments: []
    });
    setClinicalData({
      title: '',
      question: '',
      specialty: 'general',
      urgency: 'medium',
      patientAge: '',
      patientGender: '',
      symptoms: [],
      labValues: '',
      vitalSigns: '',
      medications: '',
      allergies: '',
      familyHistory: '',
      socialHistory: '',
      physicalExam: '',
      clinicalImages: [],
      comorbidities: []
    });
    setJoinedChannels(new Set(['general']));
    setIsAnonymousMode(false);
    setEmail('');
    setPassword('');
  };

  const handleStartDiscussion = () => {
    setShowDiscussionForm(true);
  };

  const handleStartClinicalQuestion = () => {
    setShowClinicalForm(true);
  };

  const handleSubmitDiscussion = () => {
    // Here you would typically send the data to your backend
    Alert.alert('Success', 'Discussion posted successfully!');
    setShowDiscussionForm(false);
    setDiscussionData({
      title: '',
      content: '',
      urgency: 'normal',
      category: '',
      attachments: []
    });
  };

  const handleSubmitClinicalQuestion = () => {
    // Here you would typically send the data to your backend for AI analysis
    Alert.alert('Success', 'Clinical question submitted! AI analysis will be available shortly.');
    setShowClinicalForm(false);
    setClinicalData({
      title: '',
      question: '',
      specialty: 'general',
      urgency: 'medium',
      patientAge: '',
      patientGender: '',
      symptoms: [],
      labValues: '',
      vitalSigns: '',
      medications: '',
      allergies: '',
      familyHistory: '',
      socialHistory: '',
      physicalExam: '',
      clinicalImages: [],
      comorbidities: []
    });
  };

  const getChannelCategories = (channel) => {
    switch (channel) {
      case 'cardiology':
        return ['MI Management', 'Heart Failure', 'Arrhythmias', 'Echocardiography', 'Interventional', 'General'];
      case 'emergency':
        return ['Trauma', 'Chest Pain', 'Sepsis', 'Stroke', 'Pediatric Emergency', 'Toxicology'];
      case 'radiology':
        return ['Chest X-Ray', 'CT Scan', 'MRI', 'Ultrasound', 'Nuclear Medicine', 'Interventional'];
      case 'pediatrics':
        return ['Neonatology', 'Infectious Disease', 'Cardiology', 'Neurology', 'Endocrinology', 'General'];
      case 'general':
        return ['Hypertension', 'Diabetes', 'Mental Health', 'Preventive Care', 'Chronic Disease', 'General'];
      default:
        return ['General'];
    }
  };

  const getClinicalSpecialties = () => {
    return ['General Medicine', 'Cardiology', 'Emergency Medicine', 'Radiology', 'Pediatrics', 'Neurology', 'Oncology', 'Surgery'];
  };

  const getCommonSymptoms = () => {
    return ['Fever', 'Chest Pain', 'Shortness of Breath', 'Headache', 'Nausea', 'Vomiting', 'Diarrhea', 'Fatigue', 'Dizziness', 'Cough', 'Abdominal Pain', 'Back Pain'];
  };

  const getCommonComorbidities = () => {
    return ['Hypertension', 'Diabetes', 'Heart Disease', 'COPD', 'Asthma', 'Obesity', 'Depression', 'Anxiety', 'Arthritis', 'Cancer'];
  };

  const handleJoinChannel = (channelId) => {
    setJoinedChannels(prev => new Set([...prev, channelId]));
    Alert.alert('Success', `Joined ${channelId} channel successfully!`);
  };

  const handleLeaveChannel = (channelId) => {
    if (channelId === 'general') {
      Alert.alert('Cannot Leave', 'You cannot leave the general channel as it is required for all users.');
      return;
    }
    setJoinedChannels(prev => {
      const newSet = new Set(prev);
      newSet.delete(channelId);
      return newSet;
    });
    Alert.alert('Success', `Left ${channelId} channel successfully!`);
  };

  const isChannelJoined = (channelId) => {
    return joinedChannels.has(channelId);
  };

  const toggleAnonymousMode = () => {
    setIsAnonymousMode(!isAnonymousMode);
    Alert.alert(
      isAnonymousMode ? 'Identity Visible' : 'Identity Hidden',
      isAnonymousMode 
        ? 'Your identity is now visible to other practitioners.' 
        : 'Your identity is now hidden. You will appear as "Anonymous" in discussions.'
    );
  };

  const getDisplayName = () => {
    return isAnonymousMode ? 'Anonymous' : 'Dr. Smith';
  };

  const getDisplayAvatar = () => {
    return isAnonymousMode ? '👤' : '👨‍⚕️';
  };

  const handleRegistration = () => {
    // Validate required fields
    if (!registrationData.firstName || !registrationData.lastName || !registrationData.email || 
        !registrationData.password || !registrationData.medicalLicenseNumber || 
        !registrationData.specialty || !registrationData.currentHospital) {
      Alert.alert('Registration Error', 'Please fill in all required fields.');
      return;
    }

    if (registrationData.password !== registrationData.confirmPassword) {
      Alert.alert('Registration Error', 'Passwords do not match.');
      return;
    }

    if (!registrationData.agreeToTerms || !registrationData.agreeToPrivacyPolicy || 
        !registrationData.agreeToDataProcessing || !registrationData.agreeToClinicalGuidelines) {
      Alert.alert('Registration Error', 'Please agree to all terms and conditions.');
      return;
    }

    // Simulate registration success
    Alert.alert(
      'Registration Successful!', 
      'Your account has been created. Please wait for verification of your medical credentials.',
      [
        {
          text: 'OK',
          onPress: () => {
            setShowRegistration(false);
            setEmail(registrationData.email);
            setPassword(registrationData.password);
            Alert.alert('Next Steps', 'Please check your email for verification instructions.');
          }
        }
      ]
    );
  };

  const updateRegistrationField = (field: string, value: any) => {
    setRegistrationData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateNotificationPreference = (preference: string, value: boolean) => {
    setRegistrationData(prev => ({
      ...prev,
      notificationPreferences: {
        ...prev.notificationPreferences,
        [preference]: value
      }
    }));
  };

  const getMedicalSpecialties = () => [
    'Internal Medicine', 'Surgery', 'Pediatrics', 'Obstetrics & Gynecology',
    'Psychiatry', 'Radiology', 'Anesthesiology', 'Emergency Medicine',
    'Family Medicine', 'Cardiology', 'Neurology', 'Orthopedics',
    'Dermatology', 'Ophthalmology', 'ENT', 'Urology', 'Oncology',
    'Pathology', 'Public Health', 'Other'
  ];

  const getMedicalPositions = () => [
    'Resident', 'Fellow', 'Attending Physician', 'Chief Resident',
    'Department Head', 'Medical Director', 'Consultant', 'Private Practice',
    'Academic Faculty', 'Research Physician', 'Other'
  ];

  const handleForgotPassword = () => {
    if (!forgotPasswordData.email) {
      Alert.alert('Error', 'Please enter your email address.');
      return;
    }

    // Simulate sending OTP
    Alert.alert(
      'OTP Sent',
      `A verification code has been sent to ${forgotPasswordData.email}. Please check your email.`,
      [
        {
          text: 'OK',
          onPress: () => setForgotPasswordStep(2)
        }
      ]
    );
  };

  const handleVerifyOTP = () => {
    if (!forgotPasswordData.otp) {
      Alert.alert('Error', 'Please enter the verification code.');
      return;
    }

    // Simulate OTP verification (in real app, this would verify with backend)
    if (forgotPasswordData.otp.length === 6) {
      setForgotPasswordStep(3);
    } else {
      Alert.alert('Error', 'Please enter a valid 6-digit verification code.');
    }
  };

  const handleResetPassword = () => {
    if (!forgotPasswordData.newPassword || !forgotPasswordData.confirmPassword) {
      Alert.alert('Error', 'Please fill in all password fields.');
      return;
    }

    if (forgotPasswordData.newPassword !== forgotPasswordData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    if (forgotPasswordData.newPassword.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long.');
      return;
    }

    // Simulate password reset success
    Alert.alert(
      'Password Reset Successful',
      'Your password has been successfully reset. You can now login with your new password.',
      [
        {
          text: 'OK',
          onPress: () => {
            setShowForgotPassword(false);
            setForgotPasswordStep(1);
            setForgotPasswordData({
              email: '',
              otp: '',
              newPassword: '',
              confirmPassword: ''
            });
          }
        }
      ]
    );
  };

  const updateForgotPasswordField = (field: string, value: string) => {
    setForgotPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resendOTP = () => {
    Alert.alert(
      'OTP Resent',
      `A new verification code has been sent to ${forgotPasswordData.email}.`,
      [
        {
          text: 'OK',
          onPress: () => {
            setForgotPasswordData(prev => ({
              ...prev,
              otp: ''
            }));
          }
        }
      ]
    );
  };

  if (!isLoggedIn) {
    return (
      <ScrollView style={styles.loginContainer} contentContainerStyle={styles.loginContent}>
        <View style={styles.loginHeader}>
          <Text style={styles.title}>CCN Mobile App</Text>
          <Text style={styles.subtitle}>Clinical Communication Network</Text>
        </View>
        
        <View style={styles.loginForm}>
          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
            />
          </View>
          
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
          
          <View style={styles.loginLinks}>
            <TouchableOpacity 
              style={styles.registerLink} 
              onPress={() => setShowRegistration(true)}
            >
              <Text style={styles.registerLinkText}>New to CCN? Create Account</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.forgotPasswordLink} 
              onPress={() => setShowForgotPassword(true)}
            >
              <Text style={styles.forgotPasswordLinkText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.demoSection}>
            <Text style={styles.demoText}>
              Demo: admin@test.com / admin123456
            </Text>
          </View>
        </View>
      </ScrollView>
    );
  }

  // Registration Screen
  if (showRegistration) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.registrationHeader}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => setShowRegistration(false)}
          >
            <Text style={styles.backText}>← Back to Login</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Medical Practitioner Registration</Text>
          <Text style={styles.subtitle}>Join the Clinical Communication Network</Text>
        </View>

        {/* Personal Information Section */}
        <View style={styles.registrationSection}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.formRow}>
            <View style={styles.halfInput}>
              <Text style={styles.formLabel}>First Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter first name"
                value={registrationData.firstName}
                onChangeText={(value) => updateRegistrationField('firstName', value)}
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.formLabel}>Last Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter last name"
                value={registrationData.lastName}
                onChangeText={(value) => updateRegistrationField('lastName', value)}
              />
            </View>
          </View>

          <Text style={styles.formLabel}>Email Address *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter email address"
            value={registrationData.email}
            onChangeText={(value) => updateRegistrationField('email', value)}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <View style={styles.formRow}>
            <View style={styles.halfInput}>
              <Text style={styles.formLabel}>Password *</Text>
              <TextInput
                style={styles.input}
                placeholder="Create password"
                value={registrationData.password}
                onChangeText={(value) => updateRegistrationField('password', value)}
                secureTextEntry
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.formLabel}>Confirm Password *</Text>
              <TextInput
                style={styles.input}
                placeholder="Confirm password"
                value={registrationData.confirmPassword}
                onChangeText={(value) => updateRegistrationField('confirmPassword', value)}
                secureTextEntry
              />
            </View>
          </View>

          <View style={styles.formRow}>
            <View style={styles.halfInput}>
              <Text style={styles.formLabel}>Phone Number</Text>
              <TextInput
                style={styles.input}
                placeholder="+1 (555) 123-4567"
                value={registrationData.phoneNumber}
                onChangeText={(value) => updateRegistrationField('phoneNumber', value)}
                keyboardType="phone-pad"
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.formLabel}>Gender</Text>
              <TextInput
                style={styles.input}
                placeholder="Male/Female/Other"
                value={registrationData.gender}
                onChangeText={(value) => updateRegistrationField('gender', value)}
              />
            </View>
          </View>
        </View>

        {/* Professional Information Section */}
        <View style={styles.registrationSection}>
          <Text style={styles.sectionTitle}>Professional Information</Text>
          
          <Text style={styles.formLabel}>Medical License Number *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter medical license number"
            value={registrationData.medicalLicenseNumber}
            onChangeText={(value) => updateRegistrationField('medicalLicenseNumber', value)}
          />

          <View style={styles.formRow}>
            <View style={styles.halfInput}>
              <Text style={styles.formLabel}>Medical Specialty *</Text>
              <TextInput
                style={styles.input}
                placeholder="Select specialty"
                value={registrationData.specialty}
                onChangeText={(value) => updateRegistrationField('specialty', value)}
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.formLabel}>Sub-Specialty</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter sub-specialty"
                value={registrationData.subSpecialty}
                onChangeText={(value) => updateRegistrationField('subSpecialty', value)}
              />
            </View>
          </View>

          <View style={styles.formRow}>
            <View style={styles.halfInput}>
              <Text style={styles.formLabel}>Years of Experience</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 5"
                value={registrationData.yearsOfExperience}
                onChangeText={(value) => updateRegistrationField('yearsOfExperience', value)}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.formLabel}>Current Position</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Attending Physician"
                value={registrationData.currentPosition}
                onChangeText={(value) => updateRegistrationField('currentPosition', value)}
              />
            </View>
          </View>

          <Text style={styles.formLabel}>Current Hospital/Institution *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter hospital or institution name"
            value={registrationData.currentHospital}
            onChangeText={(value) => updateRegistrationField('currentHospital', value)}
          />

          <View style={styles.formRow}>
            <View style={styles.halfInput}>
              <Text style={styles.formLabel}>Medical School</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter medical school"
                value={registrationData.medicalSchool}
                onChangeText={(value) => updateRegistrationField('medicalSchool', value)}
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.formLabel}>Graduation Year</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 2015"
                value={registrationData.graduationYear}
                onChangeText={(value) => updateRegistrationField('graduationYear', value)}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        {/* Work Address Section */}
        <View style={styles.registrationSection}>
          <Text style={styles.sectionTitle}>Work Address</Text>
          
          <Text style={styles.formLabel}>Street Address</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter work address"
            value={registrationData.workAddress}
            onChangeText={(value) => updateRegistrationField('workAddress', value)}
          />

          <View style={styles.formRow}>
            <View style={styles.halfInput}>
              <Text style={styles.formLabel}>City</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter city"
                value={registrationData.workCity}
                onChangeText={(value) => updateRegistrationField('workCity', value)}
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.formLabel}>State/Province</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter state"
                value={registrationData.workState}
                onChangeText={(value) => updateRegistrationField('workState', value)}
              />
            </View>
          </View>

          <View style={styles.formRow}>
            <View style={styles.halfInput}>
              <Text style={styles.formLabel}>Country</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter country"
                value={registrationData.workCountry}
                onChangeText={(value) => updateRegistrationField('workCountry', value)}
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.formLabel}>Postal Code</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter postal code"
                value={registrationData.workPostalCode}
                onChangeText={(value) => updateRegistrationField('workPostalCode', value)}
              />
            </View>
          </View>
        </View>

        {/* Notification Preferences Section */}
        <View style={styles.registrationSection}>
          <Text style={styles.sectionTitle}>Notification Preferences</Text>
          
          <View style={styles.checkboxContainer}>
            <TouchableOpacity 
              style={styles.checkbox}
              onPress={() => updateNotificationPreference('emailNotifications', !registrationData.notificationPreferences.emailNotifications)}
            >
              <Text style={styles.checkboxText}>
                {registrationData.notificationPreferences.emailNotifications ? '☑️' : '☐'} Email Notifications
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.checkbox}
              onPress={() => updateNotificationPreference('pushNotifications', !registrationData.notificationPreferences.pushNotifications)}
            >
              <Text style={styles.checkboxText}>
                {registrationData.notificationPreferences.pushNotifications ? '☑️' : '☐'} Push Notifications
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.checkbox}
              onPress={() => updateNotificationPreference('clinicalAlerts', !registrationData.notificationPreferences.clinicalAlerts)}
            >
              <Text style={styles.checkboxText}>
                {registrationData.notificationPreferences.clinicalAlerts ? '☑️' : '☐'} Clinical Alerts
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.checkbox}
              onPress={() => updateNotificationPreference('peerReviewRequests', !registrationData.notificationPreferences.peerReviewRequests)}
            >
              <Text style={styles.checkboxText}>
                {registrationData.notificationPreferences.peerReviewRequests ? '☑️' : '☐'} Peer Review Requests
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Terms and Conditions Section */}
        <View style={styles.registrationSection}>
          <Text style={styles.sectionTitle}>Terms and Conditions</Text>
          
          <View style={styles.checkboxContainer}>
            <TouchableOpacity 
              style={styles.checkbox}
              onPress={() => updateRegistrationField('agreeToTerms', !registrationData.agreeToTerms)}
            >
              <Text style={styles.checkboxText}>
                {registrationData.agreeToTerms ? '☑️' : '☐'} I agree to the Terms of Service *
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.checkbox}
              onPress={() => updateRegistrationField('agreeToPrivacyPolicy', !registrationData.agreeToPrivacyPolicy)}
            >
              <Text style={styles.checkboxText}>
                {registrationData.agreeToPrivacyPolicy ? '☑️' : '☐'} I agree to the Privacy Policy *
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.checkbox}
              onPress={() => updateRegistrationField('agreeToDataProcessing', !registrationData.agreeToDataProcessing)}
            >
              <Text style={styles.checkboxText}>
                {registrationData.agreeToDataProcessing ? '☑️' : '☐'} I consent to data processing for clinical purposes *
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.checkbox}
              onPress={() => updateRegistrationField('agreeToClinicalGuidelines', !registrationData.agreeToClinicalGuidelines)}
            >
              <Text style={styles.checkboxText}>
                {registrationData.agreeToClinicalGuidelines ? '☑️' : '☐'} I agree to follow clinical communication guidelines *
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Registration Button */}
        <View style={styles.registrationFooter}>
          <TouchableOpacity style={styles.registerButton} onPress={handleRegistration}>
            <Text style={styles.registerButtonText}>Create Account</Text>
          </TouchableOpacity>
          
          <Text style={styles.registrationNote}>
            * Required fields. Your medical credentials will be verified before account activation.
          </Text>
        </View>
      </ScrollView>
    );
  }

  // Forgot Password Screen
  if (showForgotPassword) {
    return (
      <View style={styles.container}>
        <View style={styles.forgotPasswordHeader}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => {
              setShowForgotPassword(false);
              setForgotPasswordStep(1);
              setForgotPasswordData({
                email: '',
                otp: '',
                newPassword: '',
                confirmPassword: ''
              });
            }}
          >
            <Text style={styles.backText}>← Back to Login</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>Recover your CCN account access</Text>
        </View>

        {/* Step 1: Email Verification */}
        {forgotPasswordStep === 1 && (
          <View style={styles.forgotPasswordContent}>
            <View style={styles.stepIndicator}>
              <View style={styles.stepActive}>
                <Text style={styles.stepNumber}>1</Text>
              </View>
              <View style={styles.stepLine}></View>
              <View style={styles.stepInactive}>
                <Text style={styles.stepNumberInactive}>2</Text>
              </View>
              <View style={styles.stepLine}></View>
              <View style={styles.stepInactive}>
                <Text style={styles.stepNumberInactive}>3</Text>
              </View>
            </View>

            <Text style={styles.stepTitle}>Enter Your Email</Text>
            <Text style={styles.stepDescription}>
              We'll send a verification code to your registered email address.
            </Text>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email address"
                value={forgotPasswordData.email}
                onChangeText={(value) => updateForgotPasswordField('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            <TouchableOpacity style={styles.primaryButton} onPress={handleForgotPassword}>
              <Text style={styles.primaryButtonText}>Send Verification Code</Text>
            </TouchableOpacity>

            <View style={styles.securityNote}>
              <Text style={styles.securityNoteText}>
                🔒 Your email address is secure and will only be used for password recovery.
              </Text>
            </View>
          </View>
        )}

        {/* Step 2: OTP Verification */}
        {forgotPasswordStep === 2 && (
          <View style={styles.forgotPasswordContent}>
            <View style={styles.stepIndicator}>
              <View style={styles.stepCompleted}>
                <Text style={styles.stepNumber}>✓</Text>
              </View>
              <View style={styles.stepLineCompleted}></View>
              <View style={styles.stepActive}>
                <Text style={styles.stepNumber}>2</Text>
              </View>
              <View style={styles.stepLine}></View>
              <View style={styles.stepInactive}>
                <Text style={styles.stepNumberInactive}>3</Text>
              </View>
            </View>

            <Text style={styles.stepTitle}>Verify Your Email</Text>
            <Text style={styles.stepDescription}>
              Enter the 6-digit verification code sent to {forgotPasswordData.email}
            </Text>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Verification Code</Text>
              <TextInput
                style={styles.otpInput}
                placeholder="000000"
                value={forgotPasswordData.otp}
                onChangeText={(value) => updateForgotPasswordField('otp', value)}
                keyboardType="numeric"
                maxLength={6}
                textAlign="center"
                autoComplete="one-time-code"
              />
            </View>

            <TouchableOpacity style={styles.primaryButton} onPress={handleVerifyOTP}>
              <Text style={styles.primaryButtonText}>Verify Code</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.resendButton} onPress={resendOTP}>
              <Text style={styles.resendButtonText}>Resend Code</Text>
            </TouchableOpacity>

            <View style={styles.securityNote}>
              <Text style={styles.securityNoteText}>
                ⏰ Verification code expires in 10 minutes.
              </Text>
            </View>
          </View>
        )}

        {/* Step 3: New Password */}
        {forgotPasswordStep === 3 && (
          <View style={styles.forgotPasswordContent}>
            <View style={styles.stepIndicator}>
              <View style={styles.stepCompleted}>
                <Text style={styles.stepNumber}>✓</Text>
              </View>
              <View style={styles.stepLineCompleted}></View>
              <View style={styles.stepCompleted}>
                <Text style={styles.stepNumber}>✓</Text>
              </View>
              <View style={styles.stepLineCompleted}></View>
              <View style={styles.stepActive}>
                <Text style={styles.stepNumber}>3</Text>
              </View>
            </View>

            <Text style={styles.stepTitle}>Create New Password</Text>
            <Text style={styles.stepDescription}>
              Choose a strong password for your CCN account.
            </Text>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>New Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter new password"
                value={forgotPasswordData.newPassword}
                onChangeText={(value) => updateForgotPasswordField('newPassword', value)}
                secureTextEntry
                autoComplete="new-password"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Confirm New Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Confirm new password"
                value={forgotPasswordData.confirmPassword}
                onChangeText={(value) => updateForgotPasswordField('confirmPassword', value)}
                secureTextEntry
                autoComplete="new-password"
              />
            </View>

            <View style={styles.passwordRequirements}>
              <Text style={styles.passwordRequirementsTitle}>Password Requirements:</Text>
              <Text style={styles.passwordRequirement}>• At least 8 characters long</Text>
              <Text style={styles.passwordRequirement}>• Mix of letters, numbers, and symbols</Text>
              <Text style={styles.passwordRequirement}>• Different from your previous password</Text>
            </View>

            <TouchableOpacity style={styles.primaryButton} onPress={handleResetPassword}>
              <Text style={styles.primaryButtonText}>Reset Password</Text>
            </TouchableOpacity>

            <View style={styles.securityNote}>
              <Text style={styles.securityNoteText}>
                🔐 Your new password will be encrypted and stored securely.
              </Text>
            </View>
          </View>
        )}
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
            <View style={styles.headerSection}>
              <View style={styles.headerTop}>
                <View>
                  <Text style={styles.sectionTitle}>Welcome to CCN!</Text>
                  <Text style={styles.sectionSubtitle}>Clinical Communication Network</Text>
                </View>
                <TouchableOpacity 
                  style={[styles.anonymousToggle, isAnonymousMode && styles.anonymousToggleActive]}
                  onPress={toggleAnonymousMode}
                >
                  <Text style={styles.anonymousIcon}>{isAnonymousMode ? '👤' : '👨‍⚕️'}</Text>
                  <Text style={[styles.anonymousText, isAnonymousMode && styles.anonymousTextActive]}>
                    {isAnonymousMode ? 'Anonymous' : 'Visible'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            
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

            <TouchableOpacity style={styles.primaryButton} onPress={handleStartClinicalQuestion}>
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
              <View style={styles.channelItem}>
                <TouchableOpacity style={styles.channelItemContent} onPress={() => { setSelectedChannel('cardiology'); setCurrentScreen('channel'); }}>
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
                <View style={styles.channelActions}>
                  {isChannelJoined('cardiology') ? (
                    <TouchableOpacity 
                      style={styles.leaveButton} 
                      onPress={() => handleLeaveChannel('cardiology')}
                    >
                      <Text style={styles.leaveButtonText}>Leave</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity 
                      style={styles.joinButton} 
                      onPress={() => handleJoinChannel('cardiology')}
                    >
                      <Text style={styles.joinButtonText}>Join</Text>
                    </TouchableOpacity>
                  )}
                  {isChannelJoined('cardiology') && (
                    <TouchableOpacity 
                      style={styles.startDiscussionButton} 
                      onPress={handleStartDiscussion}
                    >
                      <Text style={styles.startDiscussionButtonText}>Start Discussion</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <View style={styles.channelItem}>
                <TouchableOpacity style={styles.channelItemContent} onPress={() => { setSelectedChannel('emergency'); setCurrentScreen('channel'); }}>
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
                <View style={styles.channelActions}>
                  {isChannelJoined('emergency') ? (
                    <TouchableOpacity 
                      style={styles.leaveButton} 
                      onPress={() => handleLeaveChannel('emergency')}
                    >
                      <Text style={styles.leaveButtonText}>Leave</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity 
                      style={styles.joinButton} 
                      onPress={() => handleJoinChannel('emergency')}
                    >
                      <Text style={styles.joinButtonText}>Join</Text>
                    </TouchableOpacity>
                  )}
                  {isChannelJoined('emergency') && (
                    <TouchableOpacity 
                      style={styles.startDiscussionButton} 
                      onPress={handleStartDiscussion}
                    >
                      <Text style={styles.startDiscussionButtonText}>Start Discussion</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <View style={styles.channelItem}>
                <TouchableOpacity style={styles.channelItemContent} onPress={() => { setSelectedChannel('radiology'); setCurrentScreen('channel'); }}>
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
                <View style={styles.channelActions}>
                  {isChannelJoined('radiology') ? (
                    <TouchableOpacity 
                      style={styles.leaveButton} 
                      onPress={() => handleLeaveChannel('radiology')}
                    >
                      <Text style={styles.leaveButtonText}>Leave</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity 
                      style={styles.joinButton} 
                      onPress={() => handleJoinChannel('radiology')}
                    >
                      <Text style={styles.joinButtonText}>Join</Text>
                    </TouchableOpacity>
                  )}
                  {isChannelJoined('radiology') && (
                    <TouchableOpacity 
                      style={styles.startDiscussionButton} 
                      onPress={handleStartDiscussion}
                    >
                      <Text style={styles.startDiscussionButtonText}>Start Discussion</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <View style={styles.channelItem}>
                <TouchableOpacity style={styles.channelItemContent} onPress={() => { setSelectedChannel('pediatrics'); setCurrentScreen('channel'); }}>
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
                <View style={styles.channelActions}>
                  {isChannelJoined('pediatrics') ? (
                    <TouchableOpacity 
                      style={styles.leaveButton} 
                      onPress={() => handleLeaveChannel('pediatrics')}
                    >
                      <Text style={styles.leaveButtonText}>Leave</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity 
                      style={styles.joinButton} 
                      onPress={() => handleJoinChannel('pediatrics')}
                    >
                      <Text style={styles.joinButtonText}>Join</Text>
                    </TouchableOpacity>
                  )}
                  {isChannelJoined('pediatrics') && (
                    <TouchableOpacity 
                      style={styles.startDiscussionButton} 
                      onPress={handleStartDiscussion}
                    >
                      <Text style={styles.startDiscussionButtonText}>Start Discussion</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <View style={styles.channelItem}>
                <TouchableOpacity style={styles.channelItemContent} onPress={() => { setSelectedChannel('general'); setCurrentScreen('channel'); }}>
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
                <View style={styles.channelActions}>
                  <View style={styles.joinedBadge}>
                    <Text style={styles.joinedBadgeText}>Joined</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.startDiscussionButton} 
                    onPress={handleStartDiscussion}
                  >
                    <Text style={styles.startDiscussionButtonText}>Start Discussion</Text>
                  </TouchableOpacity>
                </View>
              </View>
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

                <TouchableOpacity style={styles.primaryButton} onPress={handleStartDiscussion}>
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

                <TouchableOpacity style={styles.primaryButton} onPress={handleStartDiscussion}>
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

                <TouchableOpacity style={styles.primaryButton} onPress={handleStartDiscussion}>
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

                <TouchableOpacity style={styles.primaryButton} onPress={handleStartDiscussion}>
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

                <TouchableOpacity style={styles.primaryButton} onPress={handleStartDiscussion}>
                  <Text style={styles.primaryButtonText}>Start Discussion</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {showDiscussionForm && (
          <View>
            <TouchableOpacity style={styles.backButton} onPress={() => setShowDiscussionForm(false)}>
              <Text style={styles.backText}>← Back to Channel</Text>
            </TouchableOpacity>
            
            <View style={styles.headerSection}>
              <Text style={styles.sectionTitle}>
                {selectedChannel === 'cardiology' && 'Start Cardiology Discussion'}
                {selectedChannel === 'emergency' && 'Report Emergency Case'}
                {selectedChannel === 'radiology' && 'Upload New Study'}
                {selectedChannel === 'pediatrics' && 'Post Pediatric Case'}
                {selectedChannel === 'general' && 'Start Discussion'}
              </Text>
              <Text style={styles.sectionSubtitle}>
                Share your clinical case with the community
              </Text>
              <View style={[styles.identityStatus, isAnonymousMode && styles.identityStatusAnonymous]}>
                <Text style={styles.identityStatusText}>
                  Posting as: {getDisplayName()} {getDisplayAvatar()}
                </Text>
                <TouchableOpacity 
                  style={styles.identityToggle}
                  onPress={toggleAnonymousMode}
                >
                  <Text style={styles.identityToggleText}>
                    {isAnonymousMode ? 'Show Identity' : 'Hide Identity'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.discussionForm}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Discussion Title *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Enter a descriptive title for your discussion"
                  value={discussionData.title}
                  onChangeText={(text) => setDiscussionData({...discussionData, title: text})}
                  multiline
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Category *</Text>
                <View style={styles.categoryGrid}>
                  {getChannelCategories(selectedChannel).map((category, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.categoryChip,
                        discussionData.category === category && styles.categoryChipSelected
                      ]}
                      onPress={() => setDiscussionData({...discussionData, category})}
                    >
                      <Text style={[
                        styles.categoryChipText,
                        discussionData.category === category && styles.categoryChipTextSelected
                      ]}>
                        {category}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Urgency Level *</Text>
                <View style={styles.urgencyGrid}>
                  <TouchableOpacity
                    style={[
                      styles.urgencyButton,
                      discussionData.urgency === 'low' && styles.urgencyButtonSelected
                    ]}
                    onPress={() => setDiscussionData({...discussionData, urgency: 'low'})}
                  >
                    <Text style={styles.urgencyIcon}>🟢</Text>
                    <Text style={[
                      styles.urgencyText,
                      discussionData.urgency === 'low' && styles.urgencyTextSelected
                    ]}>Low</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.urgencyButton,
                      discussionData.urgency === 'normal' && styles.urgencyButtonSelected
                    ]}
                    onPress={() => setDiscussionData({...discussionData, urgency: 'normal'})}
                  >
                    <Text style={styles.urgencyIcon}>🟡</Text>
                    <Text style={[
                      styles.urgencyText,
                      discussionData.urgency === 'normal' && styles.urgencyTextSelected
                    ]}>Normal</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.urgencyButton,
                      discussionData.urgency === 'high' && styles.urgencyButtonSelected
                    ]}
                    onPress={() => setDiscussionData({...discussionData, urgency: 'high'})}
                  >
                    <Text style={styles.urgencyIcon}>🟠</Text>
                    <Text style={[
                      styles.urgencyText,
                      discussionData.urgency === 'high' && styles.urgencyTextSelected
                    ]}>High</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.urgencyButton,
                      discussionData.urgency === 'urgent' && styles.urgencyButtonSelected
                    ]}
                    onPress={() => setDiscussionData({...discussionData, urgency: 'urgent'})}
                  >
                    <Text style={styles.urgencyIcon}>🔴</Text>
                    <Text style={[
                      styles.urgencyText,
                      discussionData.urgency === 'urgent' && styles.urgencyTextSelected
                    ]}>Urgent</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Case Details *</Text>
                <TextInput
                  style={[styles.formInput, styles.textArea]}
                  placeholder="Describe the patient case, symptoms, findings, and your specific question..."
                  value={discussionData.content}
                  onChangeText={(text) => setDiscussionData({...discussionData, content: text})}
                  multiline
                  numberOfLines={8}
                  textAlignVertical="top"
                />
              </View>

              {selectedChannel === 'radiology' && (
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Medical Images</Text>
                  <TouchableOpacity style={styles.uploadButton}>
                    <Text style={styles.uploadIcon}>📷</Text>
                    <Text style={styles.uploadText}>Upload Images</Text>
                    <Text style={styles.uploadSubtext}>X-Ray, CT, MRI, Ultrasound</Text>
                  </TouchableOpacity>
                </View>
              )}

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Additional Information</Text>
                <View style={styles.additionalInfoGrid}>
                  <TouchableOpacity style={styles.infoButton}>
                    <Text style={styles.infoIcon}>📊</Text>
                    <Text style={styles.infoText}>Lab Results</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.infoButton}>
                    <Text style={styles.infoIcon}>💊</Text>
                    <Text style={styles.infoText}>Medications</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.infoButton}>
                    <Text style={styles.infoIcon}>📋</Text>
                    <Text style={styles.infoText}>Vital Signs</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.infoButton}>
                    <Text style={styles.infoIcon}>🏥</Text>
                    <Text style={styles.infoText}>History</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.formActions}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => setShowDiscussionForm(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.submitButton}
                  onPress={handleSubmitDiscussion}
                >
                  <Text style={styles.submitButtonText}>Post Discussion</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {showClinicalForm && (
          <View>
            <TouchableOpacity style={styles.backButton} onPress={() => setShowClinicalForm(false)}>
              <Text style={styles.backText}>← Back to Clinical Q&A</Text>
            </TouchableOpacity>
            
            <View style={styles.headerSection}>
              <Text style={styles.sectionTitle}>Clinical Question & AI Analysis</Text>
              <Text style={styles.sectionSubtitle}>
                Submit your clinical case for AI-powered analysis and peer review
              </Text>
              <View style={[styles.identityStatus, isAnonymousMode && styles.identityStatusAnonymous]}>
                <Text style={styles.identityStatusText}>
                  Posting as: {getDisplayName()} {getDisplayAvatar()}
                </Text>
                <TouchableOpacity 
                  style={styles.identityToggle}
                  onPress={toggleAnonymousMode}
                >
                  <Text style={styles.identityToggleText}>
                    {isAnonymousMode ? 'Show Identity' : 'Hide Identity'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.clinicalForm}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Question Title *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Brief description of your clinical question"
                  value={clinicalData.title}
                  onChangeText={(text) => setClinicalData({...clinicalData, title: text})}
                  multiline
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Medical Specialty *</Text>
                <View style={styles.specialtyGrid}>
                  {getClinicalSpecialties().map((specialty, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.specialtyChip,
                        clinicalData.specialty === specialty.toLowerCase().replace(' ', '') && styles.specialtyChipSelected
                      ]}
                      onPress={() => setClinicalData({...clinicalData, specialty: specialty.toLowerCase().replace(' ', '')})}
                    >
                      <Text style={[
                        styles.specialtyChipText,
                        clinicalData.specialty === specialty.toLowerCase().replace(' ', '') && styles.specialtyChipTextSelected
                      ]}>
                        {specialty}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Urgency Level *</Text>
                <View style={styles.urgencyGrid}>
                  <TouchableOpacity
                    style={[
                      styles.urgencyButton,
                      clinicalData.urgency === 'low' && styles.urgencyButtonSelected
                    ]}
                    onPress={() => setClinicalData({...clinicalData, urgency: 'low'})}
                  >
                    <Text style={styles.urgencyIcon}>🟢</Text>
                    <Text style={[
                      styles.urgencyText,
                      clinicalData.urgency === 'low' && styles.urgencyTextSelected
                    ]}>Low</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.urgencyButton,
                      clinicalData.urgency === 'medium' && styles.urgencyButtonSelected
                    ]}
                    onPress={() => setClinicalData({...clinicalData, urgency: 'medium'})}
                  >
                    <Text style={styles.urgencyIcon}>🟡</Text>
                    <Text style={[
                      styles.urgencyText,
                      clinicalData.urgency === 'medium' && styles.urgencyTextSelected
                    ]}>Medium</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.urgencyButton,
                      clinicalData.urgency === 'high' && styles.urgencyButtonSelected
                    ]}
                    onPress={() => setClinicalData({...clinicalData, urgency: 'high'})}
                  >
                    <Text style={styles.urgencyIcon}>🟠</Text>
                    <Text style={[
                      styles.urgencyText,
                      clinicalData.urgency === 'high' && styles.urgencyTextSelected
                    ]}>High</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.urgencyButton,
                      clinicalData.urgency === 'urgent' && styles.urgencyButtonSelected
                    ]}
                    onPress={() => setClinicalData({...clinicalData, urgency: 'urgent'})}
                  >
                    <Text style={styles.urgencyIcon}>🔴</Text>
                    <Text style={[
                      styles.urgencyText,
                      clinicalData.urgency === 'urgent' && styles.urgencyTextSelected
                    ]}>Urgent</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.patientInfoSection}>
                <Text style={styles.sectionTitle}>Patient Information</Text>
                
                <View style={styles.patientInfoGrid}>
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Age</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="e.g., 45 years"
                      value={clinicalData.patientAge}
                      onChangeText={(text) => setClinicalData({...clinicalData, patientAge: text})}
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Gender</Text>
                    <View style={styles.genderGrid}>
                      <TouchableOpacity
                        style={[
                          styles.genderButton,
                          clinicalData.patientGender === 'male' && styles.genderButtonSelected
                        ]}
                        onPress={() => setClinicalData({...clinicalData, patientGender: 'male'})}
                      >
                        <Text style={[
                          styles.genderText,
                          clinicalData.patientGender === 'male' && styles.genderTextSelected
                        ]}>Male</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.genderButton,
                          clinicalData.patientGender === 'female' && styles.genderButtonSelected
                        ]}
                        onPress={() => setClinicalData({...clinicalData, patientGender: 'female'})}
                      >
                        <Text style={[
                          styles.genderText,
                          clinicalData.patientGender === 'female' && styles.genderTextSelected
                        ]}>Female</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.genderButton,
                          clinicalData.patientGender === 'other' && styles.genderButtonSelected
                        ]}
                        onPress={() => setClinicalData({...clinicalData, patientGender: 'other'})}
                      >
                        <Text style={[
                          styles.genderText,
                          clinicalData.patientGender === 'other' && styles.genderTextSelected
                        ]}>Other</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Presenting Symptoms *</Text>
                <View style={styles.symptomsGrid}>
                  {getCommonSymptoms().map((symptom, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.symptomChip,
                        clinicalData.symptoms.includes(symptom) && styles.symptomChipSelected
                      ]}
                      onPress={() => {
                        const newSymptoms = clinicalData.symptoms.includes(symptom)
                          ? clinicalData.symptoms.filter(s => s !== symptom)
                          : [...clinicalData.symptoms, symptom];
                        setClinicalData({...clinicalData, symptoms: newSymptoms});
                      }}
                    >
                      <Text style={[
                        styles.symptomChipText,
                        clinicalData.symptoms.includes(symptom) && styles.symptomChipTextSelected
                      ]}>
                        {symptom}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Clinical Question *</Text>
                <TextInput
                  style={[styles.formInput, styles.textArea]}
                  placeholder="Describe your specific clinical question, differential diagnosis concerns, or treatment considerations..."
                  value={clinicalData.question}
                  onChangeText={(text) => setClinicalData({...clinicalData, question: text})}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Medical Images</Text>
                <TouchableOpacity style={styles.uploadButton}>
                  <Text style={styles.uploadIcon}>📷</Text>
                  <Text style={styles.uploadText}>Upload Medical Images</Text>
                  <Text style={styles.uploadSubtext}>X-Ray, CT, MRI, Ultrasound, Lab Results</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.clinicalDataSection}>
                <Text style={styles.sectionTitle}>Additional Clinical Data</Text>
                
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Lab Values</Text>
                  <TextInput
                    style={[styles.formInput, styles.textArea]}
                    placeholder="Enter relevant laboratory results (e.g., CBC, CMP, troponins, etc.)"
                    value={clinicalData.labValues}
                    onChangeText={(text) => setClinicalData({...clinicalData, labValues: text})}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Vital Signs</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="e.g., BP 140/90, HR 85, Temp 98.6°F, RR 16, O2 Sat 98%"
                    value={clinicalData.vitalSigns}
                    onChangeText={(text) => setClinicalData({...clinicalData, vitalSigns: text})}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Current Medications</Text>
                  <TextInput
                    style={[styles.formInput, styles.textArea]}
                    placeholder="List current medications and dosages"
                    value={clinicalData.medications}
                    onChangeText={(text) => setClinicalData({...clinicalData, medications: text})}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Allergies</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="Known allergies and reactions"
                    value={clinicalData.allergies}
                    onChangeText={(text) => setClinicalData({...clinicalData, allergies: text})}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Family History</Text>
                  <TextInput
                    style={[styles.formInput, styles.textArea]}
                    placeholder="Relevant family medical history"
                    value={clinicalData.familyHistory}
                    onChangeText={(text) => setClinicalData({...clinicalData, familyHistory: text})}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Social History</Text>
                  <TextInput
                    style={[styles.formInput, styles.textArea]}
                    placeholder="Smoking, alcohol, occupation, travel history, etc."
                    value={clinicalData.socialHistory}
                    onChangeText={(text) => setClinicalData({...clinicalData, socialHistory: text})}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Physical Examination</Text>
                  <TextInput
                    style={[styles.formInput, styles.textArea]}
                    placeholder="Key physical examination findings"
                    value={clinicalData.physicalExam}
                    onChangeText={(text) => setClinicalData({...clinicalData, physicalExam: text})}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Comorbidities</Text>
                  <View style={styles.comorbiditiesGrid}>
                    {getCommonComorbidities().map((comorbidity, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.comorbidityChip,
                          clinicalData.comorbidities.includes(comorbidity) && styles.comorbidityChipSelected
                        ]}
                        onPress={() => {
                          const newComorbidities = clinicalData.comorbidities.includes(comorbidity)
                            ? clinicalData.comorbidities.filter(c => c !== comorbidity)
                            : [...clinicalData.comorbidities, comorbidity];
                          setClinicalData({...clinicalData, comorbidities: newComorbidities});
                        }}
                      >
                        <Text style={[
                          styles.comorbidityChipText,
                          clinicalData.comorbidities.includes(comorbidity) && styles.comorbidityChipTextSelected
                        ]}>
                          {comorbidity}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              <View style={styles.aiAnalysisSection}>
                <View style={styles.aiInfoCard}>
                  <Text style={styles.aiInfoTitle}>🤖 AI Analysis Features</Text>
                  <Text style={styles.aiInfoText}>Your question will be analyzed by our AI system to provide:</Text>
                  <Text style={styles.aiInfoItem}>• Differential diagnosis suggestions</Text>
                  <Text style={styles.aiInfoItem}>• Treatment recommendations</Text>
                  <Text style={styles.aiInfoItem}>• Risk stratification</Text>
                  <Text style={styles.aiInfoItem}>• Evidence-based guidelines</Text>
                  <Text style={styles.aiInfoItem}>• Peer review and expert opinions</Text>
                </View>
              </View>

              <View style={styles.formActions}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => setShowClinicalForm(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.submitButton}
                  onPress={handleSubmitClinicalQuestion}
                >
                  <Text style={styles.submitButtonText}>Submit for AI Analysis</Text>
                </TouchableOpacity>
              </View>
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
  // Login Screen Styles
  loginContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loginContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
    minHeight: '100%',
  },
  loginHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  loginForm: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  loginLinks: {
    alignItems: 'center',
    marginTop: 20,
  },
  demoSection: {
    alignItems: 'center',
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E1E5E9',
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
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6C757D',
    marginBottom: 0,
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
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    minHeight: 52,
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 20,
    minHeight: 52,
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
    lineHeight: 20,
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
  discussionForm: {
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
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#E1E5E9',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1A1A1A',
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E1E5E9',
  },
  categoryChipSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#6C757D',
    fontWeight: '500',
  },
  categoryChipTextSelected: {
    color: '#FFFFFF',
  },
  urgencyGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  urgencyButton: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E1E5E9',
    backgroundColor: '#FFFFFF',
  },
  urgencyButtonSelected: {
    backgroundColor: '#E3F2FD',
    borderColor: '#007AFF',
  },
  urgencyIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  urgencyText: {
    fontSize: 12,
    color: '#6C757D',
    fontWeight: '500',
  },
  urgencyTextSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
  uploadButton: {
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#F8F9FF',
  },
  uploadIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  uploadText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 4,
  },
  uploadSubtext: {
    fontSize: 12,
    color: '#6C757D',
  },
  additionalInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  infoButton: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E1E5E9',
    backgroundColor: '#FFFFFF',
  },
  infoIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#6C757D',
    fontWeight: '500',
    textAlign: 'center',
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E1E5E9',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#6C757D',
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    padding: 16,
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  clinicalForm: {
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
  specialtyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  specialtyChip: {
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E1E5E9',
  },
  specialtyChipSelected: {
    backgroundColor: '#34C759',
    borderColor: '#34C759',
  },
  specialtyChipText: {
    fontSize: 14,
    color: '#6C757D',
    fontWeight: '500',
  },
  specialtyChipTextSelected: {
    color: '#FFFFFF',
  },
  patientInfoSection: {
    backgroundColor: '#F8F9FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  patientInfoGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  genderGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  genderButton: {
    flex: 1,
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E1E5E9',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  genderButtonSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  genderText: {
    fontSize: 12,
    color: '#6C757D',
    fontWeight: '500',
  },
  genderTextSelected: {
    color: '#FFFFFF',
  },
  symptomsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  symptomChip: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E1E5E9',
  },
  symptomChipSelected: {
    backgroundColor: '#FF9500',
    borderColor: '#FF9500',
  },
  symptomChipText: {
    fontSize: 12,
    color: '#6C757D',
    fontWeight: '500',
  },
  symptomChipTextSelected: {
    color: '#FFFFFF',
  },
  clinicalDataSection: {
    backgroundColor: '#F0F8FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  comorbiditiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  comorbidityChip: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E1E5E9',
  },
  comorbidityChipSelected: {
    backgroundColor: '#8E44AD',
    borderColor: '#8E44AD',
  },
  comorbidityChipText: {
    fontSize: 12,
    color: '#6C757D',
    fontWeight: '500',
  },
  comorbidityChipTextSelected: {
    color: '#FFFFFF',
  },
  aiAnalysisSection: {
    marginBottom: 20,
  },
  aiInfoCard: {
    backgroundColor: '#E8F5E8',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#34C759',
  },
  aiInfoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D5016',
    marginBottom: 8,
  },
  aiInfoText: {
    fontSize: 14,
    color: '#2D5016',
    marginBottom: 8,
  },
  aiInfoItem: {
    fontSize: 14,
    color: '#2D5016',
    marginBottom: 4,
    marginLeft: 8,
  },
  channelItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  channelActions: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  joinButton: {
    backgroundColor: '#34C759',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  leaveButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  leaveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  startDiscussionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  startDiscussionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  joinedBadge: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
    flex: 1,
  },
  joinedBadgeText: {
    color: '#34C759',
    fontSize: 12,
    fontWeight: '600',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  anonymousToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E1E5E9',
  },
  anonymousToggleActive: {
    backgroundColor: '#FFE5E5',
    borderColor: '#FF3B30',
  },
  anonymousIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  anonymousText: {
    fontSize: 12,
    color: '#6C757D',
    fontWeight: '500',
  },
  anonymousTextActive: {
    color: '#FF3B30',
  },
  identityStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#34C759',
  },
  identityStatusAnonymous: {
    borderLeftColor: '#FF3B30',
  },
  identityStatusText: {
    fontSize: 14,
    color: '#495057',
    fontWeight: '500',
  },
  identityToggle: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  identityToggleText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  // Registration Form Styles
  registrationHeader: {
    padding: 20,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E5E9',
  },
  registrationSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E5E9',
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  halfInput: {
    flex: 1,
    marginRight: 10,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 8,
  },
  checkboxContainer: {
    marginTop: 10,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  checkboxText: {
    fontSize: 14,
    color: '#495057',
    marginLeft: 8,
  },
  registrationFooter: {
    padding: 20,
    backgroundColor: '#F8F9FA',
  },
  registerButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  registrationNote: {
    fontSize: 12,
    color: '#6C757D',
    textAlign: 'center',
    lineHeight: 18,
  },
  registerLink: {
    marginBottom: 12,
    alignItems: 'center',
    paddingVertical: 8,
  },
  registerLinkText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
  // Forgot Password Styles
  forgotPasswordHeader: {
    padding: 20,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E5E9',
  },
  forgotPasswordContent: {
    flex: 1,
    padding: 20,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  stepActive: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepInactive: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E1E5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCompleted: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#34C759',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumber: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  stepNumberInactive: {
    color: '#6C757D',
    fontSize: 16,
    fontWeight: '600',
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: '#E1E5E9',
    marginHorizontal: 10,
  },
  stepLineCompleted: {
    width: 40,
    height: 2,
    backgroundColor: '#34C759',
    marginHorizontal: 10,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 10,
  },
  stepDescription: {
    fontSize: 16,
    color: '#6C757D',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  formGroup: {
    marginBottom: 20,
  },
  otpInput: {
    borderWidth: 2,
    borderColor: '#E1E5E9',
    borderRadius: 12,
    padding: 15,
    fontSize: 24,
    fontWeight: '600',
    letterSpacing: 8,
    backgroundColor: '#FFFFFF',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  resendButton: {
    alignItems: 'center',
    marginBottom: 20,
  },
  resendButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  passwordRequirements: {
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  passwordRequirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 8,
  },
  passwordRequirement: {
    fontSize: 13,
    color: '#6C757D',
    marginBottom: 4,
  },
  securityNote: {
    backgroundColor: '#E3F2FD',
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  securityNoteText: {
    fontSize: 13,
    color: '#1976D2',
    lineHeight: 18,
  },
  forgotPasswordLink: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  forgotPasswordLinkText: {
    color: '#6C757D',
    fontSize: 14,
    fontWeight: '400',
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
