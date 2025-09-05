import { ApiService } from './api';
import { encryptionService } from './encryptionService';

export interface ClinicalQuestion {
  _id: string;
  title: string;
  description: string;
  patientSymptoms: string;
  patientHistory: string;
  diagnosticTests: string[];
  suspectedConditions: string[];
  urgency: 'low' | 'medium' | 'high' | 'critical';
  specialty: string;
  department: string;
  tags: string[];
  authorId: string;
  authorName: string;
  authorSpecialty: string;
  authorHospital: string;
  createdAt: string;
  updatedAt: string;
  status: 'open' | 'answered' | 'resolved' | 'closed';
  isAnonymous: boolean;
  isEncrypted: boolean;
  viewCount: number;
  responseCount: number;
  upvotes: number;
  downvotes: number;
  aiAnalysis?: AIAnalysis;
  
  // Enhanced clinical data
  labValues?: string;
  vitalSigns?: string;
  medications?: string;
  allergies?: string;
  familyHistory?: string;
  socialHistory?: string;
  physicalExam?: string;
  clinicalImages?: ClinicalImage[];
}

export interface ClinicalResponse {
  _id: string;
  questionId: string;
  authorId: string;
  authorName: string;
  authorSpecialty: string;
  authorHospital: string;
  content: string;
  diagnosis: string;
  treatmentPlan: string;
  references: string[];
  experienceLevel: 'resident' | 'attending' | 'specialist' | 'expert';
  confidence: number; // 1-10 scale
  createdAt: string;
  updatedAt: string;
  upvotes: number;
  downvotes: number;
  isAccepted: boolean;
  isAIEnhanced: boolean;
  aiSuggestions?: string[];
  tags: string[];
}

export interface AIAnalysis {
  questionId: string;
  analysisId: string;
  primaryDiagnosis: string;
  differentialDiagnosis: string[];
  confidence: number;
  reasoning: string;
  evidence: string[];
  treatmentRecommendations: string[];
  riskFactors: string[];
  redFlags: string[];
  followUpRecommendations: string[];
  references: string[];
  limitations: string[];
  createdAt: string;
  modelVersion: string;
  explainabilityScore: number;
}

export interface ClinicalImage {
  id: string;
  name: string;
  uri: string;
  type: string;
  size: number;
  description?: string;
  uploadedAt: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
}

export interface ClinicalVote {
  userId: string;
  questionId?: string;
  responseId?: string;
  voteType: 'upvote' | 'downvote';
  reason?: string;
  timestamp: string;
}

export interface ClinicalSearchQuery {
  query: string;
  specialty?: string;
  urgency?: string;
  status?: string;
  tags?: string[];
  dateRange?: { start: string; end: string };
  authorSpecialty?: string;
  hospital?: string;
  sortBy?: 'relevance' | 'date' | 'urgency' | 'votes' | 'responses';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface ClinicalMetrics {
  totalQuestions: number;
  totalResponses: number;
  totalVotes: number;
  averageResponseTime: number;
  resolutionRate: number;
  aiAccuracy: number;
  topSpecialties: Array<{ specialty: string; count: number }>;
  topHospitals: Array<{ hospital: string; count: number }>;
  urgentQuestions: number;
  criticalQuestions: number;
}

class ClinicalKnowledgeService {
  private api: ApiService;
  private readonly CLINICAL_CACHE_KEY = 'ccn_clinical_cache';
  private readonly CACHE_EXPIRY = 15 * 60 * 1000; // 15 minutes

  constructor() {
    this.api = new ApiService();
  }

  // Clinical Question Management

  // Post a new clinical question
  async postClinicalQuestion(questionData: {
    title: string;
    description: string;
    patientSymptoms: string;
    patientHistory: string;
    diagnosticTests: string[];
    suspectedConditions: string[];
    urgency: 'low' | 'medium' | 'high' | 'critical';
    specialty: string;
    department: string;
    tags: string[];
    isAnonymous: boolean;
    isEncrypted: boolean;
    // Enhanced clinical data
    labValues?: string;
    vitalSigns?: string;
    medications?: string;
    allergies?: string;
    familyHistory?: string;
    socialHistory?: string;
    physicalExam?: string;
    clinicalImages?: ClinicalImage[];
  }): Promise<ClinicalQuestion> {
    try {
      // Encrypt sensitive patient information if needed
      let encryptedData = questionData;
      if (questionData.isEncrypted) {
        const encryptedSymptoms = await encryptionService.encryptMessage({
          content: questionData.patientSymptoms,
          metadata: {
            senderId: 'current_user',
            channelId: 'clinical_qa',
            timestamp: new Date().toISOString(),
            messageType: 'clinical_data',
          },
        }, 'system_public_key');

        const encryptedHistory = await encryptionService.encryptMessage({
          content: questionData.patientHistory,
          metadata: {
            senderId: 'current_user',
            channelId: 'clinical_qa',
            timestamp: new Date().toISOString(),
            messageType: 'clinical_data',
          },
        }, 'system_public_key');

        encryptedData = {
          ...questionData,
          patientSymptoms: encryptedSymptoms.encryptedContent,
          patientHistory: encryptedHistory.encryptedContent,
        };
      }

      const response = await this.api.post('/clinical/questions', encryptedData);
      const question = response.data.data;

      // Trigger AI analysis
      await this.triggerAIAnalysis(question._id);

      return question;
    } catch (error) {
      console.error('Failed to post clinical question:', error);
      throw new Error('Failed to post clinical question');
    }
  }

  // Get clinical questions with filters
  async getClinicalQuestions(query: ClinicalSearchQuery): Promise<{
    questions: ClinicalQuestion[];
    total: number;
    facets: any;
  }> {
    try {
      const response = await this.api.post('/clinical/questions/search', query);
      return response.data.data;
    } catch (error) {
      console.error('Failed to get clinical questions:', error);
      throw new Error('Failed to get clinical questions');
    }
  }

  // Get clinical question by ID
  async getClinicalQuestion(questionId: string): Promise<ClinicalQuestion> {
    try {
      const response = await this.api.get(`/clinical/questions/${questionId}`);
      const question = response.data.data;

      // Decrypt sensitive information if needed
      if (question.isEncrypted) {
        try {
          const decryptedSymptoms = await encryptionService.decryptMessage(
            {
              encryptedContent: question.patientSymptoms,
              iv: 'placeholder_iv',
              keyId: 'placeholder_key',
              algorithm: 'AES-GCM+RSA-OAEP',
              signature: 'placeholder_signature',
              timestamp: question.createdAt,
              version: '1.0',
            },
            'current_user_private_key'
          );

          const decryptedHistory = await encryptionService.decryptMessage(
            {
              encryptedContent: question.patientHistory,
              iv: 'placeholder_iv',
              keyId: 'placeholder_key',
              algorithm: 'AES-GCM+RSA-OAEP',
              signature: 'placeholder_signature',
              timestamp: question.createdAt,
              version: '1.0',
            },
            'current_user_private_key'
          );

          question.patientSymptoms = decryptedSymptoms.content;
          question.patientHistory = decryptedHistory.content;
        } catch (decryptError) {
          console.error('Failed to decrypt clinical data:', decryptError);
          question.patientSymptoms = '[Encrypted Content]';
          question.patientHistory = '[Encrypted Content]';
        }
      }

      return question;
    } catch (error) {
      console.error('Failed to get clinical question:', error);
      throw new Error('Failed to get clinical question');
    }
  }

  // Update clinical question
  async updateClinicalQuestion(
    questionId: string,
    updates: Partial<ClinicalQuestion>
  ): Promise<ClinicalQuestion> {
    try {
      const response = await this.api.put(`/clinical/questions/${questionId}`, updates);
      return response.data.data;
    } catch (error) {
      console.error('Failed to update clinical question:', error);
      throw new Error('Failed to update clinical question');
    }
  }

  // Close clinical question
  async closeClinicalQuestion(questionId: string, reason: string): Promise<boolean> {
    try {
      await this.api.post(`/clinical/questions/${questionId}/close`, { reason });
      return true;
    } catch (error) {
      console.error('Failed to close clinical question:', error);
      return false;
    }
  }

  // Clinical Response Management

  // Post a response to a clinical question
  async postClinicalResponse(
    questionId: string,
    responseData: {
      content: string;
      diagnosis: string;
      treatmentPlan: string;
      references: string[];
      experienceLevel: 'resident' | 'attending' | 'specialist' | 'expert';
      confidence: number;
      tags: string[];
    }
  ): Promise<ClinicalResponse> {
    try {
      const response = await this.api.post(`/clinical/questions/${questionId}/responses`, responseData);
      return response.data.data;
    } catch (error) {
      console.error('Failed to post clinical response:', error);
      throw new Error('Failed to post clinical response');
    }
  }

  // Get responses for a clinical question
  async getClinicalResponses(questionId: string): Promise<ClinicalResponse[]> {
    try {
      const response = await this.api.get(`/clinical/questions/${questionId}/responses`);
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to get clinical responses:', error);
      return [];
    }
  }

  // Update clinical response
  async updateClinicalResponse(
    responseId: string,
    updates: Partial<ClinicalResponse>
  ): Promise<ClinicalResponse> {
    try {
      const response = await this.api.put(`/clinical/responses/${responseId}`, updates);
      return response.data.data;
    } catch (error) {
      console.error('Failed to update clinical response:', error);
      throw new Error('Failed to update clinical response');
    }
  }

  // Accept a clinical response as the best answer
  async acceptClinicalResponse(responseId: string): Promise<boolean> {
    try {
      await this.api.post(`/clinical/responses/${responseId}/accept`);
      return true;
    } catch (error) {
      console.error('Failed to accept clinical response:', error);
      return false;
    }
  }

  // Voting System

  // Vote on a clinical question or response
  async vote(
    targetId: string,
    targetType: 'question' | 'response',
    voteType: 'upvote' | 'downvote',
    reason?: string
  ): Promise<boolean> {
    try {
      const endpoint = targetType === 'question' 
        ? `/clinical/questions/${targetId}/vote`
        : `/clinical/responses/${targetId}/vote`;

      await this.api.post(endpoint, { voteType, reason });
      return true;
    } catch (error) {
      console.error('Failed to vote:', error);
      return false;
    }
  }

  // Get voting statistics
  async getVotingStats(targetId: string, targetType: 'question' | 'response'): Promise<{
    upvotes: number;
    downvotes: number;
    userVote?: 'upvote' | 'downvote';
  }> {
    try {
      const endpoint = targetType === 'question'
        ? `/clinical/questions/${targetId}/votes`
        : `/clinical/responses/${targetId}/votes`;

      const response = await this.api.get(endpoint);
      return response.data.data;
    } catch (error) {
      console.error('Failed to get voting stats:', error);
      return { upvotes: 0, downvotes: 0 };
    }
  }

  // AI Analysis System

  // Trigger AI analysis for a clinical question
  async triggerAIAnalysis(questionId: string): Promise<AIAnalysis> {
    try {
      const response = await this.api.post(`/ai/analyze`, {
        questionId,
        patientContext: {
          // Add patient context if available
        }
      });
      return response.data.data.aiAnalysis;
    } catch (error) {
      console.error('Failed to trigger AI analysis:', error);
      throw new Error('Failed to trigger AI analysis');
    }
  }

  // Get AI analysis for a clinical question
  async getAIAnalysis(questionId: string): Promise<AIAnalysis | null> {
    try {
      const response = await this.api.get(`/ai/analysis/${questionId}`);
      return response.data.data.aiAnalysis;
    } catch (error) {
      console.error('Failed to get AI analysis:', error);
      return null;
    }
  }

  // Get AI model information
  async getAIModelInfo(): Promise<{
    version: string;
    lastTrainingDate: string;
    capabilities: string[];
    specialties: string[];
  }> {
    try {
      const response = await this.api.get('/ai/info');
      return response.data.data;
    } catch (error) {
      console.error('Failed to get AI model info:', error);
      throw new Error('Failed to get AI model information');
    }
  }

  // Get AI model performance metrics
  async getAIMetrics(): Promise<{
    accuracy: number;
    responseTime: number;
    explainabilityScore: number;
    modelVersion: string;
    lastUpdated: string;
    totalAnalyses: number;
    specialties: Array<{ specialty: string; accuracy: number }>;
  }> {
    try {
      const response = await this.api.get('/ai/metrics');
      const data = response.data.data;
      return {
        accuracy: data.accuracyRate || 0,
        responseTime: 0, // Not provided by backend yet
        explainabilityScore: 0.85, // Default value
        modelVersion: data.modelVersion || '1.0.0',
        lastUpdated: data.lastTrainingDate || new Date().toISOString(),
        totalAnalyses: data.totalAnalyses || 0,
        specialties: Object.entries(data.specialtyBreakdown || {}).map(([string, stats]: [string, any]) => ({
          specialty,
          accuracy: stats.accuracy || 0,
        })),
      };
    } catch (error) {
      console.error('Failed to get AI metrics:', error);
      throw new Error('Failed to get AI metrics');
    }
  }

  // Clinical Knowledge Search

  // Search clinical knowledge base
  async searchClinicalKnowledge(query: string, filters?: {
    specialty?: string;
    tags?: string[];
    dateRange?: { start: string; end: string };
    urgency?: string;
    status?: string;
  }): Promise<{
    questions: ClinicalQuestion[];
    responses: ClinicalResponse[];
    aiAnalyses: AIAnalysis[];
    total: number;
  }> {
    try {
      const response = await this.api.post('/clinical/search', { query, filters });
      return response.data.data;
    } catch (error) {
      console.error('Failed to search clinical knowledge:', error);
      throw new Error('Failed to search clinical knowledge');
    }
  }

  // Get clinical knowledge suggestions
  async getClinicalSuggestions(query: string): Promise<{
    similarQuestions: ClinicalQuestion[];
    relatedTags: string[];
    specialtySuggestions: string[];
    urgencySuggestions: string[];
  }> {
    try {
      const response = await this.api.get(`/clinical/suggestions?q=${encodeURIComponent(query)}`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to get clinical suggestions:', error);
      return {
        similarQuestions: [],
        relatedTags: [],
        specialtySuggestions: [],
        urgencySuggestions: [],
      };
    }
  }

  // Analytics and Metrics

  // Get clinical knowledge metrics
  async getClinicalMetrics(timeRange?: { start: string; end: string }): Promise<ClinicalMetrics> {
    try {
      const params = timeRange ? `?start=${timeRange.start}&end=${timeRange.end}` : '';
      const response = await this.api.get(`/clinical/metrics${params}`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to get clinical metrics:', error);
      throw new Error('Failed to get clinical metrics');
    }
  }

  // Get trending clinical topics
  async getTrendingTopics(): Promise<Array<{
    topic: string;
    count: number;
    trend: 'rising' | 'stable' | 'declining';
    specialty: string;
  }>> {
    try {
      const response = await this.api.get('/clinical/trending-topics');
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to get trending topics:', error);
      return [];
    }
  }

  // Get clinical knowledge insights
  async getClinicalInsights(): Promise<{
    mostActiveSpecialties: Array<{ specialty: string; questionCount: number; responseCount: number }>;
    fastestResponseTimes: Array<{ specialty: string; averageTime: number }>;
    highestResolutionRates: Array<{ specialty: string; rate: number }>;
    aiAccuracyBySpecialty: Array<{ specialty: string; accuracy: number }>;
  }> {
    try {
      const response = await this.api.get('/clinical/insights');
      return response.data.data;
    } catch (error) {
      console.error('Failed to get clinical insights:', error);
      throw new Error('Failed to get clinical insights');
    }
  }

  // Utility Methods

  // Get available specialties
  async getSpecialties(): Promise<string[]> {
    try {
      const response = await this.api.get('/clinical/specialties');
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to get specialties:', error);
      return [];
    }
  }

  // Get available departments
  async getDepartments(): Promise<string[]> {
    try {
      const response = await this.api.get('/clinical/departments');
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to get departments:', error);
      return [];
    }
  }

  // Get clinical tags
  async getClinicalTags(): Promise<string[]> {
    try {
      const response = await this.api.get('/clinical/tags');
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to get clinical tags:', error);
      return [];
    }
  }

  // Cache Management

  private cacheClinicalData(data: any, key: string): void {
    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
      };
      localStorage.setItem(`${this.CLINICAL_CACHE_KEY}_${key}`, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Failed to cache clinical data:', error);
    }
  }

  private getCachedClinicalData(key: string): any {
    try {
      const cacheString = localStorage.getItem(`${this.CLINICAL_CACHE_KEY}_${key}`);
      if (cacheString) {
        const cacheData = JSON.parse(cacheString);
        if (Date.now() - cacheData.timestamp < this.CACHE_EXPIRY) {
          return cacheData.data;
        }
      }
    } catch (error) {
      console.error('Failed to get cached clinical data:', error);
    }
    return null;
  }

  private clearClinicalCache(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.CLINICAL_CACHE_KEY)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Failed to clear clinical cache:', error);
    }
  }
}

export const clinicalKnowledgeService = new ClinicalKnowledgeService();
export default clinicalKnowledgeService;
