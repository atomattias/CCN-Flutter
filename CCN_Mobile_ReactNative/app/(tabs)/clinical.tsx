import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ClinicalQuestion {
  id: string;
  title: string;
  specialty: string;
  urgency: 'low' | 'medium' | 'high';
  status: 'open' | 'answered' | 'closed';
  responses: number;
  createdAt: string;
}

export default function ClinicalScreen() {
  const [activeTab, setActiveTab] = useState<'ask' | 'browse'>('ask');
  const [questionTitle, setQuestionTitle] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('general');
  const [selectedUrgency, setSelectedUrgency] = useState<'low' | 'medium' | 'high'>('medium');

  const [questions] = useState<ClinicalQuestion[]>([
    {
      id: '1',
      title: 'Post-operative fever management',
      specialty: 'Surgery',
      urgency: 'high',
      status: 'open',
      responses: 3,
      createdAt: '2 hours ago',
    },
    {
      id: '2',
      title: 'Hypertension in elderly patients',
      specialty: 'Cardiology',
      urgency: 'medium',
      status: 'answered',
      responses: 5,
      createdAt: '1 day ago',
    },
    {
      id: '3',
      title: 'Pediatric vaccination schedule',
      specialty: 'Pediatrics',
      urgency: 'low',
      status: 'closed',
      responses: 8,
      createdAt: '3 days ago',
    },
  ]);

  const specialties = [
    'General Medicine',
    'Cardiology',
    'Surgery',
    'Pediatrics',
    'Emergency Medicine',
    'Neurology',
    'Oncology',
    'Psychiatry',
  ];

  const handleSubmitQuestion = () => {
    if (!questionTitle.trim() || !questionText.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    Alert.alert(
      'Question Submitted',
      'Your clinical question has been submitted and will be reviewed by specialists.',
      [{ text: 'OK', onPress: () => {
        setQuestionTitle('');
        setQuestionText('');
        setSelectedSpecialty('general');
        setSelectedUrgency('medium');
      }}]
    );
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return '#FF3B30';
      case 'medium':
        return '#FF9500';
      case 'low':
        return '#34C759';
      default:
        return '#8E8E93';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return '#007AFF';
      case 'answered':
        return '#34C759';
      case 'closed':
        return '#8E8E93';
      default:
        return '#8E8E93';
    }
  };

  const renderAskTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Ask a Clinical Question</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Question Title *</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Brief description of your question"
            value={questionTitle}
            onChangeText={setQuestionTitle}
            multiline
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Question Details *</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            placeholder="Provide detailed information about the case, symptoms, patient history, etc."
            value={questionText}
            onChangeText={setQuestionText}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Specialty</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.specialtyScroll}>
            {specialties.map((specialty) => (
              <TouchableOpacity
                key={specialty}
                style={[
                  styles.specialtyChip,
                  selectedSpecialty === specialty.toLowerCase().replace(' ', '') && styles.specialtyChipSelected
                ]}
                onPress={() => setSelectedSpecialty(specialty.toLowerCase().replace(' ', ''))}
              >
                <Text style={[
                  styles.specialtyChipText,
                  selectedSpecialty === specialty.toLowerCase().replace(' ', '') && styles.specialtyChipTextSelected
                ]}>
                  {specialty}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Urgency Level</Text>
          <View style={styles.urgencyContainer}>
            {(['low', 'medium', 'high'] as const).map((urgency) => (
              <TouchableOpacity
                key={urgency}
                style={[
                  styles.urgencyButton,
                  selectedUrgency === urgency && styles.urgencyButtonSelected
                ]}
                onPress={() => setSelectedUrgency(urgency)}
              >
                <View style={[styles.urgencyIndicator, { backgroundColor: getUrgencyColor(urgency) }]} />
                <Text style={[
                  styles.urgencyText,
                  selectedUrgency === urgency && styles.urgencyTextSelected
                ]}>
                  {urgency.charAt(0).toUpperCase() + urgency.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmitQuestion}>
          <Text style={styles.submitButtonText}>Submit Question</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderBrowseTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.questionsSection}>
        <Text style={styles.sectionTitle}>Recent Questions</Text>
        
        {questions.map((question) => (
          <View key={question.id} style={styles.questionCard}>
            <View style={styles.questionHeader}>
              <Text style={styles.questionTitle}>{question.title}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(question.status) }]}>
                <Text style={styles.statusText}>{question.status}</Text>
              </View>
            </View>
            
            <View style={styles.questionMeta}>
              <View style={styles.metaItem}>
                <Ionicons name="medical" size={16} color="#8E8E93" />
                <Text style={styles.metaText}>{question.specialty}</Text>
              </View>
              <View style={styles.metaItem}>
                <View style={[styles.urgencyDot, { backgroundColor: getUrgencyColor(question.urgency) }]} />
                <Text style={styles.metaText}>{question.urgency}</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="chatbubble" size={16} color="#8E8E93" />
                <Text style={styles.metaText}>{question.responses} responses</Text>
              </View>
            </View>
            
            <Text style={styles.questionTime}>{question.createdAt}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Clinical Q&A</Text>
        <Text style={styles.subtitle}>Ask questions and get expert medical advice</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'ask' && styles.activeTab]}
          onPress={() => setActiveTab('ask')}
        >
          <Text style={[styles.tabText, activeTab === 'ask' && styles.activeTabText]}>
            Ask Question
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'browse' && styles.activeTab]}
          onPress={() => setActiveTab('browse')}
        >
          <Text style={[styles.tabText, activeTab === 'browse' && styles.activeTabText]}>
            Browse Questions
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'ask' ? renderAskTab() : renderBrowseTab()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#8E8E93',
  },
  activeTabText: {
    color: '#007AFF',
  },
  tabContent: {
    flex: 1,
  },
  formSection: {
    padding: 20,
  },
  questionsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#000000',
  },
  textArea: {
    height: 120,
  },
  specialtyScroll: {
    marginTop: 8,
  },
  specialtyChip: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  specialtyChipSelected: {
    backgroundColor: '#007AFF',
  },
  specialtyChipText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  specialtyChipTextSelected: {
    color: '#FFFFFF',
  },
  urgencyContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  urgencyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  urgencyButtonSelected: {
    backgroundColor: '#E3F2FD',
    borderColor: '#007AFF',
  },
  urgencyIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  urgencyText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  urgencyTextSelected: {
    color: '#007AFF',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  questionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  questionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  questionMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 4,
  },
  urgencyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  questionTime: {
    fontSize: 12,
    color: '#C7C7CC',
  },
});

