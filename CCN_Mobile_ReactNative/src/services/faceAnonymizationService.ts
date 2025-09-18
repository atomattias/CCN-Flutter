import { authService } from './authService';
import { resizeImageForAnonymization } from '../utils/imageUtils';

export interface FaceAnonymizationRequest {
  image: string; // base64 encoded image
  method?: 'blur' | 'pixelate' | 'hybrid';
  quality?: 'low' | 'medium' | 'high' | 'extreme';
}

export interface FaceAnonymizationResult {
  anonymized_image: string;
  faces_detected: number;
  processing_time: number;
  method_used: string;
  quality_level: string;
}

export interface ProcessImageWithChoiceResult {
  processedImage: string;
  facesDetected: number;
  wasAnonymized: boolean;
  confidence: number;
}

class FaceAnonymizationService {
  private baseUrl: string;

  constructor() {
    // Use the backend face anonymization service
    this.baseUrl = 'http://192.168.1.224:3000/api/face-anonymization';
  }

  /**
   * Anonymize faces in an image
   */
  async anonymizeFaces(request: FaceAnonymizationRequest): Promise<FaceAnonymizationResult> {
    try {
      // Resize image if it's too large for the service
      console.log('Resizing image for face anonymization...');
      const resizedImage = await resizeImageForAnonymization(request.image, 500); // 500KB limit
      
      // Get the auth token from AsyncStorage
      const token = await authService.getToken();
      console.log('Auth token retrieved:', token ? 'Token exists' : 'No token found');
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }
      
      const requestBody = {
        image: resizedImage,
        method: request.method || 'pixelate',
        quality: request.quality || 'medium',
      };
      
      console.log('Sending request to:', `${this.baseUrl}/anonymize`);
      console.log('Request body:', JSON.stringify(requestBody, null, 2));
      console.log('Authorization header:', `Bearer ${token?.substring(0, 20)}...`);
      
      const response = await fetch(`${this.baseUrl}/anonymize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        let errorMessage = `Face anonymization failed: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (errorData.error) {
            errorMessage = typeof errorData.error === 'string' ? errorData.error : JSON.stringify(errorData.error);
          } else if (errorData.message) {
            errorMessage = errorData.message;
          }
          
          // Check if it's a token expiration error
          if (errorData.error && typeof errorData.error === 'object' && errorData.error.name === 'TokenExpiredError') {
            console.log('Token expired, attempting to refresh...');
            // Clear the expired token
            await authService.logout();
            throw new Error('Your session has expired. Please log in again.');
          }
        } catch (parseError) {
          // If we can't parse the error response, use the status text
          console.warn('Could not parse error response:', parseError);
          const errorText = await response.text();
          errorMessage = `${errorMessage} - ${errorText}`;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Face anonymization completed successfully via backend proxy');
      return result;
    } catch (error) {
      console.error('Face anonymization error:', error);
      
      // Handle specific error cases
      if (error instanceof Error) {
        if (error.message.includes('session has expired') || error.message.includes('TokenExpiredError')) {
          throw new Error('Your session has expired. Please log in again.');
        }
        if (error.message.includes('No authentication token')) {
          throw new Error('Please log in to use this feature.');
        }
      }
      
      throw new Error(`Face anonymization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Process image with user choice for face anonymization
   */
  async processImageWithChoice(
    imageBase64: string,
    options: {
      method?: 'blur' | 'pixelate' | 'hybrid';
      quality?: 'low' | 'medium' | 'high' | 'extreme';
    } = {}
  ): Promise<ProcessImageWithChoiceResult> {
    try {
      // Resize image if it's too large for the service
      console.log('Resizing image for face anonymization with choice...');
      const resizedImage = await resizeImageForAnonymization(imageBase64, 500); // 500KB limit
      
      // Get the auth token from AsyncStorage
      const token = await authService.getToken();
      console.log('Auth token retrieved (choice):', token ? 'Token exists' : 'No token found');
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }
      
      const response = await fetch(`${this.baseUrl}/anonymize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          image: resizedImage,
          method: options.method || 'pixelate',
          quality: options.quality || 'medium',
        }),
      });

      if (!response.ok) {
        throw new Error(`Face anonymization failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      // Transform the response to match the expected interface
      return {
        processedImage: result.anonymized_image,
        facesDetected: result.faces_detected,
        wasAnonymized: result.faces_detected > 0,
        confidence: 0.8 // Default confidence
      };
    } catch (error) {
      console.error('Face anonymization with choice error:', error);
      throw new Error(`Face anonymization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if the face anonymization service is healthy
   */
  async checkHealth(): Promise<boolean> {
    try {
      // Check the backend health instead of the face anonymization service directly
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
      });

      if (!response.ok) {
        return false;
      }

      const result = await response.json();
      return result.status === 'healthy' || result.healthy === true;
    } catch (error) {
      console.error('Backend health check error:', error);
      return false;
    }
  }
}

export const faceAnonymizationService = new FaceAnonymizationService();
