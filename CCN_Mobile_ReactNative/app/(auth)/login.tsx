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

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  
  const { login, isLoading } = useAuth();

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    console.log('Login button pressed');
    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }

    console.log('Attempting login with:', { email, password: '***' });
    try {
      await login({ email, password });
      console.log('Login successful');
      // Navigation will be handled automatically by the auth context
    } catch (error: any) {
      console.log('Login error:', error);
      Alert.alert('Login Failed', error.message || 'An error occurred during login');
    }
  };

  const handleDemoLogin = () => {
    setEmail('demo@ccn.com');
    setPassword('demo123456');
  };

  const handleSignUp = () => {
    router.push('/(auth)/register');
  };

  const handleForgotPassword = () => {
    router.push('/(auth)/forgot-password');
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
          <Text style={styles.title}>Welcome to CCN</Text>
          <Text style={styles.subtitle}>Clinical Communication Network</Text>
        </View>

        <View style={styles.form}>
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

          <CustomInput
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            error={errors.password}
          />

          <CustomButton
            title="Sign In"
            onPress={handleLogin}
            loading={isLoading}
            style={styles.loginButton}
          />

          <CustomButton
            title="Try Demo Login"
            onPress={handleDemoLogin}
            variant="outline"
            style={styles.demoButton}
          />

          <TouchableOpacity 
            style={styles.forgotPasswordButton}
            onPress={handleForgotPassword}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Don't have an account?{' '}
            </Text>
            <TouchableOpacity onPress={handleSignUp}>
              <Text style={styles.linkText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.demoInfo}>
          <Text style={styles.demoText}>Demo Credentials:</Text>
          <Text style={styles.demoCredential}>Email: demo@ccn.com</Text>
          <Text style={styles.demoCredential}>Password: demo123456</Text>
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
    alignItems: 'center',
    marginBottom: 40,
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
  loginButton: {
    marginTop: 24,
  },
  demoButton: {
    marginTop: 12,
  },
  forgotPasswordButton: {
    alignSelf: 'center',
    marginTop: 16,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#007AFF',
    textAlign: 'center',
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
  demoInfo: {
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  demoText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: 8,
  },
  demoCredential: {
    fontSize: 13,
    color: '#1976D2',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});

