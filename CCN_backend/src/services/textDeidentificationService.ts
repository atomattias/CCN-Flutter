/**
 * Text De-identification Service
 * Integrates with CCN Text De-identification Service for PHI removal
 */

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
  processing_time: number;
  method_used: string;
  sensitivity_level: string;
  phi_count: number;
  confidence_score: number;
  preserved_context: boolean;
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
  processing_time: number;
  method_used: string;
  sensitivity_level: string;
  phi_count: number;
  confidence_score: number;
}

class TextDeidentificationService {
  private baseUrl: string;
  private timeout: number;

  constructor(baseUrl: string = 'http://localhost:8001', timeout: number = 30000) {
    this.baseUrl = baseUrl;
    this.timeout = timeout;
  }

  /**
   * Check if the text de-identification service is healthy
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        // timeout: this.timeout, // Removed - not supported in fetch API
      });

      if (response.ok) {
        const health = await response.json();
        return health.status === 'healthy' && health.deidentifier_loaded;
      }
      return false;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  /**
   * Detect PHI in text without de-identifying
   */
  async detectPHI(request: PHIDetectionRequest): Promise<PHIDetectionResult> {
    try {
      const response = await fetch(`${this.baseUrl}/detect-phi`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: request.text,
          method: request.method || 'comprehensive',
          sensitivity: request.sensitivity || 'high',
        }),
        // timeout: this.timeout, // Removed - not supported in fetch API
      });

      if (!response.ok) {
        throw new Error(`PHI detection failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('PHI detection error:', error);
      throw new Error(`PHI detection failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * De-identify text by removing PHI
   */
  async deidentifyText(request: TextDeidentificationRequest): Promise<DeidentificationResult> {
    try {
      const response = await fetch(`${this.baseUrl}/deidentify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: request.text,
          method: request.method || 'comprehensive',
          sensitivity: request.sensitivity || 'high',
          preserve_context: request.preserve_context !== false,
          custom_patterns: request.custom_patterns || [],
        }),
        // timeout: this.timeout, // Removed - not supported in fetch API
      });

      if (!response.ok) {
        throw new Error(`Text de-identification failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Text de-identification error:', error);
      throw new Error(`Text de-identification failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * De-identify text via JSON endpoint (for mobile app integration)
   */
  async deidentifyTextJSON(request: TextDeidentificationRequest): Promise<DeidentificationResult> {
    try {
      const response = await fetch(`${this.baseUrl}/deidentify-json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: request.text,
          method: request.method || 'comprehensive',
          sensitivity: request.sensitivity || 'high',
          preserve_context: request.preserve_context !== false,
          custom_patterns: request.custom_patterns || [],
        }),
        // timeout: this.timeout, // Removed - not supported in fetch API
      });

      if (!response.ok) {
        throw new Error(`Text de-identification failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Text de-identification JSON error:', error);
      throw new Error(`Text de-identification failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get available de-identification methods and their descriptions
   */
  async getAvailableMethods(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/methods`, {
        method: 'GET',
        // timeout: this.timeout, // Removed - not supported in fetch API
      });

      if (!response.ok) {
        throw new Error(`Failed to get methods: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Get methods error:', error);
      throw new Error(`Failed to get methods: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Process text with user choice for de-identification
   */
  async processTextWithChoice(
    text: string,
    fieldName: string,
    options: {
      method?: 'regex' | 'nlp' | 'comprehensive' | 'hybrid';
      sensitivity?: 'low' | 'medium' | 'high' | 'extreme';
      preserveContext?: boolean;
    } = {}
  ): Promise<{
    processedText: string;
    phiDetected: PHIDetection[];
    wasDeidentified: boolean;
  }> {
    try {
      // First, detect PHI
      const detectionResult = await this.detectPHI({
        text,
        method: options.method || 'comprehensive',
        sensitivity: options.sensitivity || 'high',
      });

      // If no PHI detected, return original text
      if (detectionResult.phi_count === 0) {
        return {
          processedText: text,
          phiDetected: [],
          wasDeidentified: false,
        };
      }

      // PHI detected - return detection result for user choice
      return {
        processedText: text,
        phiDetected: detectionResult.phi_detected,
        wasDeidentified: false,
      };
    } catch (error) {
      console.error('Process text with choice error:', error);
      // Return original text if processing fails
      return {
        processedText: text,
        phiDetected: [],
        wasDeidentified: false,
      };
    }
  }

  /**
   * De-identify text after user confirms
   */
  async confirmDeidentification(
    text: string,
    options: {
      method?: 'regex' | 'nlp' | 'comprehensive' | 'hybrid';
      sensitivity?: 'low' | 'medium' | 'high' | 'extreme';
      preserveContext?: boolean;
    } = {}
  ): Promise<DeidentificationResult> {
    return await this.deidentifyText({
      text,
      method: options.method || 'comprehensive',
      sensitivity: options.sensitivity || 'high',
      preserve_context: options.preserveContext !== false,
    });
  }

  /**
   * Batch process multiple text fields
   */
  async batchProcessTexts(
    texts: { [fieldName: string]: string },
    options: {
      method?: 'regex' | 'nlp' | 'comprehensive' | 'hybrid';
      sensitivity?: 'low' | 'medium' | 'high' | 'extreme';
      preserveContext?: boolean;
    } = {}
  ): Promise<{
    [fieldName: string]: {
      processedText: string;
      phiDetected: PHIDetection[];
      wasDeidentified: boolean;
    };
  }> {
    const results: any = {};

    // Process each text field
    for (const [fieldName, text] of Object.entries(texts)) {
      try {
        results[fieldName] = await this.processTextWithChoice(text, fieldName, options);
      } catch (error) {
        console.error(`Batch process error for field ${fieldName}:`, error);
        results[fieldName] = {
          processedText: text,
          phiDetected: [],
          wasDeidentified: false,
        };
      }
    }

    return results;
  }

  /**
   * Get service information
   */
  async getServiceInfo(): Promise<{
    service: string;
    version: string;
    status: string;
    deidentifier_loaded: boolean;
    timestamp: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        // timeout: this.timeout, // Removed - not supported in fetch API
      });

      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Get service info error:', error);
      throw new Error(`Failed to get service info: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

// Export singleton instance
export const textDeidentificationService = new TextDeidentificationService();

// Export class for custom instances
export default TextDeidentificationService;
