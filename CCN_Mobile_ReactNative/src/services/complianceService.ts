import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiService } from './api';

export interface HIPAACompliance {
  dataEncryption: boolean;
  accessControls: boolean;
  auditLogging: boolean;
  dataBackup: boolean;
  userAuthentication: boolean;
  sessionManagement: boolean;
  dataTransmission: boolean;
  physicalSecurity: boolean;
}

export interface GDPRCompliance {
  dataMinimization: boolean;
  purposeLimitation: boolean;
  dataRetention: boolean;
  userConsent: boolean;
  dataPortability: boolean;
  rightToErasure: boolean;
  privacyByDesign: boolean;
  breachNotification: boolean;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  outcome: 'success' | 'failure' | 'denied';
  details: any;
  complianceFlags: string[];
}

export interface DataRetentionPolicy {
  messageRetention: number; // days
  fileRetention: number; // days
  auditLogRetention: number; // years
  userDataRetention: number; // days
  backupRetention: number; // years
}

export interface PrivacySettings {
  dataSharing: boolean;
  analytics: boolean;
  marketing: boolean;
  thirdParty: boolean;
  dataExport: boolean;
  dataDeletion: boolean;
}

class ComplianceService {
  private api: ApiService;
  private readonly AUDIT_LOG_KEY = 'ccn_audit_logs';
  private readonly COMPLIANCE_CONFIG_KEY = 'ccn_compliance_config';
  private readonly PRIVACY_SETTINGS_KEY = 'ccn_privacy_settings';

  constructor() {
    this.api = new ApiService();
  }

  // HIPAA Compliance Methods

  // Check HIPAA compliance status
  async checkHIPAACompliance(): Promise<HIPAACompliance> {
    try {
      const response = await this.api.get('/compliance/hipaa/status');
      return response.data.data;
    } catch (error) {
      console.error('Failed to check HIPAA compliance:', error);
      return this.getDefaultHIPAACompliance();
    }
  }

  // Validate HIPAA requirements
  async validateHIPAARequirements(): Promise<{
    compliant: boolean;
    violations: string[];
    recommendations: string[];
  }> {
    try {
      const compliance = await this.checkHIPAACompliance();
      const violations: string[] = [];
      const recommendations: string[] = [];

      // Check data encryption
      if (!compliance.dataEncryption) {
        violations.push('Data encryption not enabled');
        recommendations.push('Enable AES-256 encryption for all PHI data');
      }

      // Check access controls
      if (!compliance.accessControls) {
        violations.push('Access controls not implemented');
        recommendations.push('Implement role-based access control (RBAC)');
      }

      // Check audit logging
      if (!compliance.auditLogging) {
        violations.push('Audit logging not enabled');
        recommendations.push('Enable comprehensive audit logging for all PHI access');
      }

      // Check user authentication
      if (!compliance.userAuthentication) {
        violations.push('User authentication not secure');
        recommendations.push('Implement multi-factor authentication (MFA)');
      }

      // Check session management
      if (!compliance.sessionManagement) {
        violations.push('Session management not secure');
        recommendations.push('Implement secure session timeout and management');
      }

      return {
        compliant: violations.length === 0,
        violations,
        recommendations,
      };
    } catch (error) {
      console.error('HIPAA validation failed:', error);
      return {
        compliant: false,
        violations: ['Validation failed'],
        recommendations: ['Contact system administrator'],
      };
    }
  }

  // GDPR Compliance Methods

  // Check GDPR compliance status
  async checkGDPRCompliance(): Promise<GDPRCompliance> {
    try {
      const response = await this.api.get('/compliance/gdpr/status');
      return response.data.data;
    } catch (error) {
      console.error('Failed to check GDPR compliance:', error);
      return this.getDefaultGDPRCompliance();
    }
  }

  // Validate GDPR requirements
  async validateGDPRRequirements(): Promise<{
    compliant: boolean;
    violations: string[];
    recommendations: string[];
  }> {
    try {
      const compliance = await this.checkGDPRCompliance();
      const violations: string[] = [];
      const recommendations: string[] = [];

      // Check data minimization
      if (!compliance.dataMinimization) {
        violations.push('Data minimization not implemented');
        recommendations.push('Only collect necessary personal data');
      }

      // Check purpose limitation
      if (!compliance.purposeLimitation) {
        violations.push('Purpose limitation not clear');
        recommendations.push('Clearly define data processing purposes');
      }

      // Check user consent
      if (!compliance.userConsent) {
        violations.push('User consent not properly obtained');
        recommendations.push('Implement explicit consent mechanisms');
      }

      // Check data retention
      if (!compliance.dataRetention) {
        violations.push('Data retention policies not defined');
        recommendations.push('Define clear data retention periods');
      }

      return {
        compliant: violations.length === 0,
        violations,
        recommendations,
      };
    } catch (error) {
      console.error('GDPR validation failed:', error);
      return {
        compliant: false,
        violations: ['Validation failed'],
        recommendations: ['Contact system administrator'],
      };
    }
  }

  // Audit Logging Methods

  // Log user action for compliance
  async logAction(action: string, resource: string, resourceId: string, details?: any): Promise<void> {
    try {
      const auditLog: AuditLog = {
        id: this.generateAuditId(),
        userId: 'current_user', // Will be set by caller
        action,
        resource,
        resourceId,
        timestamp: new Date().toISOString(),
        ipAddress: 'local', // Will be set by backend
        userAgent: 'mobile_app',
        outcome: 'success',
        details: details || {},
        complianceFlags: this.getComplianceFlags(action, resource),
      };

      // Store locally first
      await this.storeAuditLog(auditLog);

      // Send to backend
      await this.api.post('/compliance/audit-log', auditLog);
    } catch (error) {
      console.error('Failed to log action:', error);
      // Continue execution even if logging fails
    }
  }

  // Get audit logs
  async getAuditLogs(filters?: {
    userId?: string;
    action?: string;
    resource?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<AuditLog[]> {
    try {
      const queryParams = new URLSearchParams();
      if (filters?.userId) queryParams.append('userId', filters.userId);
      if (filters?.action) queryParams.append('action', filters.action);
      if (filters?.resource) queryParams.append('resource', filters.resource);
      if (filters?.startDate) queryParams.append('startDate', filters.startDate);
      if (filters?.endDate) queryParams.append('endDate', filters.endDate);
      if (filters?.limit) queryParams.append('limit', filters.limit.toString());

      const response = await this.api.get(`/compliance/audit-logs?${queryParams.toString()}`);
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to get audit logs:', error);
      return [];
    }
  }

  // Data Retention Methods

  // Get data retention policy
  async getDataRetentionPolicy(): Promise<DataRetentionPolicy> {
    try {
      const response = await this.api.get('/compliance/data-retention');
      return response.data.data;
    } catch (error) {
      console.error('Failed to get data retention policy:', error);
      return this.getDefaultDataRetentionPolicy();
    }
  }

  // Apply data retention policy
  async applyDataRetentionPolicy(): Promise<{
    deletedRecords: number;
    archivedRecords: number;
    errors: string[];
  }> {
    try {
      const response = await this.api.post('/compliance/data-retention/apply');
      return response.data.data;
    } catch (error) {
      console.error('Failed to apply data retention policy:', error);
      return {
        deletedRecords: 0,
        archivedRecords: 0,
        errors: ['Policy application failed'],
      };
    }
  }

  // Privacy Settings Methods

  // Get user privacy settings
  async getPrivacySettings(): Promise<PrivacySettings> {
    try {
      const settingsString = await AsyncStorage.getItem(this.PRIVACY_SETTINGS_KEY);
      if (settingsString) {
        return JSON.parse(settingsString);
      }
      return this.getDefaultPrivacySettings();
    } catch (error) {
      console.error('Failed to get privacy settings:', error);
      return this.getDefaultPrivacySettings();
    }
  }

  // Update privacy settings
  async updatePrivacySettings(settings: Partial<PrivacySettings>): Promise<void> {
    try {
      const currentSettings = await this.getPrivacySettings();
      const updatedSettings = { ...currentSettings, ...settings };
      
      await AsyncStorage.setItem(this.PRIVACY_SETTINGS_KEY, JSON.stringify(updatedSettings));
      
      // Send to backend
      await this.api.put('/compliance/privacy-settings', updatedSettings);
      
      // Log the change
      await this.logAction('privacy_settings_updated', 'user_preferences', 'current_user', settings);
    } catch (error) {
      console.error('Failed to update privacy settings:', error);
      throw error;
    }
  }

  // Data Subject Rights Methods

  // Request data export (GDPR Article 20)
  async requestDataExport(): Promise<{
    requestId: string;
    estimatedCompletion: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
  }> {
    try {
      const response = await this.api.post('/compliance/data-export');
      return response.data.data;
    } catch (error) {
      console.error('Failed to request data export:', error);
      throw error;
    }
    }

  // Request data deletion (GDPR Article 17)
  async requestDataDeletion(reason?: string): Promise<{
    requestId: string;
    estimatedCompletion: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
  }> {
    try {
      const response = await this.api.post('/compliance/data-deletion', { reason });
      return response.data.data;
    } catch (error) {
      console.error('Failed to request data deletion:', error);
      throw error;
    }
  }

  // Check data deletion status
  async checkDataDeletionStatus(requestId: string): Promise<{
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress?: number;
    estimatedCompletion?: string;
    errors?: string[];
  }> {
    try {
      const response = await this.api.get(`/compliance/data-deletion/${requestId}/status`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to check deletion status:', error);
      throw error;
    }
  }

  // Breach Notification Methods

  // Report data breach
  async reportDataBreach(breachDetails: {
    type: string;
    description: string;
    affectedUsers: number;
    dataTypes: string[];
    discoveryDate: string;
    containmentDate?: string;
  }): Promise<{
    reportId: string;
    status: 'submitted' | 'under_review' | 'investigating' | 'resolved';
    nextSteps: string[];
  }> {
    try {
      const response = await this.api.post('/compliance/breach-report', breachDetails);
      return response.data.data;
    } catch (error) {
      console.error('Failed to report data breach:', error);
      throw error;
    }
  }

  // Compliance Reporting Methods

  // Generate compliance report
  async generateComplianceReport(reportType: 'hipaa' | 'gdpr' | 'combined', dateRange?: {
    startDate: string;
    endDate: string;
  }): Promise<{
    reportId: string;
    downloadUrl: string;
    generatedAt: string;
    summary: {
      hipaaCompliant: boolean;
      gdprCompliant: boolean;
      violations: string[];
      recommendations: string[];
    };
  }> {
    try {
      const response = await this.api.post('/compliance/report', {
        reportType,
        dateRange,
      });
      return response.data.data;
    } catch (error) {
      console.error('Failed to generate compliance report:', error);
      throw error;
    }
  }

  // Private Helper Methods

  private generateAuditId(): string {
    return 'audit_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private getComplianceFlags(action: string, resource: string): string[] {
    const flags: string[] = [];
    
    if (resource.includes('phi') || resource.includes('patient')) {
      flags.push('HIPAA');
    }
    
    if (action.includes('export') || action.includes('delete')) {
      flags.push('GDPR');
    }
    
    if (action.includes('access') || action.includes('view')) {
      flags.push('AUDIT');
    }
    
    return flags;
  }

  private async storeAuditLog(auditLog: AuditLog): Promise<void> {
    try {
      const existingLogs = await this.getLocalAuditLogs();
      existingLogs.push(auditLog);
      
      // Keep only last 1000 logs locally
      if (existingLogs.length > 1000) {
        existingLogs.splice(0, existingLogs.length - 1000);
      }
      
      await AsyncStorage.setItem(this.AUDIT_LOG_KEY, JSON.stringify(existingLogs));
    } catch (error) {
      console.error('Failed to store audit log locally:', error);
    }
  }

  private async getLocalAuditLogs(): Promise<AuditLog[]> {
    try {
      const logsString = await AsyncStorage.getItem(this.AUDIT_LOG_KEY);
      return logsString ? JSON.parse(logsString) : [];
    } catch (error) {
      console.error('Failed to get local audit logs:', error);
      return [];
    }
  }

  // Default configurations
  private getDefaultHIPAACompliance(): HIPAACompliance {
    return {
      dataEncryption: true,
      accessControls: true,
      auditLogging: true,
      dataBackup: true,
      userAuthentication: true,
      sessionManagement: true,
      dataTransmission: true,
      physicalSecurity: true,
    };
  }

  private getDefaultGDPRCompliance(): GDPRCompliance {
    return {
      dataMinimization: true,
      purposeLimitation: true,
      dataRetention: true,
      userConsent: true,
      dataPortability: true,
      rightToErasure: true,
      privacyByDesign: true,
      breachNotification: true,
    };
  }

  private getDefaultDataRetentionPolicy(): DataRetentionPolicy {
    return {
      messageRetention: 2555, // 7 years
      fileRetention: 1825, // 5 years
      auditLogRetention: 7, // 7 years
      userDataRetention: 2555, // 7 years
      backupRetention: 10, // 10 years
    };
  }

  private getDefaultPrivacySettings(): PrivacySettings {
    return {
      dataSharing: false,
      analytics: false,
      marketing: false,
      thirdParty: false,
      dataExport: true,
      dataDeletion: true,
    };
  }
}

export const complianceService = new ComplianceService();
export default complianceService;



