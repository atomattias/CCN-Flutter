import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../src/contexts/AuthContext';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  console.log('Index: Authentication state:', { isAuthenticated, isLoading });

  useEffect(() => {
    if (!isLoading) {
      // Add a small delay to ensure state is fully updated
      const timer = setTimeout(() => {
        if (isAuthenticated) {
          console.log('Index: User is authenticated, navigating to tabs');
          router.push('/(tabs)');
        } else {
          console.log('Index: User is not authenticated, navigating to login');
          router.push('/(auth)/login');
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading screen while checking authentication
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={styles.loadingText}>Loading...</Text>
      <Text style={styles.subtitle}>Checking authentication status</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 20,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007AFF',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
});

