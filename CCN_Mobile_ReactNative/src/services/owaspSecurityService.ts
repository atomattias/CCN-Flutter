import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiService } from './api';

export interface SecurityVulnerability {
  id: string;
  type: 'injection' | 'broken_auth' | 'sensitive_data' | 'xxe' | 'broken_access' | 'security_misconfig' | 'xss' | 'insecure_deserialization' | 'vulnerable_components' | 'insufficient_logging';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedComponent: string;
  detectionDate: string;
  status: 'open' | 'investigating' | 'mitigated' | 'closed';
  remediation: string;
  cveId?: string;
}

export interface SecurityScan {
  id: string;
  timestamp: string;
  vulnerabilities: SecurityVulnerability[];
  summary: {
    totalVulnerabilities: number;
    criticalCount: number;
    highCount: number;
    mediumCount: number;
    lowCount: number;
    riskScore: number;
  };
  recommendations: string[];
}

export interface SecurityConfig {
  inputValidation: boolean;
  outputEncoding: boolean;
  sqlInjectionProtection: boolean;
  xssProtection: boolean;
  csrfProtection: boolean;
  rateLimiting: boolean;
  sessionSecurity: boolean;
  fileUploadSecurity: boolean;
  apiSecurity: boolean;
  loggingSecurity: boolean;
}

export interface SecurityMetrics {
  totalScans: number;
  vulnerabilitiesFound: number;
  vulnerabilitiesFixed: number;
  averageRiskScore: number;
  lastScanDate: string;
  complianceScore: number;
}

class OWASPSecurityService {
  private api: ApiService;
  private readonly SECURITY_CONFIG_KEY = 'ccn_security_config';
  private readonly VULNERABILITY_LOG_KEY = 'ccn_vulnerability_log';
  private readonly SECURITY_SCAN_KEY = 'ccn_security_scans';

  constructor() {
    this.api = new ApiService();
  }

  // OWASP Top 10 Security Implementation

  // 1. Injection Prevention
  async validateInput(input: string, type: 'text' | 'email' | 'url' | 'number' | 'sql'): Promise<{
    valid: boolean;
    sanitized: string;
    risks: string[];
  }> {
    const risks: string[] = [];
    let sanitized = input;

    try {
      // SQL Injection Prevention
      if (type === 'sql') {
        const sqlPatterns = [
          /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT|SCRIPT>)\b)/i,
          /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i,
          /(\b(OR|AND)\s+['"]\w+['"]\s*=\s*['"]\w+['"])/i,
          /(--|\/\*|\*\/|xp_|sp_)/i,
        ];

        for (const pattern of sqlPatterns) {
          if (pattern.test(input)) {
            risks.push('Potential SQL injection detected');
            sanitized = this.sanitizeSQLInput(input);
          }
        }
      }

      // XSS Prevention
      if (type === 'text' || type === 'url') {
        const xssPatterns = [
          /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
          /javascript:/gi,
          /on\w+\s*=/gi,
          /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
          /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
        ];

        for (const pattern of xssPatterns) {
          if (pattern.test(input)) {
            risks.push('Potential XSS attack detected');
            sanitized = this.sanitizeXSSInput(input);
          }
        }
      }

      // Email Validation
      if (type === 'email') {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(input)) {
          risks.push('Invalid email format');
          sanitized = '';
        }
      }

      // URL Validation
      if (type === 'url') {
        try {
          new URL(input);
        } catch {
          risks.push('Invalid URL format');
          sanitized = '';
        }
      }

      // Number Validation
      if (type === 'number') {
        if (isNaN(Number(input))) {
          risks.push('Invalid number format');
          sanitized = '';
        }
      }

      return {
        valid: risks.length === 0,
        sanitized,
        risks,
      };
    } catch (error) {
      console.error('Input validation failed:', error);
      return {
        valid: false,
        sanitized: '',
        risks: ['Input validation error'],
      };
    }
  }

  // 2. Broken Authentication Prevention
  async validateAuthentication(credentials: {
    username: string;
    password: string;
  }): Promise<{
    valid: boolean;
    risks: string[];
    recommendations: string[];
  }> {
    const risks: string[] = [];
    const recommendations: string[] = [];

    try {
      // Username validation
      if (credentials.username.length < 3) {
        risks.push('Username too short');
        recommendations.push('Username should be at least 3 characters long');
      }

      if (credentials.username.length > 50) {
        risks.push('Username too long');
        recommendations.push('Username should not exceed 50 characters');
      }

      // Password strength validation
      const passwordStrength = this.validatePasswordStrength(credentials.password);
      if (passwordStrength.score < 3) {
        risks.push('Weak password detected');
        recommendations.push(...passwordStrength.recommendations);
      }

      // Check for common weak passwords
      if (this.isCommonPassword(credentials.password)) {
        risks.push('Common password detected');
        recommendations.push('Avoid using common passwords');
      }

      return {
        valid: risks.length === 0,
        risks,
        recommendations,
      };
    } catch (error) {
      console.error('Authentication validation failed:', error);
      return {
        valid: false,
        risks: ['Authentication validation error'],
        recommendations: ['Contact system administrator'],
      };
    }
  }

  // 3. Sensitive Data Exposure Prevention
  async validateDataProtection(data: any): Promise<{
    secure: boolean;
    risks: string[];
    recommendations: string[];
  }> {
    const risks: string[] = [];
    const recommendations: string[] = [];

    try {
      // Check for sensitive data patterns
      const sensitivePatterns = [
        /\b\d{3}-\d{2}-\d{4}\b/, // SSN
        /\b\d{4}-\d{4}-\d{4}-\d{4}\b/, // Credit card
        /\b\d{10,11}\b/, // Phone numbers
        /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email
        /\b\d{5}(-\d{4})?\b/, // ZIP codes
      ];

      const dataString = JSON.stringify(data);
      for (const pattern of sensitivePatterns) {
        if (pattern.test(dataString)) {
          risks.push('Sensitive data pattern detected');
          recommendations.push('Ensure sensitive data is properly encrypted');
        }
      }

      // Check for plain text passwords
      if (dataString.toLowerCase().includes('password') && 
          typeof data.password === 'string' && 
          data.password.length > 0) {
        risks.push('Password in plain text detected');
        recommendations.push('Never store or transmit passwords in plain text');
      }

      return {
        secure: risks.length === 0,
        risks,
        recommendations,
      };
    } catch (error) {
      console.error('Data protection validation failed:', error);
      return {
        secure: false,
        risks: ['Data protection validation error'],
        recommendations: ['Contact system administrator'],
      };
    }
  }

  // 4. XML External Entity (XXE) Prevention
  async validateXMLInput(xmlContent: string): Promise<{
    safe: boolean;
    risks: string[];
    recommendations: string[];
  }> {
    const risks: string[] = [];
    const recommendations: string[] = [];

    try {
      // Check for XXE patterns
      const xxePatterns = [
        /<!DOCTYPE\s+[^>]*SYSTEM\s+[^>]*>/i,
        /<!ENTITY\s+[^>]*SYSTEM\s+[^>]*>/i,
        /<!ENTITY\s+[^>]*PUBLIC\s+[^>]*>/i,
        /<!ENTITY\s+[^>]*file:/i,
        /<!ENTITY\s+[^>]*http:/i,
        /<!ENTITY\s+[^>]*ftp:/i,
      ];

      for (const pattern of xxePatterns) {
        if (pattern.test(xmlContent)) {
          risks.push('Potential XXE attack detected');
          recommendations.push('Disable external entity processing');
        }
      }

      return {
        safe: risks.length === 0,
        risks,
        recommendations,
      };
    } catch (error) {
      console.error('XML validation failed:', error);
      return {
        safe: false,
        risks: ['XML validation error'],
        recommendations: ['Contact system administrator'],
      };
    }
  }

  // 5. Broken Access Control Prevention
  async validateAccessControl(userId: string, resourceId: string, action: string): Promise<{
    authorized: boolean;
    risks: string[];
    recommendations: string[];
  }> {
    const risks: string[] = [];
    const recommendations: string[] = [];

    try {
      // Check if user has permission for this action
      const hasPermission = await this.checkUserPermission(userId, resourceId, action);
      
      if (!hasPermission) {
        risks.push('Unauthorized access attempt detected');
        recommendations.push('Implement proper access control checks');
      }

      // Check for horizontal privilege escalation
      if (await this.isHorizontalPrivilegeEscalation(userId, resourceId)) {
        risks.push('Potential horizontal privilege escalation');
        recommendations.push('Validate resource ownership');
      }

      // Check for vertical privilege escalation
      if (await this.isVerticalPrivilegeEscalation(userId, action)) {
        risks.push('Potential vertical privilege escalation');
        recommendations.push('Implement role-based access control');
      }

      return {
        authorized: risks.length === 0,
        risks,
        recommendations,
      };
    } catch (error) {
      console.error('Access control validation failed:', error);
      return {
        authorized: false,
        risks: ['Access control validation error'],
        recommendations: ['Contact system administrator'],
      };
    }
  }

  // 6. Security Misconfiguration Prevention
  async validateSecurityConfiguration(): Promise<{
    secure: boolean;
    risks: string[];
    recommendations: string[];
  }> {
    const risks: string[] = [];
    const recommendations: string[] = [];

    try {
      const config = await this.getSecurityConfig();

      if (!config.inputValidation) {
        risks.push('Input validation not enabled');
        recommendations.push('Enable input validation for all user inputs');
      }

      if (!config.outputEncoding) {
        risks.push('Output encoding not enabled');
        recommendations.push('Enable output encoding to prevent XSS');
      }

      if (!config.sqlInjectionProtection) {
        risks.push('SQL injection protection not enabled');
        recommendations.push('Use parameterized queries and input validation');
      }

      if (!config.xssProtection) {
        risks.push('XSS protection not enabled');
        recommendations.push('Enable XSS protection headers and output encoding');
      }

      if (!config.csrfProtection) {
        risks.push('CSRF protection not enabled');
        recommendations.push('Implement CSRF tokens and validation');
      }

      if (!config.rateLimiting) {
        risks.push('Rate limiting not enabled');
        recommendations.push('Implement rate limiting to prevent abuse');
      }

      return {
        secure: risks.length === 0,
        risks,
        recommendations,
      };
    } catch (error) {
      console.error('Security configuration validation failed:', error);
      return {
        secure: false,
        risks: ['Security configuration validation error'],
        recommendations: ['Contact system administrator'],
      };
    }
  }

  // 7. Cross-Site Scripting (XSS) Prevention
  async preventXSS(input: string): Promise<string> {
    try {
      return this.sanitizeXSSInput(input);
    } catch (error) {
      console.error('XSS prevention failed:', error);
      return '';
    }
  }

  // 8. Insecure Deserialization Prevention
  async validateSerializedData(data: string): Promise<{
    safe: boolean;
    risks: string[];
    recommendations: string[];
  }> {
    const risks: string[] = [];
    const recommendations: string[] = [];

    try {
      // Check for potentially dangerous serialized data patterns
      const dangerousPatterns = [
        /O:\d+:"[^"]*":\d+:\{[^}]*\}/, // PHP object serialization
        /rO0ABXNy/, // Java serialization
        /\x00\x00\x00/, // Binary serialization
      ];

      for (const pattern of dangerousPatterns) {
        if (pattern.test(data)) {
          risks.push('Potentially dangerous serialized data detected');
          recommendations.push('Validate and sanitize all serialized data');
        }
      }

      return {
        safe: risks.length === 0,
        risks,
        recommendations,
      };
    } catch (error) {
      console.error('Serialized data validation failed:', error);
      return {
        safe: false,
        risks: ['Serialized data validation error'],
        recommendations: ['Contact system administrator'],
      };
    }
  }

  // 9. Vulnerable Components Prevention
  async checkVulnerableComponents(): Promise<{
    vulnerable: boolean;
    components: Array<{
      name: string;
      version: string;
      vulnerability: string;
      severity: string;
      recommendation: string;
    }>;
  }> {
    try {
      const response = await this.api.get('/security/vulnerable-components');
      return response.data.data;
    } catch (error) {
      console.error('Failed to check vulnerable components:', error);
      return {
        vulnerable: false,
        components: [],
      };
    }
  }

  // 10. Insufficient Logging Prevention
  async validateLogging(): Promise<{
    adequate: boolean;
    risks: string[];
    recommendations: string[];
  }> {
    const risks: string[] = [];
    const recommendations: string[] = [];

    try {
      // Check if security events are being logged
      const securityEvents = await this.getSecurityEventLogs();
      
      if (securityEvents.length === 0) {
        risks.push('No security events being logged');
        recommendations.push('Enable comprehensive security event logging');
      }

      // Check log retention
      const logRetention = await this.getLogRetentionPolicy();
      if (logRetention < 90) {
        risks.push('Insufficient log retention period');
        recommendations.push('Maintain logs for at least 90 days');
      }

      return {
        adequate: risks.length === 0,
        risks,
        recommendations,
      };
    } catch (error) {
      console.error('Logging validation failed:', error);
      return {
        adequate: false,
        risks: ['Logging validation error'],
        recommendations: ['Contact system administrator'],
      };
    }
  }

  // Security Scanning Methods

  // Run comprehensive security scan
  async runSecurityScan(): Promise<SecurityScan> {
    try {
      const response = await this.api.post('/security/scan');
      const scan = response.data.data;
      
      // Store scan results locally
      await this.storeSecurityScan(scan);
      
      return scan;
    } catch (error) {
      console.error('Security scan failed:', error);
      throw new Error('Security scan failed');
    }
  }

  // Get security scan history
  async getSecurityScanHistory(): Promise<SecurityScan[]> {
    try {
      const response = await this.api.get('/security/scans');
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to get security scan history:', error);
      return [];
    }
  }

  // Get security metrics
  async getSecurityMetrics(): Promise<SecurityMetrics> {
    try {
      const response = await this.api.get('/security/metrics');
      return response.data.data;
    } catch (error) {
      console.error('Failed to get security metrics:', error);
      throw new Error('Failed to get security metrics');
    }
  }

  // Private Helper Methods

  private sanitizeSQLInput(input: string): string {
    // Remove or escape dangerous SQL patterns
    return input
      .replace(/['";]/g, '')
      .replace(/\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b/gi, '')
      .replace(/--/g, '')
      .replace(/\/\*/g, '')
      .replace(/\*\//g, '');
  }

  private sanitizeXSSInput(input: string): string {
    // Remove or escape dangerous HTML/JavaScript patterns
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  }

  private validatePasswordStrength(password: string): {
    score: number;
    recommendations: string[];
  } {
    const recommendations: string[] = [];
    let score = 0;

    if (password.length >= 8) score++;
    else recommendations.push('Password should be at least 8 characters long');

    if (/[a-z]/.test(password)) score++;
    else recommendations.push('Password should contain lowercase letters');

    if (/[A-Z]/.test(password)) score++;
    else recommendations.push('Password should contain uppercase letters');

    if (/\d/.test(password)) score++;
    else recommendations.push('Password should contain numbers');

    if (/[^A-Za-z0-9]/.test(password)) score++;
    else recommendations.push('Password should contain special characters');

    return { score, recommendations };
  }

  private isCommonPassword(password: string): boolean {
    const commonPasswords = [
      'password', '123456', '123456789', 'qwerty', 'abc123',
      'password123', 'admin', 'letmein', 'welcome', 'monkey'
    ];
    return commonPasswords.includes(password.toLowerCase());
  }

  private async checkUserPermission(userId: string, resourceId: string, action: string): Promise<boolean> {
    try {
      const response = await this.api.get(`/security/permissions/${userId}/${resourceId}/${action}`);
      return response.data.data.authorized;
    } catch (error) {
      console.error('Permission check failed:', error);
      return false;
    }
  }

  private async isHorizontalPrivilegeEscalation(userId: string, resourceId: string): Promise<boolean> {
    try {
      const response = await this.api.get(`/security/privilege-escalation/horizontal/${userId}/${resourceId}`);
      return response.data.data.escalation;
    } catch (error) {
      console.error('Horizontal privilege escalation check failed:', error);
      return false;
    }
  }

  private async isVerticalPrivilegeEscalation(userId: string, action: string): Promise<boolean> {
    try {
      const response = await this.api.get(`/security/privilege-escalation/vertical/${userId}/${action}`);
      return response.data.data.escalation;
    } catch (error) {
      console.error('Vertical privilege escalation check failed:', error);
      return false;
    }
  }

  private async getSecurityConfig(): Promise<SecurityConfig> {
    try {
      const configString = await AsyncStorage.getItem(this.SECURITY_CONFIG_KEY);
      if (configString) {
        return JSON.parse(configString);
      }
      return this.getDefaultSecurityConfig();
    } catch (error) {
      console.error('Failed to get security config:', error);
      return this.getDefaultSecurityConfig();
    }
  }

  private async getSecurityEventLogs(): Promise<any[]> {
    try {
      const response = await this.api.get('/security/event-logs');
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to get security event logs:', error);
      return [];
    }
  }

  private async getLogRetentionPolicy(): Promise<number> {
    try {
      const response = await this.api.get('/security/log-retention');
      return response.data.data.days || 0;
    } catch (error) {
      console.error('Failed to get log retention policy:', error);
      return 0;
    }
  }

  private async storeSecurityScan(scan: SecurityScan): Promise<void> {
    try {
      const existingScans = await this.getLocalSecurityScans();
      existingScans.push(scan);
      
      // Keep only last 10 scans locally
      if (existingScans.length > 10) {
        existingScans.splice(0, existingScans.length - 10);
      }
      
      await AsyncStorage.setItem(this.SECURITY_SCAN_KEY, JSON.stringify(existingScans));
    } catch (error) {
      console.error('Failed to store security scan locally:', error);
    }
  }

  private async getLocalSecurityScans(): Promise<SecurityScan[]> {
    try {
      const scansString = await AsyncStorage.getItem(this.SECURITY_SCAN_KEY);
      return scansString ? JSON.parse(scansString) : [];
    } catch (error) {
      console.error('Failed to get local security scans:', error);
      return [];
    }
  }

  private getDefaultSecurityConfig(): SecurityConfig {
    return {
      inputValidation: true,
      outputEncoding: true,
      sqlInjectionProtection: true,
      xssProtection: true,
      csrfProtection: true,
      rateLimiting: true,
      sessionSecurity: true,
      fileUploadSecurity: true,
      apiSecurity: true,
      loggingSecurity: true,
    };
  }
}

export const owaspSecurityService = new OWASPSecurityService();
export default owaspSecurityService;



