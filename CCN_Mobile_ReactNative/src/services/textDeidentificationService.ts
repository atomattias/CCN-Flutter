import { authService } from './authService';

export interface PHIDetection {
  type: string;
  value: string;
  start: number;
  end: number;
  confidence: number;
  context: string;
  field: string;
}

export interface DeidentificationResult {
  original_text: string;
  deidentified_text: string;
  phi_detected: PHIDetection[];
  phi_count: number;
  confidence_score: number;
}

export interface TextDeidentificationRequest {
  text: string;
  method?: 'regex' | 'nlp' | 'comprehensive' | 'hybrid';
  sensitivity?: 'low' | 'medium' | 'high' | 'extreme';
  preserve_context?: boolean;
  custom_patterns?: string[];
}

export interface PHIDetectionRequest {
  text: string;
  method?: 'regex' | 'nlp' | 'comprehensive' | 'hybrid';
  sensitivity?: 'low' | 'medium' | 'high' | 'extreme';
}

export interface PHIDetectionResult {
  original_text: string;
  phi_detected: PHIDetection[];
  sensitivity_level: string;
  phi_count: number;
  confidence_score: number;
}

class TextDeidentificationService {
  private baseUrl: string;

  constructor() {
    // Use the backend API URL
    this.baseUrl = 'http://192.168.1.224:3000/api/text-deidentification';
  }

  /**
   * De-identify text by removing PHI
   */
  async deidentifyText(request: TextDeidentificationRequest): Promise<DeidentificationResult> {
    try {
      const token = await authService.getToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }
      
      const response = await fetch(`${this.baseUrl}/deidentify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          text: request.text,
          method: request.method || 'comprehensive',
          sensitivity: request.sensitivity || 'high',
          preserve_context: request.preserve_context !== false,
          custom_patterns: request.custom_patterns || [],
        }),
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
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
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Deidentification failed');
      }

      return result.data;
    } catch (error) {
      console.error('Text de-identification error:', error);
      
      // Handle specific error cases
      if (error instanceof Error) {
        if (error.message.includes('session has expired') || error.message.includes('TokenExpiredError')) {
          throw new Error('Your session has expired. Please log in again.');
        }
        if (error.message.includes('No authentication token')) {
          throw new Error('Please log in to use this feature.');
        }
      }
      
      throw new Error(`Text de-identification failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Detect PHI in text without removing it
   */
  async detectPHI(request: PHIDetectionRequest): Promise<PHIDetectionResult> {
    try {
      const token = await authService.getToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }
      
      const response = await fetch(`${this.baseUrl}/detect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          text: request.text,
          method: request.method || 'comprehensive',
          sensitivity: request.sensitivity || 'high',
        }),
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
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
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'PHI detection failed');
      }

      return result.data;
    } catch (error) {
      console.error('PHI detection error:', error);
      
      // Handle specific error cases
      if (error instanceof Error) {
        if (error.message.includes('session has expired') || error.message.includes('TokenExpiredError')) {
          throw new Error('Your session has expired. Please log in again.');
        }
        if (error.message.includes('No authentication token')) {
          throw new Error('Please log in to use this feature.');
        }
      }
      
      throw new Error(`PHI detection failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Check if the text de-identification service is healthy
   */
  async checkHealth(): Promise<boolean> {
    try {
      const token = await authService.getToken();
      
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        return false;
      }

      const result = await response.json();
      return result.success && result.data.healthy;
    } catch (error) {
      console.error('Health check error:', error);
      return false;
    }
  }
}

export const textDeidentificationService = new TextDeidentificationService();









