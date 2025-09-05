import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import { Alert } from 'react-native';

export interface PINConfig {
  enabled: boolean;
  pin: string;
  maxAttempts: number;
  lockoutDuration: number; // in minutes
  biometricEnabled: boolean;
}

class PINAuthService {
  private readonly PIN_KEY = 'ccn_pin_config';
  private readonly PIN_ATTEMPTS_KEY = 'ccn_pin_attempts';
  private readonly PIN_LOCKOUT_KEY = 'ccn_pin_lockout';
  private readonly DEFAULT_MAX_ATTEMPTS = 5;
  private readonly DEFAULT_LOCKOUT_DURATION = 15; // 15 minutes

  // Check if device supports biometric authentication
  async isBiometricSupported(): Promise<boolean> {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      return hasHardware && isEnrolled;
    } catch (error) {
      console.error('Biometric check failed:', error);
      return false;
    }
  }

  // Get available biometric types
  async getBiometricTypes(): Promise<LocalAuthentication.AuthenticationType[]> {
    try {
      return await LocalAuthentication.supportedAuthenticationTypesAsync();
    } catch (error) {
      console.error('Failed to get biometric types:', error);
      return [];
    }
  }

  // Setup PIN authentication
  async setupPIN(pin: string, enableBiometric: boolean = false): Promise<boolean> {
    try {
      if (pin.length < 4) {
        throw new Error('PIN must be at least 4 digits');
      }

      if (pin.length > 8) {
        throw new Error('PIN must not exceed 8 digits');
      }

      // Check if biometric is available if requested
      if (enableBiometric) {
        const biometricSupported = await this.isBiometricSupported();
        if (!biometricSupported) {
          throw new Error('Biometric authentication not supported on this device');
        }
      }

      const config: PINConfig = {
        enabled: true,
        pin: await this.hashPIN(pin),
        maxAttempts: this.DEFAULT_MAX_ATTEMPTS,
        lockoutDuration: this.DEFAULT_LOCKOUT_DURATION,
        biometricEnabled: enableBiometric,
      };

      await AsyncStorage.setItem(this.PIN_KEY, JSON.stringify(config));
      await this.resetAttempts();
      
      return true;
    } catch (error) {
      console.error('PIN setup failed:', error);
      throw error;
    }
  }

  // Validate PIN
  async validatePIN(pin: string): Promise<boolean> {
    try {
      // Check if PIN is locked out
      if (await this.isLockedOut()) {
        throw new Error('PIN is locked out. Please try again later.');
      }

      const config = await this.getPINConfig();
      if (!config || !config.enabled) {
        return true; // No PIN required
      }

      const hashedInput = await this.hashPIN(pin);
      const isValid = hashedInput === config.pin;

      if (isValid) {
        await this.resetAttempts();
        return true;
      } else {
        await this.incrementAttempts();
        return false;
      }
    } catch (error) {
      console.error('PIN validation failed:', error);
      throw error;
    }
  }

  // Authenticate with biometric
  async authenticateWithBiometric(): Promise<boolean> {
    try {
      const config = await this.getPINConfig();
      if (!config || !config.biometricEnabled) {
        throw new Error('Biometric authentication not enabled');
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to access CCN',
        fallbackLabel: 'Use PIN',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });

      if (result.success) {
        await this.resetAttempts();
        return true;
      }

      return false;
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      return false;
    }
  }

  // Change PIN
  async changePIN(currentPIN: string, newPIN: string): Promise<boolean> {
    try {
      // Validate current PIN first
      const isValid = await this.validatePIN(currentPIN);
      if (!isValid) {
        throw new Error('Current PIN is incorrect');
      }

      // Setup new PIN
      const config = await this.getPINConfig();
      if (config) {
        return await this.setupPIN(newPIN, config.biometricEnabled);
      }

      return await this.setupPIN(newPIN, false);
    } catch (error) {
      console.error('PIN change failed:', error);
      throw error;
    }
  }

  // Disable PIN authentication
  async disablePIN(): Promise<boolean> {
    try {
      const config = await this.getPINConfig();
      if (config) {
        config.enabled = false;
        await AsyncStorage.setItem(this.PIN_KEY, JSON.stringify(config));
      }
      return true;
    } catch (error) {
      console.error('PIN disable failed:', error);
      return false;
    }
  }

  // Toggle biometric authentication
  async toggleBiometric(enable: boolean): Promise<boolean> {
    try {
      if (enable) {
        const biometricSupported = await this.isBiometricSupported();
        if (!biometricSupported) {
          throw new Error('Biometric authentication not supported');
        }
      }

      const config = await this.getPINConfig();
      if (config) {
        config.biometricEnabled = enable;
        await AsyncStorage.setItem(this.PIN_KEY, JSON.stringify(config));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Biometric toggle failed:', error);
      throw error;
    }
  }

  // Get PIN configuration
  async getPINConfig(): Promise<PINConfig | null> {
    try {
      const configString = await AsyncStorage.getItem(this.PIN_KEY);
      return configString ? JSON.parse(configString) : null;
    } catch (error) {
      console.error('Failed to get PIN config:', error);
      return null;
    }
  }

  // Check if PIN is required
  async isPINRequired(): Promise<boolean> {
    const config = await this.getPINConfig();
    return config?.enabled || false;
  }

  // Check if PIN is locked out
  private async isLockedOut(): Promise<boolean> {
    try {
      const lockoutTime = await AsyncStorage.getItem(this.PIN_LOCKOUT_KEY);
      if (!lockoutTime) return false;

      const lockoutTimestamp = parseInt(lockoutTime);
      const now = Date.now();
      const lockoutDuration = (await this.getPINConfig())?.lockoutDuration || this.DEFAULT_LOCKOUT_DURATION;
      
      // Check if lockout period has expired
      if (now - lockoutTimestamp > lockoutDuration * 60 * 1000) {
        await this.resetAttempts();
        return false;
      }

      return true;
    } catch (error) {
      console.error('Lockout check failed:', error);
      return false;
    }
  }

  // Increment failed attempts
  private async incrementAttempts(): Promise<void> {
    try {
      const attempts = await this.getAttempts();
      const newAttempts = attempts + 1;
      
      await AsyncStorage.setItem(this.PIN_ATTEMPTS_KEY, newAttempts.toString());
      
      const config = await this.getPINConfig();
      if (newAttempts >= (config?.maxAttempts || this.DEFAULT_MAX_ATTEMPTS)) {
        // Lock out the PIN
        await AsyncStorage.setItem(this.PIN_LOCKOUT_KEY, Date.now().toString());
      }
    } catch (error) {
      console.error('Failed to increment attempts:', error);
    }
  }

  // Reset failed attempts
  private async resetAttempts(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.PIN_ATTEMPTS_KEY);
      await AsyncStorage.removeItem(this.PIN_LOCKOUT_KEY);
    } catch (error) {
      console.error('Failed to reset attempts:', error);
    }
  }

  // Get current failed attempts
  private async getAttempts(): Promise<number> {
    try {
      const attempts = await AsyncStorage.getItem(this.PIN_ATTEMPTS_KEY);
      return attempts ? parseInt(attempts) : 0;
    } catch (error) {
      console.error('Failed to get attempts:', error);
      return 0;
    }
  }

  // Hash PIN for secure storage (simple implementation - in production use proper crypto)
  private async hashPIN(pin: string): Promise<string> {
    // This is a simple hash for demo purposes
    // In production, use proper cryptographic hashing (bcrypt, argon2, etc.)
    const encoder = new TextEncoder();
    const data = encoder.encode(pin + 'ccn_salt_2024');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Get remaining attempts before lockout
  async getRemainingAttempts(): Promise<number> {
    try {
      const config = await this.getPINConfig();
      const currentAttempts = await this.getAttempts();
      const maxAttempts = config?.maxAttempts || this.DEFAULT_MAX_ATTEMPTS;
      return Math.max(0, maxAttempts - currentAttempts);
    } catch (error) {
      console.error('Failed to get remaining attempts:', error);
      return 0;
    }
  }

  // Get lockout time remaining
  async getLockoutTimeRemaining(): Promise<number> {
    try {
      const lockoutTime = await AsyncStorage.getItem(this.PIN_LOCKOUT_KEY);
      if (!lockoutTime) return 0;

      const lockoutTimestamp = parseInt(lockoutTime);
      const now = Date.now();
      const lockoutDuration = (await this.getPINConfig())?.lockoutDuration || this.DEFAULT_LOCKOUT_DURATION;
      
      const remaining = lockoutDuration * 60 * 1000 - (now - lockoutTimestamp);
      return Math.max(0, Math.ceil(remaining / 1000)); // Return seconds
    } catch (error) {
      console.error('Failed to get lockout time remaining:', error);
      return 0;
    }
  }
}

export const pinAuthService = new PINAuthService();
export default pinAuthService;



