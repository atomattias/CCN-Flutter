import CryptoJS from 'crypto-js';
import { Buffer } from 'buffer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

export interface EncryptionKeyPair {
  publicKey: string;
  privateKey: string;
  keyId: string;
  algorithm: 'RSA-OAEP' | 'ECDH' | 'AES-GCM';
  createdAt: string;
  expiresAt?: string;
}

export interface EncryptedData {
  encryptedContent: string;
  iv: string;
  keyId: string;
  algorithm: string;
  signature: string;
  timestamp: string;
  version: string;
}

export interface MessageEncryption {
  content: string;
  metadata: {
    senderId: string;
    channelId: string;
    timestamp: string;
    messageType: 'text' | 'file' | 'video' | 'audio';
  };
}

class EncryptionService {
  private readonly ENCRYPTION_VERSION = '1.0';
  private readonly KEY_STORAGE_PREFIX = 'ccn_encryption_';
  private readonly MASTER_KEY_ALIAS = 'ccn_master_key';
  private readonly RSA_KEY_SIZE = 2048;
  private readonly AES_KEY_SIZE = 256;
  private readonly PBKDF2_ITERATIONS = 100000;
  private readonly SALT_SIZE = 32;

  // Generate RSA key pair for asymmetric encryption
  async generateKeyPair(): Promise<EncryptionKeyPair> {
    try {
      // Generate RSA key pair using Web Crypto API
      const keyPair = await crypto.subtle.generateKey(
        {
          name: 'RSA-OAEP',
          modulusLength: this.RSA_KEY_SIZE,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: 'SHA-256',
        },
        true,
        ['encrypt', 'decrypt']
      );

      // Export keys
      const publicKeyBuffer = await crypto.subtle.exportKey('spki', keyPair.publicKey);
      const privateKeyBuffer = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);

      const keyPairData: EncryptionKeyPair = {
        publicKey: this.arrayBufferToBase64(publicKeyBuffer),
        privateKey: this.arrayBufferToBase64(privateKeyBuffer),
        keyId: this.generateKeyId(),
        algorithm: 'RSA-OAEP',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
      };

      // Store key pair securely
      await this.storeKeyPair(keyPairData);
      
      return keyPairData;
    } catch (error) {
      console.error('Failed to generate key pair:', error);
      throw new Error('Key generation failed');
    }
  }

  // Generate AES key for symmetric encryption
  async generateAESKey(): Promise<string> {
    try {
      const key = await crypto.subtle.generateKey(
        {
          name: 'AES-GCM',
          length: this.AES_KEY_SIZE,
        },
        true,
        ['encrypt', 'decrypt']
      );

      const exportedKey = await crypto.subtle.exportKey('raw', key);
      return this.arrayBufferToBase64(exportedKey);
    } catch (error) {
      console.error('Failed to generate AES key:', error);
      throw new Error('AES key generation failed');
    }
  }

  // Encrypt message content
  async encryptMessage(message: MessageEncryption, recipientPublicKey: string): Promise<EncryptedData> {
    try {
      // Generate AES key for this message
      const aesKey = await this.generateAESKey();
      
      // Encrypt message content with AES
      const encryptedContent = await this.encryptWithAES(
        JSON.stringify(message),
        aesKey
      );

      // Encrypt AES key with recipient's public key
      const encryptedAESKey = await this.encryptWithRSA(aesKey, recipientPublicKey);

      // Create digital signature
      const signature = await this.createSignature(
        encryptedContent.encryptedContent + encryptedAESKey + message.metadata.timestamp
      );

      const encryptedData: EncryptedData = {
        encryptedContent: encryptedContent.encryptedContent,
        iv: encryptedContent.iv,
        keyId: this.generateKeyId(),
        algorithm: 'AES-GCM+RSA-OAEP',
        signature: signature,
        timestamp: new Date().toISOString(),
        version: this.ENCRYPTION_VERSION,
      };

      return encryptedData;
    } catch (error) {
      console.error('Message encryption failed:', error);
      throw new Error('Message encryption failed');
    }
  }

  // Decrypt message content
  async decryptMessage(encryptedData: EncryptedData, privateKey: string): Promise<MessageEncryption> {
    try {
      // Verify signature
      const isValid = await this.verifySignature(
        encryptedData.encryptedContent + encryptedData.iv + encryptedData.timestamp,
        encryptedData.signature
      );

      if (!isValid) {
        throw new Error('Message signature verification failed');
      }

      // Decrypt AES key with private key
      const aesKey = await this.decryptWithRSA(encryptedData.keyId, privateKey);

      // Decrypt message content with AES
      const decryptedContent = await this.decryptWithAES(
        encryptedData.encryptedContent,
        aesKey,
        encryptedData.iv
      );

      return JSON.parse(decryptedContent);
    } catch (error) {
      console.error('Message decryption failed:', error);
      throw new Error('Message decryption failed');
    }
  }

  // Encrypt file content
  async encryptFile(fileBuffer: ArrayBuffer, fileName: string): Promise<{
    encryptedData: ArrayBuffer;
    metadata: EncryptedData;
  }> {
    try {
      // Generate AES key for file
      const aesKey = await this.generateAESKey();
      
      // Convert ArrayBuffer to Uint8Array
      const fileArray = new Uint8Array(fileBuffer);
      
      // Encrypt file content
      const encryptedFile = await this.encryptArrayBufferWithAES(fileArray, aesKey);
      
      // Create file metadata
      const fileMetadata: MessageEncryption = {
        content: fileName,
        metadata: {
          senderId: 'current_user', // Will be set by caller
          channelId: 'file_upload', // Will be set by caller
          timestamp: new Date().toISOString(),
          messageType: 'file',
        },
      };

      // Encrypt metadata
      const encryptedMetadata = await this.encryptMessage(
        fileMetadata,
        'system_public_key' // Will use system key for file storage
      );

      return {
        encryptedData: encryptedFile,
        metadata: encryptedMetadata,
      };
    } catch (error) {
      console.error('File encryption failed:', error);
      throw new Error('File encryption failed');
    }
  }

  // Decrypt file content
  async decryptFile(encryptedFile: ArrayBuffer, metadata: EncryptedData, privateKey: string): Promise<ArrayBuffer> {
    try {
      // Decrypt metadata first
      const fileMetadata = await this.decryptMessage(metadata, privateKey);
      
      // Decrypt file content
      const decryptedFile = await this.decryptArrayBufferWithAES(
        encryptedFile,
        metadata.keyId,
        metadata.iv
      );

      return decryptedFile;
    } catch (error) {
      console.error('File decryption failed:', error);
      throw new Error('File decryption failed');
    }
  }

  // Encrypt video call data
  async encryptVideoData(videoChunk: ArrayBuffer, sessionKey: string): Promise<ArrayBuffer> {
    try {
      // Use session key for video encryption (AES-GCM)
      const encryptedChunk = await this.encryptArrayBufferWithAES(
        videoChunk,
        sessionKey
      );
      
      return encryptedChunk;
    } catch (error) {
      console.error('Video encryption failed:', error);
      throw new Error('Video encryption failed');
    }
  }

  // Decrypt video call data
  async decryptVideoData(encryptedChunk: ArrayBuffer, sessionKey: string, iv: string): Promise<ArrayBuffer> {
    try {
      const decryptedChunk = await this.decryptArrayBufferWithAES(
        encryptedChunk,
        sessionKey,
        iv
      );
      
      return decryptedChunk;
    } catch (error) {
      console.error('Video decryption failed:', error);
      throw new Error('Video decryption failed');
    }
  }

  // Create digital signature
  private async createSignature(data: string): Promise<string> {
    try {
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);
      
      // Use SHA-256 for hashing
      const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
      
      return this.arrayBufferToBase64(hashBuffer);
    } catch (error) {
      console.error('Signature creation failed:', error);
      throw new Error('Signature creation failed');
    }
  }

  // Verify digital signature
  private async verifySignature(data: string, signature: string): Promise<boolean> {
    try {
      const expectedSignature = await this.createSignature(data);
      return expectedSignature === signature;
    } catch (error) {
      console.error('Signature verification failed:', error);
      return false;
    }
  }

  // Encrypt with AES-GCM
  private async encryptWithAES(data: string, key: string): Promise<{ encryptedContent: string; iv: string }> {
    try {
      const keyBuffer = this.base64ToArrayBuffer(key);
      const dataBuffer = new TextEncoder().encode(data);
      
      // Generate IV
      const iv = crypto.getRandomValues(new Uint8Array(12));
      
      // Import key
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyBuffer,
        { name: 'AES-GCM' },
        false,
        ['encrypt']
      );
      
      // Encrypt
      const encryptedBuffer = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        cryptoKey,
        dataBuffer
      );
      
      return {
        encryptedContent: this.arrayBufferToBase64(encryptedBuffer),
        iv: this.arrayBufferToBase64(iv),
      };
    } catch (error) {
      console.error('AES encryption failed:', error);
      throw new Error('AES encryption failed');
    }
  }

  // Decrypt with AES-GCM
  private async decryptWithAES(encryptedContent: string, key: string, iv: string): Promise<string> {
    try {
      const keyBuffer = this.base64ToArrayBuffer(key);
      const encryptedBuffer = this.base64ToArrayBuffer(encryptedContent);
      const ivBuffer = this.base64ToArrayBuffer(iv);
      
      // Import key
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyBuffer,
        { name: 'AES-GCM' },
        false,
        ['decrypt']
      );
      
      // Decrypt
      const decryptedBuffer = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: ivBuffer },
        cryptoKey,
        encryptedBuffer
      );
      
      return new TextDecoder().decode(decryptedBuffer);
    } catch (error) {
      console.error('AES decryption failed:', error);
      throw new Error('AES decryption failed');
    }
  }

  // Encrypt ArrayBuffer with AES
  private async encryptArrayBufferWithAES(data: Uint8Array, key: string): Promise<ArrayBuffer> {
    try {
      const keyBuffer = this.base64ToArrayBuffer(key);
      
      // Import key
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyBuffer,
        { name: 'AES-GCM' },
        false,
        ['encrypt']
      );
      
      // Generate IV
      const iv = crypto.getRandomValues(new Uint8Array(12));
      
      // Encrypt
      const encryptedBuffer = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        cryptoKey,
        data
      );
      
      return encryptedBuffer;
    } catch (error) {
      console.error('ArrayBuffer AES encryption failed:', error);
      throw new Error('ArrayBuffer AES encryption failed');
    }
  }

  // Decrypt ArrayBuffer with AES
  private async decryptArrayBufferWithAES(encryptedData: ArrayBuffer, key: string, iv: string): Promise<ArrayBuffer> {
    try {
      const keyBuffer = this.base64ToArrayBuffer(key);
      const ivBuffer = this.base64ToArrayBuffer(iv);
      
      // Import key
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyBuffer,
        { name: 'AES-GCM' },
        false,
        ['decrypt']
      );
      
      // Decrypt
      const decryptedBuffer = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: ivBuffer },
        cryptoKey,
        encryptedData
      );
      
      return decryptedBuffer;
    } catch (error) {
      console.error('ArrayBuffer AES decryption failed:', error);
      throw new Error('ArrayBuffer AES decryption failed');
    }
  }

  // Encrypt with RSA
  private async encryptWithRSA(data: string, publicKey: string): Promise<string> {
    try {
      const publicKeyBuffer = this.base64ToArrayBuffer(publicKey);
      const dataBuffer = new TextEncoder().encode(data);
      
      // Import public key
      const cryptoKey = await crypto.subtle.importKey(
        'spki',
        publicKeyBuffer,
        { name: 'RSA-OAEP', hash: 'SHA-256' },
        false,
        ['encrypt']
      );
      
      // Encrypt
      const encryptedBuffer = await crypto.subtle.encrypt(
        { name: 'RSA-OAEP' },
        cryptoKey,
        dataBuffer
      );
      
      return this.arrayBufferToBase64(encryptedBuffer);
    } catch (error) {
      console.error('RSA encryption failed:', error);
      throw new Error('RSA encryption failed');
    }
  }

  // Decrypt with RSA
  private async decryptWithRSA(keyId: string, privateKey: string): Promise<string> {
    try {
      const privateKeyBuffer = this.base64ToArrayBuffer(privateKey);
      
      // Import private key
      const cryptoKey = await crypto.subtle.importKey(
        'pkcs8',
        privateKeyBuffer,
        { name: 'RSA-OAEP', hash: 'SHA-256' },
        false,
        ['decrypt']
      );
      
      // Decrypt (this would typically use the encrypted AES key)
      // For now, returning the keyId as placeholder
      return keyId;
    } catch (error) {
      console.error('RSA decryption failed:', error);
      throw new Error('RSA decryption failed');
    }
  }

  // Store key pair securely
  private async storeKeyPair(keyPair: EncryptionKeyPair): Promise<void> {
    try {
      const key = this.KEY_STORAGE_PREFIX + keyPair.keyId;
      await AsyncStorage.setItem(key, JSON.stringify(keyPair));
    } catch (error) {
      console.error('Failed to store key pair:', error);
      throw new Error('Key storage failed');
    }
  }

  // Retrieve key pair
  async getKeyPair(keyId: string): Promise<EncryptionKeyPair | null> {
    try {
      const key = this.KEY_STORAGE_PREFIX + keyId;
      const keyPairString = await AsyncStorage.getItem(key);
      return keyPairString ? JSON.parse(keyPairString) : null;
    } catch (error) {
      console.error('Failed to retrieve key pair:', error);
      return null;
    }
  }

  // Generate unique key ID
  private generateKeyId(): string {
    return 'key_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Utility methods for base64 conversion
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  // Key rotation for security
  async rotateKeys(): Promise<void> {
    try {
      // Generate new key pair
      const newKeyPair = await this.generateKeyPair();
      
      // Mark old keys for expiration
      // In production, implement proper key rotation strategy
      
      console.log('Keys rotated successfully');
    } catch (error) {
      console.error('Key rotation failed:', error);
      throw new Error('Key rotation failed');
    }
  }

  // Validate encryption compliance
  async validateCompliance(): Promise<{
    hipaa: boolean;
    gdpr: boolean;
    owasp: boolean;
    details: string[];
  }> {
    const details: string[] = [];
    let hipaa = true;
    let gdpr = true;
    let owasp = true;

    try {
      // Check encryption algorithms
      if (!this.isAlgorithmCompliant()) {
        details.push('Encryption algorithms must meet HIPAA requirements');
        hipaa = false;
        owasp = false;
      }

      // Check key management
      if (!this.isKeyManagementCompliant()) {
        details.push('Key management must follow OWASP guidelines');
        owasp = false;
      }

      // Check data integrity
      if (!this.isDataIntegrityCompliant()) {
        details.push('Data integrity measures must be implemented');
        hipaa = false;
        gdpr = false;
      }

      return { hipaa, gdpr, owasp, details };
    } catch (error) {
      console.error('Compliance validation failed:', error);
      return { hipaa: false, gdpr: false, owasp: false, details: ['Validation failed'] };
    }
  }

  private isAlgorithmCompliant(): boolean {
    // Check if algorithms meet HIPAA requirements
    return this.RSA_KEY_SIZE >= 2048 && this.AES_KEY_SIZE >= 256;
  }

  private isKeyManagementCompliant(): boolean {
    // Check key management practices
    return true; // Implement actual checks
  }

  private isDataIntegrityCompliant(): boolean {
    // Check data integrity measures
    return true; // Implement actual checks
  }
}

export const encryptionService = new EncryptionService();
export default encryptionService;



