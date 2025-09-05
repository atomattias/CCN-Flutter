import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { searchService } from '../services/searchService';
import { complianceService } from '../services/complianceService';
import { owaspSecurityService } from '../services/owaspSecurityService';
import { CustomButton } from '../components/CustomButton';

const { width } = Dimensions.get('window');

export const AnalyticsDashboardScreen: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'security' | 'compliance' | 'usage'>('overview');
  
  // Analytics data
  const [searchAnalytics, setSearchAnalytics] = useState<any>(null);
  const [securityMetrics, setSecurityMetrics] = useState<any>(null);
  const [complianceData, setComplianceData] = useState<any>(null);
  const [usageStats, setUsageStats] = useState<any>(null);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      
      const [search, security, compliance, usage] = await Promise.all([
        searchService.getSearchAnalytics(),
        owaspSecurityService.getSecurityMetrics(),
        complianceService.generateComplianceReport(),
        getUsageStatistics(),
      ]);
      
      setSearchAnalytics(search);
      setSecurityMetrics(security);
      setComplianceData(compliance);
      setUsageStats(usage);
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUsageStatistics = async () => {
    // Mock usage statistics - in real app, this would come from backend
    return {
      totalMessages: 1247,
      totalFiles: 89,
      activeChannels: 12,
      activeUsers: 45,
      messageTrend: [
        { date: '2024-01', count: 120 },
        { date: '2024-02', count: 145 },
        { date: '2024-03', count: 167 },
        { date: '2024-04', count: 189 },
        { date: '2024-05', count: 203 },
        { date: '2024-06', count: 234 },
      ],
      fileUploads: [
        { type: 'PDF', count: 45, percentage: 50.6 },
        { type: 'Images', count: 23, percentage: 25.8 },
        { type: 'Documents', count: 12, percentage: 13.5 },
        { type: 'Other', count: 9, percentage: 10.1 },
      ],
      channelActivity: [
        { name: 'Emergency', messages: 234, files: 12 },
        { name: 'Cardiology', messages: 189, files: 8 },
        { name: 'General', messages: 156, files: 15 },
        { name: 'Admin', messages: 89, files: 5 },
      ],
    };
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAnalyticsData();
    setRefreshing(false);
  };

  const renderOverviewTab = () => (
    <View style={styles.tabContent}>
      {/* Key Metrics */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Ionicons name="chatbubbles" size={32} color="#007AFF" />
          <Text style={styles.metricValue}>{usageStats?.totalMessages || 0}</Text>
          <Text style={styles.metricLabel}>Total Messages</Text>
        </View>
        
        <View style={styles.metricCard}>
          <Ionicons name="document" size={32} color="#34C759" />
          <Text style={styles.metricValue}>{usageStats?.totalFiles || 0}</Text>
          <Text style={styles.metricLabel}>Total Files</Text>
        </View>
        
        <View style={styles.metricCard}>
          <Ionicons name="people" size={32} color="#FF9500" />
          <Text style={styles.metricValue}>{usageStats?.activeUsers || 0}</Text>
          <Text style={styles.metricLabel}>Active Users</Text>
        </View>
        
        <View style={styles.metricCard}>
          <Ionicons name="search" size={32} color="#AF52DE" />
          <Text style={styles.metricValue}>{searchAnalytics?.totalSearches || 0}</Text>
          <Text style={styles.metricLabel}>Total Searches</Text>
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityList}>
          <View style={styles.activityItem}>
            <Ionicons name="chatbubble" size={20} color="#007AFF" />
            <Text style={styles.activityText}>New message in Emergency channel</Text>
            <Text style={styles.activityTime}>2 min ago</Text>
          </View>
          <View style={styles.activityItem}>
            <Ionicons name="document" size={20} color="#34C759" />
            <Text style={styles.activityText}>File uploaded: patient_report.pdf</Text>
            <Text style={styles.activityTime}>15 min ago</Text>
          </View>
          <View style={styles.activityItem}>
            <Ionicons name="person-add" size={20} color="#FF9500" />
            <Text style={styles.activityText}>New user joined: Dr. Smith</Text>
            <Text style={styles.activityTime}>1 hour ago</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <CustomButton
            title="Generate Report"
            onPress={() => Alert.alert('Generate Report', 'Report generation coming soon')}
            variant="secondary"
            icon="document-text"
          />
          <CustomButton
            title="Export Data"
            onPress={() => Alert.alert('Export Data', 'Data export coming soon')}
            variant="outline"
            icon="download"
          />
        </View>
      </View>
    </View>
  );

  const renderSecurityTab = () => (
    <View style={styles.tabContent}>
      {/* Security Score */}
      <View style={styles.securityScoreCard}>
        <View style={styles.scoreHeader}>
          <Text style={styles.scoreTitle}>Security Score</Text>
          <View style={[styles.scoreCircle, { backgroundColor: '#34C759' }]}>
            <Text style={styles.scoreValue}>92</Text>
            <Text style={styles.scoreUnit}>/100</Text>
          </View>
        </View>
        <Text style={styles.scoreDescription}>
          Excellent security posture with minor recommendations
        </Text>
      </View>

      {/* Security Metrics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security Metrics</Text>
        
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>OWASP Compliance</Text>
          <View style={styles.metricBar}>
            <View style={[styles.metricBarFill, { width: '95%', backgroundColor: '#34C759' }]} />
          </View>
          <Text style={styles.metricPercentage}>95%</Text>
        </View>
        
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Encryption Coverage</Text>
          <View style={styles.metricBar}>
            <View style={[styles.metricBarFill, { width: '98%', backgroundColor: '#34C759' }]} />
          </View>
          <Text style={styles.metricPercentage}>98%</Text>
        </View>
        
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Access Control</Text>
          <View style={styles.metricBar}>
            <View style={[styles.metricBarFill, { width: '88%', backgroundColor: '#FF9500' }]} />
          </View>
          <Text style={styles.metricPercentage}>88%</Text>
        </View>
      </View>

      {/* Recent Vulnerabilities */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Security Scans</Text>
        <View style={styles.vulnerabilityList}>
          <View style={styles.vulnerabilityItem}>
            <Ionicons name="checkmark-circle" size={20} color="#34C759" />
            <Text style={styles.vulnerabilityText}>No critical vulnerabilities found</Text>
            <Text style={styles.vulnerabilityTime}>Last scan: 2 hours ago</Text>
          </View>
          <View style={styles.vulnerabilityItem}>
            <Ionicons name="warning" size={20} color="#FF9500" />
            <Text style={styles.vulnerabilityText}>2 minor security warnings</Text>
            <Text style={styles.vulnerabilityTime}>Last scan: 2 hours ago</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderComplianceTab = () => (
    <View style={styles.tabContent}>
      {/* Compliance Status */}
      <View style={styles.complianceStatusCard}>
        <View style={styles.statusHeader}>
          <Text style={styles.statusTitle}>Compliance Status</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeText}>Compliant</Text>
          </View>
        </View>
        
        <View style={styles.complianceGrid}>
          <View style={styles.complianceItem}>
            <Ionicons name="checkmark-circle" size={24} color="#34C759" />
            <Text style={styles.complianceLabel}>HIPAA</Text>
            <Text style={styles.complianceStatus}>✓ Compliant</Text>
          </View>
          
          <View style={styles.complianceItem}>
            <Ionicons name="checkmark-circle" size={24} color="#34C759" />
            <Text style={styles.complianceLabel}>GDPR</Text>
            <Text style={styles.complianceStatus}>✓ Compliant</Text>
          </View>
          
          <View style={styles.complianceItem}>
            <Ionicons name="checkmark-circle" size={24} color="#34C759" />
            <Text style={styles.complianceLabel}>SOC 2</Text>
            <Text style={styles.complianceStatus}>✓ Compliant</Text>
          </View>
          
          <View style={styles.complianceItem}>
            <Ionicons name="checkmark-circle" size={24} color="#34C759" />
            <Text style={styles.complianceLabel}>ISO 27001</Text>
            <Text style={styles.complianceStatus}>✓ Compliant</Text>
          </View>
        </View>
      </View>

      {/* Audit Logs */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Audit Events</Text>
        <View style={styles.auditList}>
          <View style={styles.auditItem}>
            <Ionicons name="shield-checkmark" size={20} color="#34C759" />
            <Text style={styles.auditText}>User authentication successful</Text>
            <Text style={styles.auditTime}>5 min ago</Text>
          </View>
          <View style={styles.auditItem}>
            <Ionicons name="document" size={20} color="#007AFF" />
            <Text style={styles.auditText}>File access logged</Text>
            <Text style={styles.auditTime}>12 min ago</Text>
          </View>
          <View style={styles.auditItem}>
            <Ionicons name="key" size={20} color="#FF9500" />
            <Text style={styles.auditText}>Role permissions updated</Text>
            <Text style={styles.auditTime}>1 hour ago</Text>
          </View>
        </View>
      </View>

      {/* Data Retention */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Retention Policy</Text>
        <View style={styles.retentionInfo}>
          <Text style={styles.retentionText}>
            • Messages: Retained for 7 years (HIPAA requirement)
          </Text>
          <Text style={styles.retentionText}>
            • Files: Retained for 7 years (HIPAA requirement)
          </Text>
          <Text style={styles.retentionText}>
            • User logs: Retained for 2 years (GDPR requirement)
          </Text>
          <Text style={styles.retentionText}>
            • Audit trails: Retained indefinitely (Compliance requirement)
          </Text>
        </View>
      </View>
    </View>
  );

  const renderUsageTab = () => (
    <View style={styles.tabContent}>
      {/* Usage Trends */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Message Activity Trend</Text>
        <View style={styles.trendChart}>
          {usageStats?.messageTrend?.map((month: any, index: number) => (
            <View key={index} style={styles.trendBar}>
              <View style={[styles.trendBarFill, { height: `${(month.count / 250) * 100}%` }]} />
              <Text style={styles.trendLabel}>{month.date}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* File Uploads by Type */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>File Uploads by Type</Text>
        <View style={styles.fileTypeList}>
          {usageStats?.fileUploads?.map((fileType: any, index: number) => (
            <View key={index} style={styles.fileTypeItem}>
              <View style={styles.fileTypeInfo}>
                <Text style={styles.fileTypeName}>{fileType.type}</Text>
                <Text style={styles.fileTypeCount}>{fileType.count} files</Text>
              </View>
              <View style={styles.fileTypeBar}>
                <View style={[styles.fileTypeBarFill, { width: `${fileType.percentage}%` }]} />
              </View>
              <Text style={styles.fileTypePercentage}>{fileType.percentage}%</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Channel Activity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Channel Activity</Text>
        <View style={styles.channelList}>
          {usageStats?.channelActivity?.map((channel: any, index: number) => (
            <View key={index} style={styles.channelItem}>
              <View style={styles.channelInfo}>
                <Text style={styles.channelName}>{channel.name}</Text>
                <Text style={styles.channelStats}>
                  {channel.messages} messages • {channel.files} files
                </Text>
              </View>
              <View style={styles.channelActivity}>
                <View style={[styles.activityIndicator, { opacity: channel.messages > 150 ? 1 : 0.5 }]} />
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading Analytics...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="analytics" size={32} color="#007AFF" />
        <Text style={styles.title}>Analytics Dashboard</Text>
        <Text style={styles.subtitle}>Monitor your healthcare communication metrics</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabNavigation}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
          onPress={() => setActiveTab('overview')}
        >
          <Ionicons
            name="grid"
            size={20}
            color={activeTab === 'overview' ? '#007AFF' : '#8E8E93'}
          />
          <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
            Overview
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'security' && styles.activeTab]}
          onPress={() => setActiveTab('security')}
        >
          <Ionicons
            name="shield-checkmark"
            size={20}
            color={activeTab === 'security' ? '#007AFF' : '#8E8E93'}
          />
          <Text style={[styles.tabText, activeTab === 'security' && styles.activeTabText]}>
            Security
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'compliance' && styles.activeTab]}
          onPress={() => setActiveTab('compliance')}
        >
          <Ionicons
            name="checkmark-circle"
            size={20}
            color={activeTab === 'compliance' ? '#007AFF' : '#8E8E93'}
          />
          <Text style={[styles.tabText, activeTab === 'compliance' && styles.activeTabText]}>
            Compliance
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'usage' && styles.activeTab]}
          onPress={() => setActiveTab('usage')}
        >
          <Ionicons
            name="trending-up"
            size={20}
            color={activeTab === 'usage' ? '#007AFF' : '#8E8E93'}
          />
          <Text style={[styles.tabText, activeTab === 'usage' && styles.activeTabText]}>
            Usage
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'security' && renderSecurityTab()}
        {activeTab === 'compliance' && renderComplianceTab()}
        {activeTab === 'usage' && renderUsageTab()}
      </ScrollView>
    </View>
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
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
  tabNavigation: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  metricCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    width: (width - 44) / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: 8,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  activityList: {
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  activityText: {
    flex: 1,
    fontSize: 14,
    color: '#000000',
  },
  activityTime: {
    fontSize: 12,
    color: '#8E8E93',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  securityScoreCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  scoreTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  scoreCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  scoreUnit: {
    fontSize: 12,
    color: 'white',
  },
  scoreDescription: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  metricLabel: {
    flex: 1,
    fontSize: 14,
    color: '#000000',
  },
  metricBar: {
    flex: 2,
    height: 8,
    backgroundColor: '#F2F2F7',
    borderRadius: 4,
    marginHorizontal: 12,
  },
  metricBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  metricPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    minWidth: 40,
    textAlign: 'right',
  },
  vulnerabilityList: {
    gap: 12,
  },
  vulnerabilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  vulnerabilityText: {
    flex: 1,
    fontSize: 14,
    color: '#000000',
  },
  vulnerabilityTime: {
    fontSize: 12,
    color: '#8E8E93',
  },
  complianceStatusCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  statusBadge: {
    backgroundColor: '#34C759',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusBadgeText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  complianceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  complianceItem: {
    alignItems: 'center',
    width: (width - 72) / 2,
  },
  complianceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginTop: 8,
    marginBottom: 4,
  },
  complianceStatus: {
    fontSize: 12,
    color: '#34C759',
    fontWeight: '600',
  },
  auditList: {
    gap: 12,
  },
  auditItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  auditText: {
    flex: 1,
    fontSize: 14,
    color: '#000000',
  },
  auditTime: {
    fontSize: 12,
    color: '#8E8E93',
  },
  retentionInfo: {
    gap: 8,
  },
  retentionText: {
    fontSize: 14,
    color: '#000000',
    lineHeight: 20,
  },
  trendChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 120,
    gap: 8,
  },
  trendBar: {
    flex: 1,
    alignItems: 'center',
  },
  trendBarFill: {
    width: 20,
    backgroundColor: '#007AFF',
    borderRadius: 4,
    marginBottom: 8,
  },
  trendLabel: {
    fontSize: 10,
    color: '#8E8E93',
    textAlign: 'center',
  },
  fileTypeList: {
    gap: 12,
  },
  fileTypeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  fileTypeInfo: {
    flex: 1,
  },
  fileTypeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  fileTypeCount: {
    fontSize: 12,
    color: '#8E8E93',
  },
  fileTypeBar: {
    flex: 2,
    height: 8,
    backgroundColor: '#F2F2F7',
    borderRadius: 4,
  },
  fileTypeBarFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  fileTypePercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    minWidth: 40,
    textAlign: 'right',
  },
  channelList: {
    gap: 12,
  },
  channelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  channelInfo: {
    flex: 1,
  },
  channelName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  channelStats: {
    fontSize: 12,
    color: '#8E8E93',
  },
  channelActivity: {
    marginLeft: 12,
  },
  activityIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#34C759',
  },
});



