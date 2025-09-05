import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { encryptionService } from '../services/encryptionService';
import { complianceService } from '../services/complianceService';
import { owaspSecurityService } from '../services/owaspSecurityService';
import { CustomButton } from '../components/CustomButton';

export const SecurityDashboardScreen: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [encryptionStatus, setEncryptionStatus] = useState<any>(null);
  const [hipaaCompliance, setHipaaCompliance] = useState<any>(null);
  const [gdprCompliance, setGdprCompliance] = useState<any>(null);
  const [securityMetrics, setSecurityMetrics] = useState<any>(null);
  const [vulnerabilities, setVulnerabilities] = useState<any[]>([]);

  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = async () => {
    try {
      setLoading(true);
      
      // Load encryption compliance
      const encryptionCompliance = await encryptionService.validateCompliance();
      setEncryptionStatus(encryptionCompliance);

      // Load HIPAA compliance
      const hipaa = await complianceService.checkHIPAACompliance();
      setHipaaCompliance(hipaa);

      // Load GDPR compliance
      const gdpr = await complianceService.checkGDPRCompliance();
      setGdprCompliance(gdpr);

      // Load security metrics
      const metrics = await owaspSecurityService.getSecurityMetrics();
      setSecurityMetrics(metrics);

      // Load recent vulnerabilities
      const recentScans = await owaspSecurityService.getSecurityScanHistory();
      if (recentScans.length > 0) {
        const latestScan = recentScans[recentScans.length - 1];
        setVulnerabilities(latestScan.vulnerabilities || []);
      }

    } catch (error) {
      console.error('Failed to load security data:', error);
      Alert.alert('Error', 'Failed to load security data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSecurityData();
    setRefreshing(false);
  };

  const runSecurityScan = async () => {
    try {
      Alert.alert(
        'Security Scan',
        'This will run a comprehensive security scan. Continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Run Scan',
            onPress: async () => {
              setLoading(true);
              try {
                const scan = await owaspSecurityService.runSecurityScan();
                setVulnerabilities(scan.vulnerabilities || []);
                Alert.alert('Scan Complete', `Found ${scan.vulnerabilities.length} vulnerabilities`);
              } catch (error) {
                Alert.alert('Scan Failed', 'Failed to run security scan');
              } finally {
                setLoading(false);
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Security scan failed:', error);
    }
  };

  const generateComplianceReport = async () => {
    try {
      setLoading(true);
      const report = await complianceService.generateComplianceReport('combined');
      Alert.alert(
        'Report Generated',
        `Report ID: ${report.reportId}\nStatus: ${report.summary.hipaaCompliant ? 'HIPAA Compliant' : 'HIPAA Violations'}\nGDPR: ${report.summary.gdprCompliant ? 'Compliant' : 'Violations'}`
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to generate compliance report');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading Security Dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Security Dashboard</Text>
        <Text style={styles.subtitle}>Healthcare Compliance & Security Status</Text>
      </View>

      {/* Encryption Status */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="shield-checkmark" size={24} color="#34C759" />
          <Text style={styles.sectionTitle}>End-to-End Encryption</Text>
        </View>
        
        {encryptionStatus && (
          <View style={styles.statusGrid}>
            <View style={[styles.statusItem, { backgroundColor: encryptionStatus.hipaa ? '#34C759' : '#FF3B30' }]}>
              <Text style={styles.statusText}>HIPAA</Text>
              <Text style={styles.statusValue}>{encryptionStatus.hipaa ? '✓' : '✗'}</Text>
            </View>
            <View style={[styles.statusItem, { backgroundColor: encryptionStatus.gdpr ? '#34C759' : '#FF3B30' }]}>
              <Text style={styles.statusText}>GDPR</Text>
              <Text style={styles.statusValue}>{encryptionStatus.gdpr ? '✓' : '✗'}</Text>
            </View>
            <View style={[styles.statusItem, { backgroundColor: encryptionStatus.owasp ? '#34C759' : '#FF3B30' }]}>
              <Text style={styles.statusText}>OWASP</Text>
              <Text style={styles.statusValue}>{encryptionStatus.owasp ? '✓' : '✗'}</Text>
            </View>
          </View>
        )}
      </View>

      {/* HIPAA Compliance */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="medical" size={24} color="#007AFF" />
          <Text style={styles.sectionTitle}>HIPAA Compliance</Text>
        </View>
        
        {hipaaCompliance && (
          <View style={styles.complianceGrid}>
            {Object.entries(hipaaCompliance).map(([key, value]) => (
              <View key={key} style={styles.complianceItem}>
                <Text style={styles.complianceLabel}>
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </Text>
                <View style={[styles.complianceStatus, { backgroundColor: value ? '#34C759' : '#FF3B30' }]}>
                  <Ionicons name={value ? 'checkmark' : 'close'} size={16} color="white" />
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* GDPR Compliance */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="globe" size={24} color="#AF52DE" />
          <Text style={styles.sectionTitle}>GDPR Compliance</Text>
        </View>
        
        {gdprCompliance && (
          <View style={styles.complianceGrid}>
            {Object.entries(gdprCompliance).map(([key, value]) => (
              <View key={key} style={styles.complianceItem}>
                <Text style={styles.complianceLabel}>
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </Text>
                <View style={[styles.complianceStatus, { backgroundColor: value ? '#34C759' : '#FF3B30' }]}>
                  <Ionicons name={value ? 'checkmark' : 'close'} size={16} color="white" />
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Security Metrics */}
      {securityMetrics && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="analytics" size={24} color="#FF9500" />
            <Text style={styles.sectionTitle}>Security Metrics</Text>
          </View>
          
          <View style={styles.metricsGrid}>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{securityMetrics.totalScans}</Text>
              <Text style={styles.metricLabel}>Total Scans</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{securityMetrics.vulnerabilitiesFound}</Text>
              <Text style={styles.metricLabel}>Vulnerabilities</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{securityMetrics.vulnerabilitiesFixed}</Text>
              <Text style={styles.metricLabel}>Fixed</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{securityMetrics.complianceScore}%</Text>
              <Text style={styles.metricLabel}>Compliance</Text>
            </View>
          </View>
        </View>
      )}

      {/* Recent Vulnerabilities */}
      {vulnerabilities.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="warning" size={24} color="#FF3B30" />
            <Text style={styles.sectionTitle}>Recent Vulnerabilities</Text>
          </View>
          
          {vulnerabilities.slice(0, 5).map((vuln, index) => (
            <View key={index} style={styles.vulnerabilityItem}>
              <View style={styles.vulnerabilityHeader}>
                <Text style={styles.vulnerabilityType}>{vuln.type.replace(/_/g, ' ').toUpperCase()}</Text>
                <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(vuln.severity) }]}>
                  <Text style={styles.severityText}>{vuln.severity}</Text>
                </View>
              </View>
              <Text style={styles.vulnerabilityDescription}>{vuln.description}</Text>
              <Text style={styles.vulnerabilityComponent}>Component: {vuln.affectedComponent}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionsSection}>
        <CustomButton
          title="Run Security Scan"
          onPress={runSecurityScan}
          variant="primary"
          size="large"
        />
        
        <CustomButton
          title="Generate Compliance Report"
          onPress={generateComplianceReport}
          variant="secondary"
          size="large"
        />
        
        <CustomButton
          title="View Audit Logs"
          onPress={() => Alert.alert('Audit Logs', 'Navigate to audit logs screen')}
          variant="outline"
          size="large"
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Last updated: {new Date().toLocaleString()}
        </Text>
        <Text style={styles.footerText}>
          User: {user?.email || 'Unknown'}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8E8E93',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
  },
  section: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginLeft: 12,
  },
  statusGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statusItem: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    minWidth: 80,
  },
  statusText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  statusValue: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  complianceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  complianceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '48%',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  complianceLabel: {
    fontSize: 14,
    color: '#000000',
    flex: 1,
  },
  complianceStatus: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  metricItem: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
  },
  vulnerabilityItem: {
    backgroundColor: '#F2F2F7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  vulnerabilityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  vulnerabilityType: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF3B30',
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  severityText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
    textTransform: 'uppercase',
  },
  vulnerabilityDescription: {
    fontSize: 14,
    color: '#000000',
    marginBottom: 4,
  },
  vulnerabilityComponent: {
    fontSize: 12,
    color: '#8E8E93',
  },
  actionsSection: {
    margin: 16,
    gap: 12,
  },
  footer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    alignItems: 'center',
    marginTop: 16,
  },
  footerText: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
  },
});

// Helper function for severity colors
const getSeverityColor = (severity: string): string => {
  switch (severity.toLowerCase()) {
    case 'critical':
      return '#FF3B30';
    case 'high':
      return '#FF9500';
    case 'medium':
      return '#FFCC00';
    case 'low':
      return '#34C759';
    default:
      return '#8E8E93';
  }
};



