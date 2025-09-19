/**
 * Face Anonymization Service
 * Integrates with CCN Face Anonymization Service for image privacy protection
 */

export interface FaceAnonymizationRequest {
  image: string; // base64 encoded image
  method?: 'blur' | 'pixelate' | 'hybrid' | 'solid';
  quality?: 'low' | 'medium' | 'high' | 'extreme';
}

export interface FaceAnonymizationResult {
  anonymized_image: string; // base64 encoded anonymized image
  faces_detected: number;
  processing_time: number;
  method_used: string;
  quality_level: string;
  confidence: number;
}

class FaceAnonymizationService {
  private baseUrl: string;
  private timeout: number;

  constructor(baseUrl: string = 'http://192.168.1.224:8000', timeout: number = 30000) {
    this.baseUrl = baseUrl;
    this.timeout = timeout;
  }

  /**
   * Strip data URL prefix from base64 image string
   */
  private stripDataUrlPrefix(imageData: string): string {
    // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
    if (imageData.startsWith('data:')) {
      const base64Index = imageData.indexOf(',');
      if (base64Index !== -1) {
        return imageData.substring(base64Index + 1);
      }
    }
    return imageData;
  }

  /**
   * Check if the face anonymization service is healthy
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
      });

      if (response.ok) {
        const health = await response.json();
        return health.status === 'healthy';
      }
      return false;
    } catch (error) {
      console.error('Face anonymization health check failed:', error);
      return false;
    }
  }

  /**
   * Anonymize faces in an image
   */
  async anonymizeFaces(request: FaceAnonymizationRequest): Promise<FaceAnonymizationResult> {
    try {
      // Strip data URL prefix if present
      const cleanImageData = this.stripDataUrlPrefix(request.image);
      
      console.log('=== Face Anonymization Request ===');
      console.log('URL:', `${this.baseUrl}/anonymize-json`);
      console.log('Method:', request.method || 'blur');
      console.log('Quality:', request.quality || 'high');
      console.log('Image data length:', cleanImageData.length);
      console.log('Image data preview:', cleanImageData.substring(0, 100) + '...');
      
      const response = await fetch(`${this.baseUrl}/anonymize-json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: cleanImageData,
          method: request.method || 'blur',
          quality: request.quality || 'high',
        }),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        // Try to get error details
        let errorDetails = '';
        try {
          const errorText = await response.text();
          errorDetails = ` - ${errorText}`;
        } catch (e) {
          // Ignore if we can't read error text
        }
        throw new Error(`Face anonymization failed: ${response.status} ${response.statusText}${errorDetails}`);
      }

      const result = await response.json();
      console.log('Face anonymization successful, returning result');
      return result;
    } catch (error) {
      console.error('Face anonymization error:', error);
      throw new Error(`Face anonymization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Process image with user choice for face anonymization
   */
  async processImageWithChoice(
    imageBase64: string,
    options: {
      method?: 'blur' | 'pixelate' | 'hybrid' | 'solid';
      quality?: 'low' | 'medium' | 'high' | 'extreme';
    } = {}
  ): Promise<{
    processedImage: string;
    facesDetected: number;
    wasAnonymized: boolean;
    confidence: number;
  }> {
    try {
      // First, check if faces are detected by attempting anonymization
      const result = await this.anonymizeFaces({
        image: imageBase64,
        method: options.method || 'blur',
        quality: options.quality || 'high',
      });

      // If no faces detected, return original image
      if (result.faces_detected === 0) {
        return {
          processedImage: imageBase64,
          facesDetected: 0,
          wasAnonymized: false,
          confidence: 1.0,
        };
      }

      // Faces detected - return result for user choice
      return {
        processedImage: result.anonymized_image,
        facesDetected: result.faces_detected,
        wasAnonymized: true,
        confidence: result.confidence,
      };
    } catch (error) {
      console.error('Process image with choice error:', error);
      // Return original image if processing fails
      return {
        processedImage: imageBase64,
        facesDetected: 0,
        wasAnonymized: false,
        confidence: 0.0,
      };
    }
  }

  /**
   * Get service information
   */
  async getServiceInfo(): Promise<{
    service: string;
    version: string;
    status: string;
    timestamp: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Get face anonymization service info error:', error);
      throw new Error(`Failed to get service info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Export singleton instance
export const faceAnonymizationService = new FaceAnonymizationService();

// Export class for custom instances
export default FaceAnonymizationService;


