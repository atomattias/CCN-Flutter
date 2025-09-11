import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { CustomButton } from '../../src/components/CustomButton';
import { CustomInput } from '../../src/components/CustomInput';

interface RegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'CLINICIAN' | 'ADMIN';
}

export default function RegisterScreen() {
  const [formData, setFormData] = useState<RegistrationData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'CLINICIAN',
  });
  const [errors, setErrors] = useState<Partial<RegistrationData>>({});
  
  const { signUp, isLoading } = useAuth();

  const validateForm = () => {
    const newErrors: Partial<RegistrationData> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      };

      await signUp(userData);
      // Navigation will be handled automatically by the auth context
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'An error occurred during registration');
    }
  };

  const handleBackToLogin = () => {
    router.back();
  };

  const updateFormData = (field: keyof RegistrationData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBackToLogin}
          >
            <Text style={styles.backButtonText}>← Back to Login</Text>
          </TouchableOpacity>
          
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join the Clinical Communication Network</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.nameRow}>
            <View style={styles.nameField}>
              <CustomInput
                label="First Name"
                placeholder="Enter first name"
                value={formData.firstName}
                onChangeText={(value) => updateFormData('firstName', value)}
                error={errors.firstName}
              />
            </View>
            <View style={styles.nameField}>
              <CustomInput
                label="Last Name"
                placeholder="Enter last name"
                value={formData.lastName}
                onChangeText={(value) => updateFormData('lastName', value)}
                error={errors.lastName}
              />
            </View>
          </View>

          <CustomInput
            label="Email"
            placeholder="Enter your email"
            value={formData.email}
            onChangeText={(value) => updateFormData('email', value)}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            error={errors.email}
          />

          <CustomInput
            label="Password"
            placeholder="Enter your password"
            value={formData.password}
            onChangeText={(value) => updateFormData('password', value)}
            secureTextEntry
            error={errors.password}
          />

          <CustomInput
            label="Confirm Password"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChangeText={(value) => updateFormData('confirmPassword', value)}
            secureTextEntry
            error={errors.confirmPassword}
          />

          <CustomButton
            title="Create Account"
            onPress={handleRegister}
            loading={isLoading}
            style={styles.registerButton}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Already have an account?{' '}
            </Text>
            <TouchableOpacity onPress={handleBackToLogin}>
              <Text style={styles.linkText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Account Verification</Text>
          <Text style={styles.infoText}>
            After registration, you'll receive an email with verification instructions. 
            Medical verification may be required for full access to clinical features.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  form: {
    marginBottom: 30,
  },
  nameRow: {
    flexDirection: 'row',
    gap: 12,
  },
  nameField: {
    flex: 1,
  },
  registerButton: {
    marginTop: 24,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    color: '#666666',
  },
  linkText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: '#FFF3E0',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F57C00',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#F57C00',
    lineHeight: 18,
  },
});

