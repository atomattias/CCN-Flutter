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
import { CustomButton } from '../../src/components/CustomButton';
import { CustomInput } from '../../src/components/CustomInput';
import authService from '../../src/services/authService';

type ForgotPasswordStep = 'email' | 'otp' | 'new-password';

export default function ForgotPasswordScreen() {
  const [step, setStep] = useState<ForgotPasswordStep>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateEmail = () => {
    if (!email.trim()) {
      setErrors({ email: 'Email is required' });
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setErrors({ email: 'Email is invalid' });
      return false;
    }
    setErrors({});
    return true;
  };

  const validateOtp = () => {
    if (!otp.trim()) {
      setErrors({ otp: 'OTP is required' });
      return false;
    } else if (otp.length !== 6) {
      setErrors({ otp: 'OTP must be 6 digits' });
      return false;
    }
    setErrors({});
    return true;
  };

  const validatePasswords = () => {
    const newErrors: Record<string, string> = {};

    if (!newPassword.trim()) {
      newErrors.newPassword = 'Password is required';
    } else if (newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }

    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOtp = async () => {
    if (!validateEmail()) return;

    try {
      setIsLoading(true);
      await authService.sendOTP(email);
      setStep('otp');
      Alert.alert('OTP Sent', 'Please check your email for the verification code.');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!validateOtp()) return;

    try {
      setIsLoading(true);
      // For now, just move to next step
      // In a real app, you'd verify the OTP here
      setStep('new-password');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Invalid OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!validatePasswords()) return;

    try {
      setIsLoading(true);
      await authService.resetPassword(email, otp, newPassword);
      Alert.alert(
        'Success',
        'Your password has been reset successfully.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(auth)/login'),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.back();
  };

  const renderEmailStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Reset Password</Text>
      <Text style={styles.stepDescription}>
        Enter your email address and we'll send you a verification code.
      </Text>

      <CustomInput
        label="Email"
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        error={errors.email}
      />

      <CustomButton
        title="Send Verification Code"
        onPress={handleSendOtp}
        loading={isLoading}
        style={styles.primaryButton}
      />
    </View>
  );

  const renderOtpStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Enter Verification Code</Text>
      <Text style={styles.stepDescription}>
        We've sent a 6-digit code to {email}
      </Text>

      <CustomInput
        label="Verification Code"
        placeholder="Enter 6-digit code"
        value={otp}
        onChangeText={setOtp}
        keyboardType="numeric"
        maxLength={6}
        error={errors.otp}
      />

      <CustomButton
        title="Verify Code"
        onPress={handleVerifyOtp}
        loading={isLoading}
        style={styles.primaryButton}
      />

      <TouchableOpacity 
        style={styles.resendButton}
        onPress={handleSendOtp}
      >
        <Text style={styles.resendText}>Resend Code</Text>
      </TouchableOpacity>
    </View>
  );

  const renderNewPasswordStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Create New Password</Text>
      <Text style={styles.stepDescription}>
        Enter your new password below.
      </Text>

      <CustomInput
        label="New Password"
        placeholder="Enter new password"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
        error={errors.newPassword}
      />

      <CustomInput
        label="Confirm Password"
        placeholder="Confirm new password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        error={errors.confirmPassword}
      />

      <CustomButton
        title="Reset Password"
        onPress={handleResetPassword}
        loading={isLoading}
        style={styles.primaryButton}
      />
    </View>
  );

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
        </View>

        {step === 'email' && renderEmailStep()}
        {step === 'otp' && renderOtpStep()}
        {step === 'new-password' && renderNewPasswordStep()}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Remember your password?{' '}
          </Text>
          <TouchableOpacity onPress={handleBackToLogin}>
            <Text style={styles.linkText}>Sign In</Text>
          </TouchableOpacity>
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
    justifyContent: 'center',
  },
  header: {
    marginBottom: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  stepContainer: {
    marginBottom: 30,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  primaryButton: {
    marginTop: 20,
  },
  resendButton: {
    alignSelf: 'center',
    marginTop: 16,
  },
  resendText: {
    fontSize: 14,
    color: '#007AFF',
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
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
});

