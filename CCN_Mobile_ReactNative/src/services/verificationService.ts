import { ApiService } from './api';
import { encryptionService } from './encryptionService';

export interface MedicalInstitution {
  _id: string;
  name: string;
  type: 'hospital' | 'clinic' | 'medical_center' | 'university' | 'research_institute';
  country: string;
  state: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  accreditation: string[];
  specialties: string[];
  verificationStatus: 'pending' | 'verified' | 'rejected';
  verifiedAt?: string;
  verifiedBy?: string;
  documents: InstitutionDocument[];
  createdAt: string;
  updatedAt: string;
}

export interface InstitutionDocument {
  _id: string;
  type: 'license' | 'accreditation' | 'registration' | 'certification';
  name: string;
  number: string;
  issuingAuthority: string;
  issueDate: string;
  expiryDate?: string;
  documentUrl: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  verifiedAt?: string;
  verifiedBy?: string;
}

export interface ClinicianVerification {
  _id: string;
  userId: string;
  status: 'pending' | 'verified' | 'rejected' | 'suspended';
  verificationLevel: 'basic' | 'enhanced' | 'premium';
  verificationMethod: 'document' | 'institution' | 'peer' | 'government';
  
  // Personal Information
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  licenseNumber: string;
  issuingCountry: string;
  issuingAuthority: string;
  licenseExpiryDate: string;
  
  // Medical Credentials
  medicalDegree: string;
  medicalSchool: string;
  graduationYear: string;
  boardCertifications: string[];
  specialties: string[];
  experienceYears: number;
  
  // Institution Affiliation
  primaryInstitution: string;
  primaryInstitutionRole: string;
  primaryInstitutionStartDate: string;
  additionalAffiliations: InstitutionAffiliation[];
  
  // Verification Documents
  documents: VerificationDocument[];
  
  // Verification Process
  submittedAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
  rejectionReason?: string;
  suspensionReason?: string;
  suspensionEndDate?: string;
  
  // Audit Trail
  verificationHistory: VerificationEvent[];
  lastUpdated: string;
}

export interface InstitutionAffiliation {
  institutionId: string;
  institutionName: string;
  role: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  verifiedAt?: string;
  verifiedBy?: string;
}

export interface VerificationDocument {
  _id: string;
  type: 'medical_license' | 'medical_degree' | 'board_certification' | 'institution_affiliation' | 'identity_document' | 'professional_reference';
  name: string;
  description: string;
  documentUrl: string;
  documentHash: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  verifiedAt?: string;
  verifiedBy?: string;
  rejectionReason?: string;
  metadata: {
    issuingAuthority: string;
    issueDate: string;
    expiryDate?: string;
    documentNumber: string;
    [key: string]: any;
  };
}

export interface VerificationEvent {
  _id: string;
  eventType: 'submitted' | 'document_verified' | 'institution_verified' | 'peer_reviewed' | 'government_verified' | 'rejected' | 'suspended' | 'reinstated';
  timestamp: string;
  performedBy: string;
  performedByRole: string;
  details: string;
  metadata?: any;
}

export interface VerificationRequest {
  verificationType: 'new' | 'renewal' | 'upgrade' | 'institution_change';
  personalInfo: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    nationality: string;
    licenseNumber: string;
    issuingCountry: string;
    issuingAuthority: string;
    licenseExpiryDate: string;
  };
  medicalCredentials: {
    medicalDegree: string;
    medicalSchool: string;
    graduationYear: string;
    boardCertifications: string[];
    specialties: string[];
    experienceYears: number;
  };
  institutionAffiliations: {
    primaryInstitution: string;
    primaryInstitutionRole: string;
    primaryInstitutionStartDate: string;
    additionalAffiliations: Omit<InstitutionAffiliation, 'verificationStatus' | 'verifiedAt' | 'verifiedBy'>[];
  };
  documents: Omit<VerificationDocument, 'verificationStatus' | 'verifiedAt' | 'verifiedBy' | 'rejectionReason'>[];
  consentAgreements: {
    dataSharing: boolean;
    backgroundCheck: boolean;
    termsOfService: boolean;
    privacyPolicy: boolean;
  };
}

export interface VerificationStatus {
  overallStatus: 'pending' | 'verified' | 'rejected' | 'suspended';
  verificationLevel: 'basic' | 'enhanced' | 'premium';
  progress: {
    personalInfo: number;
    documents: number;
    institution: number;
    background: number;
    total: number;
  };
  estimatedCompletion: string;
  nextSteps: string[];
  requirements: string[];
}

export interface PeerReview {
  _id: string;
  reviewerId: string;
  reviewerName: string;
  reviewerInstitution: string;
  reviewerSpecialty: string;
  verificationId: string;
  status: 'pending' | 'approved' | 'rejected';
  comments: string;
  confidence: number; // 1-10 scale
  reviewedAt: string;
  metadata: {
    relationship: 'colleague' | 'supervisor' | 'peer' | 'unknown';
    yearsKnown: number;
    [key: string]: any;
  };
}

class VerificationService {
  private api: ApiService;
  private readonly VERIFICATION_CACHE_KEY = 'ccn_verification_cache';
  private readonly CACHE_EXPIRY = 30 * 60 * 1000; // 30 minutes

  constructor() {
    this.api = new ApiService();
  }

  // Clinician Verification Management

  // Submit verification request
  async submitVerification(verificationData: VerificationRequest): Promise<ClinicianVerification> {
    try {
      // Encrypt sensitive personal information
      const encryptedData = await this.encryptVerificationData(verificationData);
      
      const response = await this.api.post('/verification/submit', encryptedData);
      return response.data.data;
    } catch (error) {
      console.error('Failed to submit verification:', error);
      throw new Error('Failed to submit verification request');
    }
  }

  // Get verification status
  async getVerificationStatus(): Promise<VerificationStatus> {
    try {
      const response = await this.api.get('/verification/status');
      return response.data.data;
    } catch (error) {
      console.error('Failed to get verification status:', error);
      throw new Error('Failed to get verification status');
    }
  }

  // Get verification details
  async getVerificationDetails(): Promise<ClinicianVerification> {
    try {
      const response = await this.api.get('/verification/details');
      return response.data.data;
    } catch (error) {
      console.error('Failed to get verification details:', error);
      throw new Error('Failed to get verification details');
    }
  }

  // Update verification information
  async updateVerification(updates: Partial<VerificationRequest>): Promise<ClinicianVerification> {
    try {
      const response = await this.api.put('/verification/update', updates);
      return response.data.data;
    } catch (error) {
      console.error('Failed to update verification:', error);
      throw new Error('Failed to update verification');
    }
  }

  // Upload verification document
  async uploadVerificationDocument(
    documentType: string,
    file: any,
    metadata: any
  ): Promise<VerificationDocument> {
    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('type', documentType);
      formData.append('metadata', JSON.stringify(metadata));

      const response = await this.api.post('/verification/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data;
    } catch (error) {
      console.error('Failed to upload verification document:', error);
      throw new Error('Failed to upload verification document');
    }
  }

  // Institution Management

  // Search medical institutions
  async searchInstitutions(query: string, filters?: {
    type?: string;
    country?: string;
    state?: string;
    city?: string;
    specialties?: string[];
    verificationStatus?: string;
  }): Promise<{
    institutions: MedicalInstitution[];
    total: number;
    facets: any;
  }> {
    try {
      const response = await this.api.post('/verification/institutions/search', { query, filters });
      return response.data.data;
    } catch (error) {
      console.error('Failed to search institutions:', error);
      throw new Error('Failed to search institutions');
    }
  }

  // Get institution details
  async getInstitutionDetails(institutionId: string): Promise<MedicalInstitution> {
    try {
      const response = await this.api.get(`/verification/institutions/${institutionId}`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to get institution details:', error);
      throw new Error('Failed to get institution details');
    }
  }

  // Request institution affiliation verification
  async requestInstitutionVerification(
    institutionId: string,
    role: string,
    startDate: string,
    documents: any[]
  ): Promise<InstitutionAffiliation> {
    try {
      const response = await this.api.post('/verification/institutions/affiliate', {
        institutionId,
        role,
        startDate,
        documents,
      });
      return response.data.data;
    } catch (error) {
      console.error('Failed to request institution verification:', error);
      throw new Error('Failed to request institution verification');
    }
    }

  // Document Verification

  // Get document verification status
  async getDocumentVerificationStatus(documentId: string): Promise<VerificationDocument> {
    try {
      const response = await this.api.get(`/verification/documents/${documentId}/status`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to get document verification status:', error);
      throw new Error('Failed to get document verification status');
    }
  }

  // Resubmit rejected document
  async resubmitDocument(documentId: string, newDocument: any, reason: string): Promise<VerificationDocument> {
    try {
      const formData = new FormData();
      formData.append('document', newDocument);
      formData.append('reason', reason);

      const response = await this.api.post(`/verification/documents/${documentId}/resubmit`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data;
    } catch (error) {
      console.error('Failed to resubmit document:', error);
      throw new Error('Failed to resubmit document');
    }
  }

  // Peer Review System

  // Submit peer review request
  async submitPeerReviewRequest(
    verificationId: string,
    peerEmails: string[],
    message: string
  ): Promise<boolean> {
    try {
      await this.api.post('/verification/peer-review/request', {
        verificationId,
        peerEmails,
        message,
      });
      return true;
    } catch (error) {
      console.error('Failed to submit peer review request:', error);
      return false;
    }
  }

  // Get peer reviews for verification
  async getPeerReviews(verificationId: string): Promise<PeerReview[]> {
    try {
      const response = await this.api.get(`/verification/peer-review/${verificationId}`);
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to get peer reviews:', error);
      return [];
    }
  }

  // Submit peer review
  async submitPeerReview(
    verificationId: string,
    reviewData: {
      status: 'approved' | 'rejected';
      comments: string;
      confidence: number;
      metadata: any;
    }
  ): Promise<PeerReview> {
    try {
      const response = await this.api.post(`/verification/peer-review/${verificationId}/submit`, reviewData);
      return response.data.data;
    } catch (error) {
      console.error('Failed to submit peer review:', error);
      throw new Error('Failed to submit peer review');
    }
  }

  // Government Verification Integration

  // Check government database
  async checkGovernmentDatabase(
    licenseNumber: string,
    issuingCountry: string,
    issuingAuthority: string
  ): Promise<{
    found: boolean;
    status: string;
    details: any;
    lastVerified: string;
  }> {
    try {
      const response = await this.api.post('/verification/government/check', {
        licenseNumber,
        issuingCountry,
        issuingAuthority,
      });
      return response.data.data;
    } catch (error) {
      console.error('Failed to check government database:', error);
      throw new Error('Failed to check government database');
    }
  }

  // Background Check

  // Request background check
  async requestBackgroundCheck(consent: boolean): Promise<{
    requestId: string;
    estimatedCompletion: string;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
  }> {
    try {
      const response = await this.api.post('/verification/background-check/request', { consent });
      return response.data.data;
    } catch (error) {
      console.error('Failed to request background check:', error);
      throw new Error('Failed to request background check');
    }
  }

  // Get background check status
  async getBackgroundCheckStatus(requestId: string): Promise<{
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    progress: number;
    estimatedCompletion: string;
    results?: any;
  }> {
    try {
      const response = await this.api.get(`/verification/background-check/${requestId}/status`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to get background check status:', error);
      throw new Error('Failed to get background check status');
    }
  }

  // Verification Analytics

  // Get verification metrics
  async getVerificationMetrics(): Promise<{
    totalVerifications: number;
    pendingVerifications: number;
    verifiedVerifications: number;
    rejectedVerifications: number;
    averageProcessingTime: number;
    verificationByCountry: Array<{ country: string; count: number }>;
    verificationBySpecialty: Array<{ specialty: string; count: number }>;
    verificationByInstitution: Array<{ institution: string; count: number }>;
  }> {
    try {
      const response = await this.api.get('/verification/metrics');
      return response.data.data;
    } catch (error) {
      console.error('Failed to get verification metrics:', error);
      throw new Error('Failed to get verification metrics');
    }
  }

  // Get verification timeline
  async getVerificationTimeline(): Promise<VerificationEvent[]> {
    try {
      const response = await this.api.get('/verification/timeline');
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to get verification timeline:', error);
      return [];
    }
  }

  // Utility Methods

  // Encrypt sensitive verification data
  private async encryptVerificationData(data: VerificationRequest): Promise<any> {
    try {
      // Encrypt personal information
      const encryptedPersonalInfo = await encryptionService.encryptMessage({
        content: JSON.stringify(data.personalInfo),
        metadata: {
          senderId: 'current_user',
          channelId: 'verification',
          timestamp: new Date().toISOString(),
          messageType: 'personal_data',
        },
      }, 'system_public_key');

      // Encrypt medical credentials
      const encryptedMedicalCredentials = await encryptionService.encryptMessage({
        content: JSON.stringify(data.medicalCredentials),
        metadata: {
          senderId: 'current_user',
          channelId: 'verification',
          timestamp: new Date().toISOString(),
          messageType: 'medical_credentials',
        },
      }, 'system_public_key');

      return {
        ...data,
        personalInfo: encryptedPersonalInfo.encryptedContent,
        medicalCredentials: encryptedMedicalCredentials.encryptedContent,
      };
    } catch (error) {
      console.error('Failed to encrypt verification data:', error);
      throw new Error('Failed to encrypt verification data');
    }
  }

  // Validate verification data
  validateVerificationData(data: VerificationRequest): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required field validation
    if (!data.personalInfo.firstName.trim()) {
      errors.push('First name is required');
    }
    if (!data.personalInfo.lastName.trim()) {
      errors.push('Last name is required');
    }
    if (!data.personalInfo.licenseNumber.trim()) {
      errors.push('Medical license number is required');
    }
    if (!data.personalInfo.issuingCountry.trim()) {
      errors.push('Issuing country is required');
    }
    if (!data.personalInfo.issuingAuthority.trim()) {
      errors.push('Issuing authority is required');
    }

    // Date validation
    const today = new Date();
    const licenseExpiry = new Date(data.personalInfo.licenseExpiryDate);
    if (licenseExpiry <= today) {
      errors.push('Medical license must not be expired');
    }

    // Medical credentials validation
    if (!data.medicalCredentials.medicalDegree.trim()) {
      errors.push('Medical degree is required');
    }
    if (!data.medicalCredentials.medicalSchool.trim()) {
      errors.push('Medical school is required');
    }
    if (!data.medicalCredentials.specialties.length === 0) {
      errors.push('At least one medical specialty is required');
    }

    // Institution validation
    if (!data.institutionAffiliations.primaryInstitution.trim()) {
      errors.push('Primary institution affiliation is required');
    }

    // Document validation
    if (data.documents.length === 0) {
      errors.push('At least one verification document is required');
    }

    // Consent validation
    if (!data.consentAgreements.dataSharing) {
      errors.push('Data sharing consent is required');
    }
    if (!data.consentAgreements.termsOfService) {
      errors.push('Terms of service agreement is required');
    }
    if (!data.consentAgreements.privacyPolicy) {
      errors.push('Privacy policy agreement is required');
    }

    // Warning checks
    if (data.medicalCredentials.experienceYears < 1) {
      warnings.push('Low experience level may affect verification speed');
    }
    if (data.documents.length < 3) {
      warnings.push('Additional documents may speed up verification process');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  // Get verification requirements by country
  async getVerificationRequirements(country: string): Promise<{
    requiredDocuments: string[];
    optionalDocuments: string[];
    processingTime: string;
    fees: any;
    specialRequirements: string[];
  }> {
    try {
      const response = await this.api.get(`/verification/requirements/${country}`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to get verification requirements:', error);
      throw new Error('Failed to get verification requirements');
    }
  }

  // Cache Management

  private cacheVerificationData(data: any, key: string): void {
    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
      };
      localStorage.setItem(`${this.VERIFICATION_CACHE_KEY}_${key}`, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Failed to cache verification data:', error);
    }
  }

  private getCachedVerificationData(key: string): any {
    try {
      const cacheString = localStorage.getItem(`${this.VERIFICATION_CACHE_KEY}_${key}`);
      if (cacheString) {
        const cacheData = JSON.parse(cacheString);
        if (Date.now() - cacheData.timestamp < this.CACHE_EXPIRY) {
          return cacheData.data;
        }
      }
    } catch (error) {
      console.error('Failed to get cached verification data:', error);
    }
    return null;
  }

  private clearVerificationCache(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.VERIFICATION_CACHE_KEY)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Failed to clear verification cache:', error);
    }
  }
}

export const verificationService = new VerificationService();
export default verificationService;



