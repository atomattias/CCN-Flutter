import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  Modal,
  TextInput,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { clinicalKnowledgeService, ClinicalQuestion, ClinicalResponse, AIAnalysis } from '../services/clinicalKnowledgeService';
import { CustomButton } from '../components/CustomButton';
import { CustomInput } from '../components/CustomInput';

export const ClinicalQAScreen: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'questions' | 'my-questions' | 'trending'>('questions');
  
  // Data states
  const [questions, setQuestions] = useState<ClinicalQuestion[]>([]);
  const [myQuestions, setMyQuestions] = useState<ClinicalQuestion[]>([]);
  const [trendingTopics, setTrendingTopics] = useState<any[]>([]);
  
  // Modal states
  const [showPostModal, setShowPostModal] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<ClinicalQuestion | null>(null);
  
  // Post question states
  const [questionTitle, setQuestionTitle] = useState('');
  const [questionDescription, setQuestionDescription] = useState('');
  const [patientSymptoms, setPatientSymptoms] = useState('');
  const [patientHistory, setPatientHistory] = useState('');
  const [diagnosticTests, setDiagnosticTests] = useState<string[]>([]);
  const [suspectedConditions, setSuspectedConditions] = useState<string[]>([]);
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [specialty, setSpecialty] = useState('');
  const [department, setDepartment] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isEncrypted, setIsEncrypted] = useState(true);
  
  // Enhanced clinical data states
  const [labValues, setLabValues] = useState<string>('');
  const [vitalSigns, setVitalSigns] = useState<string>('');
  const [medications, setMedications] = useState<string>('');
  const [allergies, setAllergies] = useState<string>('');
  const [familyHistory, setFamilyHistory] = useState<string>('');
  const [socialHistory, setSocialHistory] = useState<string>('');
  const [physicalExam, setPhysicalExam] = useState<string>('');
  const [uploadedImages, setUploadedImages] = useState<any[]>([]);
  const [imageDescriptions, setImageDescriptions] = useState<{[key: string]: string}>({});
  
  // Available options
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [clinicalTags, setClinicalTags] = useState<string[]>([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (activeTab === 'questions') {
      loadQuestions();
    } else if (activeTab === 'my-questions') {
      loadMyQuestions();
    } else if (activeTab === 'trending') {
      loadTrendingTopics();
    }
  }, [activeTab]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [specs, depts, tags] = await Promise.all([
        clinicalKnowledgeService.getSpecialties(),
        clinicalKnowledgeService.getDepartments(),
        clinicalKnowledgeService.getClinicalTags(),
      ]);
      
      setSpecialties(specs);
      setDepartments(depts);
      setClinicalTags(tags);
      
      await loadQuestions();
    } catch (error) {
      console.error('Failed to load initial data:', error);
      Alert.alert('Error', 'Failed to load clinical data');
    } finally {
      setLoading(false);
    }
  };

  const loadQuestions = async () => {
    try {
      const response = await clinicalKnowledgeService.getClinicalQuestions({
        query: '',
        sortBy: 'date',
        sortOrder: 'desc',
        limit: 50,
      });
      setQuestions(response.questions);
    } catch (error) {
      console.error('Failed to load questions:', error);
    }
  };

  const loadMyQuestions = async () => {
    try {
      const response = await clinicalKnowledgeService.getClinicalQuestions({
        query: '',
        sortBy: 'date',
        sortOrder: 'desc',
        limit: 50,
      });
      // Filter questions by current user
      const userQuestions = response.questions.filter(q => q.authorId === user?.id);
      setMyQuestions(userQuestions);
    } catch (error) {
      console.error('Failed to load my questions:', error);
    }
  };

  const loadTrendingTopics = async () => {
    try {
      const topics = await clinicalKnowledgeService.getTrendingTopics();
      setTrendingTopics(topics);
    } catch (error) {
      console.error('Failed to load trending topics:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (activeTab === 'questions') {
      await loadQuestions();
    } else if (activeTab === 'my-questions') {
      await loadMyQuestions();
    } else if (activeTab === 'trending') {
      await loadTrendingTopics();
    }
    setRefreshing(false);
  };

  const handleAddImage = () => {
    Alert.alert(
      'Add Clinical Image',
      'Choose image source',
      [
        {
          text: 'Camera',
          onPress: () => handleImagePicker('camera'),
        },
        {
          text: 'Photo Library',
          onPress: () => handleImagePicker('library'),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const handleImagePicker = async (source: 'camera' | 'library') => {
    try {
      // This would integrate with expo-image-picker or expo-document-picker
      // For now, we'll simulate image selection
      const mockImage = {
        id: `img_${Date.now()}`,
        name: `Clinical_Image_${uploadedImages.length + 1}.jpg`,
        uri: 'mock_uri',
        type: 'image/jpeg',
        size: 1024 * 1024, // 1MB
      };
      
      setUploadedImages([...uploadedImages, mockImage]);
      setImageDescriptions({
        ...imageDescriptions,
        [mockImage.id]: ''
      });
    } catch (error) {
      console.error('Failed to pick image:', error);
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const handlePostQuestion = async () => {
    if (!questionTitle.trim() || !questionDescription.trim() || !patientSymptoms.trim()) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    if (uploadedImages.length === 0) {
      Alert.alert('Validation Error', 'Please upload at least one clinical image');
      return;
    }

    try {
      setLoading(true);
      const newQuestion = await clinicalKnowledgeService.postClinicalQuestion({
        title: questionTitle.trim(),
        description: questionDescription.trim(),
        patientSymptoms: patientSymptoms.trim(),
        patientHistory: patientHistory.trim(),
        diagnosticTests: diagnosticTests,
        suspectedConditions: suspectedConditions,
        urgency,
        specialty,
        department,
        tags,
        isAnonymous,
        isEncrypted,
        // Enhanced clinical data
        labValues: labValues.trim(),
        vitalSigns: vitalSigns.trim(),
        medications: medications.trim(),
        allergies: allergies.trim(),
        familyHistory: familyHistory.trim(),
        socialHistory: socialHistory.trim(),
        physicalExam: physicalExam.trim(),
        clinicalImages: uploadedImages.map(img => ({
          ...img,
          description: imageDescriptions[img.id] || ''
        }))
      });

      // Clear form
      setQuestionTitle('');
      setQuestionDescription('');
      setPatientSymptoms('');
      setPatientHistory('');
      setDiagnosticTests([]);
      setSuspectedConditions([]);
      setUrgency('medium');
      setSpecialty('');
      setDepartment('');
      setTags([]);
      setIsAnonymous(false);
      setIsEncrypted(true);
      
      // Clear enhanced clinical data
      setLabValues('');
      setVitalSigns('');
      setMedications('');
      setAllergies('');
      setFamilyHistory('');
      setSocialHistory('');
      setPhysicalExam('');
      setUploadedImages([]);
      setImageDescriptions({});

      setShowPostModal(false);
      
      // Refresh questions
      await loadQuestions();
      
      Alert.alert('Success', 'Clinical question posted successfully! AI analysis is being generated.');
    } catch (error) {
      console.error('Failed to post question:', error);
      Alert.alert('Error', 'Failed to post clinical question');
    } finally {
      setLoading(false);
    }
  };

  const handleViewQuestion = async (question: ClinicalQuestion) => {
    try {
      setSelectedQuestion(question);
      setShowQuestionModal(true);
    } catch (error) {
      console.error('Failed to view question:', error);
    }
  };

  const handleVote = async (
    targetId: string,
    targetType: 'question' | 'response',
    voteType: 'upvote' | 'downvote'
  ) => {
    try {
      await clinicalKnowledgeService.vote(targetId, targetType, voteType);
      
      // Refresh data
      if (activeTab === 'questions') {
        await loadQuestions();
      } else if (activeTab === 'my-questions') {
        await loadMyQuestions();
      }
    } catch (error) {
      console.error('Failed to vote:', error);
      Alert.alert('Error', 'Failed to submit vote');
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'low':
        return '#34C759';
      case 'medium':
        return '#FF9500';
      case 'high':
        return '#FF3B30';
      case 'critical':
        return '#AF52DE';
      default:
        return '#8E8E93';
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'low':
        return 'checkmark-circle';
      case 'medium':
        return 'warning';
      case 'high':
        return 'alert-circle';
      case 'critical':
        return 'medical';
      default:
        return 'help-circle';
    }
  };

  const renderQuestionItem = ({ item }: { item: ClinicalQuestion }) => (
    <TouchableOpacity
      style={styles.questionItem}
      onPress={() => handleViewQuestion(item)}
    >
      <View style={styles.questionHeader}>
        <View style={styles.questionMeta}>
          <View style={styles.urgencyBadge}>
            <Ionicons
              name={getUrgencyIcon(item.urgency)}
              size={16}
              color={getUrgencyColor(item.urgency)}
            />
            <Text style={[styles.urgencyText, { color: getUrgencyColor(item.urgency) }]}>
              {item.urgency.toUpperCase()}
            </Text>
          </View>
          
          <View style={styles.specialtyBadge}>
            <Text style={styles.specialtyText}>{item.specialty}</Text>
          </View>
        </View>
        
        <View style={styles.questionStats}>
          <View style={styles.statItem}>
            <Ionicons name="eye" size={16} color="#8E8E93" />
            <Text style={styles.statText}>{item.viewCount}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="chatbubble" size={16} color="#8E8E93" />
            <Text style={styles.statText}>{item.responseCount}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="thumbs-up" size={16} color="#8E8E93" />
            <Text style={styles.statText}>{item.upvotes}</Text>
          </View>
        </View>
      </View>
      
      <Text style={styles.questionTitle} numberOfLines={2}>
        {item.title}
      </Text>
      
      <Text style={styles.questionDescription} numberOfLines={3}>
        {item.description}
      </Text>
      
      <View style={styles.questionFooter}>
        <View style={styles.authorInfo}>
          <Ionicons name="person" size={16} color="#8E8E93" />
          <Text style={styles.authorText}>
            {item.isAnonymous ? 'Anonymous' : item.authorName}
          </Text>
          <Text style={styles.authorSpecialty}>
            {item.authorSpecialty} • {item.authorHospital}
          </Text>
        </View>
        
        <Text style={styles.questionDate}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
      
      {item.tags.length > 0 && (
        <View style={styles.questionTags}>
          {item.tags.slice(0, 3).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
          {item.tags.length > 3 && (
            <Text style={styles.moreTags}>+{item.tags.length - 3}</Text>
          )}
        </View>
      )}
      
      {item.aiAnalysis && (
        <View style={styles.aiAnalysisIndicator}>
          <Ionicons name="sparkles" size={16} color="#007AFF" />
          <Text style={styles.aiAnalysisText}>AI Analysis Available</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderTrendingTopic = ({ item }: { item: any }) => (
    <View style={styles.trendingItem}>
      <View style={styles.trendingHeader}>
        <Text style={styles.trendingTopic}>{item.topic}</Text>
        <View style={[styles.trendingBadge, { backgroundColor: getTrendColor(item.trend) }]}>
          <Text style={styles.trendingBadgeText}>{item.trend}</Text>
        </View>
      </View>
      
      <View style={styles.trendingStats}>
        <Text style={styles.trendingCount}>{item.count} questions</Text>
        <Text style={styles.trendingSpecialty}>{item.specialty}</Text>
      </View>
    </View>
  );

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'rising':
        return '#34C759';
      case 'stable':
        return '#007AFF';
      case 'declining':
        return '#8E8E93';
      default:
        return '#8E8E93';
    }
  };

  if (loading && questions.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading Clinical Q&A...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="medical" size={32} color="#007AFF" />
        <Text style={styles.title}>Clinical Q&A</Text>
        <Text style={styles.subtitle}>Share knowledge, get AI insights</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabNavigation}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'questions' && styles.activeTab]}
          onPress={() => setActiveTab('questions')}
        >
          <Ionicons
            name="chatbubbles"
            size={20}
            color={activeTab === 'questions' ? '#007AFF' : '#8E8E93'}
          />
          <Text style={[styles.tabText, activeTab === 'questions' && styles.activeTabText]}>
            Questions
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'my-questions' && styles.activeTab]}
          onPress={() => setActiveTab('my-questions')}
        >
          <Ionicons
            name="person"
            size={20}
            color={activeTab === 'my-questions' ? '#007AFF' : '#8E8E93'}
          />
          <Text style={[styles.tabText, activeTab === 'my-questions' && styles.activeTabText]}>
            My Questions
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'trending' && styles.activeTab]}
          onPress={() => setActiveTab('trending')}
        >
          <Ionicons
            name="trending-up"
            size={20}
            color={activeTab === 'trending' ? '#007AFF' : '#8E8E93'}
          />
          <Text style={[styles.tabText, activeTab === 'trending' && styles.activeTabText]}>
            Trending
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {activeTab === 'questions' && (
          <View style={styles.tabContent}>
            <View style={styles.questionsHeader}>
              <Text style={styles.questionsTitle}>Recent Clinical Questions</Text>
              <CustomButton
                title="Post Question"
                onPress={() => setShowPostModal(true)}
                variant="primary"
                icon="add"
                size="small"
              />
            </View>
            
            <FlatList
              data={questions}
              renderItem={renderQuestionItem}
              keyExtractor={(item) => item._id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}

        {activeTab === 'my-questions' && (
          <View style={styles.tabContent}>
            <View style={styles.questionsHeader}>
              <Text style={styles.questionsTitle}>My Clinical Questions</Text>
              <CustomButton
                title="Post Question"
                onPress={() => setShowPostModal(true)}
                variant="primary"
                icon="add"
                size="small"
              />
            </View>
            
            {myQuestions.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="chatbubble-outline" size={64} color="#8E8E93" />
                <Text style={styles.emptyStateText}>No questions yet</Text>
                <Text style={styles.emptyStateSubtext}>
                  Start sharing your clinical cases to get AI insights and peer responses
                </Text>
                <CustomButton
                  title="Post Your First Question"
                  onPress={() => setShowPostModal(true)}
                  variant="primary"
                  icon="add"
                />
              </View>
            ) : (
              <FlatList
                data={myQuestions}
                renderItem={renderQuestionItem}
                keyExtractor={(item) => item._id}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        )}

        {activeTab === 'trending' && (
          <View style={styles.tabContent}>
            <Text style={styles.questionsTitle}>Trending Clinical Topics</Text>
            
            <FlatList
              data={trendingTopics}
              renderItem={renderTrendingTopic}
              keyExtractor={(item, index) => index.toString()}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}
      </ScrollView>

      {/* Post Question Modal */}
      <Modal
        visible={showPostModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalTitle}>Post Clinical Question</Text>
            <Text style={styles.modalSubtitle}>Share your diagnostic challenge</Text>
            
            <CustomInput
              label="Question Title *"
              placeholder="Brief description of the case"
              value={questionTitle}
              onChangeText={setQuestionTitle}
            />
            
            <CustomInput
              label="Detailed Description *"
              placeholder="Provide more context about the case"
              value={questionDescription}
              onChangeText={setQuestionDescription}
              multiline
              numberOfLines={3}
            />
            
            <CustomInput
              label="Patient Symptoms *"
              placeholder="Describe the presenting symptoms"
              value={patientSymptoms}
              onChangeText={setPatientSymptoms}
              multiline
              numberOfLines={3}
            />
            
            <CustomInput
              label="Patient History"
              placeholder="Relevant medical history"
              value={patientHistory}
              onChangeText={setPatientHistory}
              multiline
              numberOfLines={2}
            />
            
            <CustomInput
              label="Lab Values"
              placeholder="Relevant laboratory results (e.g., CBC, Chemistry, Troponin)"
              value={labValues}
              onChangeText={setLabValues}
              multiline
              numberOfLines={2}
            />
            
            <CustomInput
              label="Vital Signs"
              placeholder="Blood pressure, heart rate, temperature, oxygen saturation"
              value={vitalSigns}
              onChangeText={setVitalSigns}
              multiline
              numberOfLines={2}
            />
            
            <CustomInput
              label="Current Medications"
              placeholder="List current medications and dosages"
              value={medications}
              onChangeText={setMedications}
              multiline
              numberOfLines={2}
            />
            
            <CustomInput
              label="Allergies"
              placeholder="Known drug allergies or sensitivities"
              value={allergies}
              onChangeText={setAllergies}
              multiline
              numberOfLines={2}
            />
            
            <CustomInput
              label="Family History"
              placeholder="Relevant family medical history"
              value={familyHistory}
              onChangeText={setFamilyHistory}
              multiline
              numberOfLines={2}
            />
            
            <CustomInput
              label="Social History"
              placeholder="Smoking, alcohol, occupation, lifestyle factors"
              value={socialHistory}
              onChangeText={setSocialHistory}
              multiline
              numberOfLines={2}
            />
            
            <CustomInput
              label="Physical Examination"
              placeholder="Key physical examination findings"
              value={physicalExam}
              onChangeText={setPhysicalExam}
              multiline
              numberOfLines={3}
            />
            
            {/* Image Upload Section */}
            <View style={styles.formRow}>
              <View style={styles.formColumn}>
                <Text style={styles.formLabel}>Clinical Images *</Text>
                <Text style={styles.formSubtext}>
                  Upload X-rays, lab results, patient photos, or other relevant images
                </Text>
                
                <View style={styles.imageUploadContainer}>
                  {uploadedImages.map((image, index) => (
                    <View key={index} style={styles.uploadedImageItem}>
                      <View style={styles.imagePreview}>
                        <Ionicons name="image" size={32} color="#007AFF" />
                        <Text style={styles.imageName}>{image.name}</Text>
                      </View>
                      <CustomInput
                        placeholder="Describe this image"
                        value={imageDescriptions[image.id] || ''}
                        onChangeText={(text) => setImageDescriptions({
                          ...imageDescriptions,
                          [image.id]: text
                        })}
                        multiline
                        numberOfLines={2}
                      />
                      <TouchableOpacity
                        style={styles.removeImageButton}
                        onPress={() => {
                          const newImages = uploadedImages.filter((_, i) => i !== index);
                          setUploadedImages(newImages);
                          const newDescriptions = { ...imageDescriptions };
                          delete newDescriptions[image.id];
                          setImageDescriptions(newDescriptions);
                        }}
                      >
                        <Ionicons name="close-circle" size={24} color="#FF3B30" />
                      </TouchableOpacity>
                    </View>
                  ))}
                  
                  <TouchableOpacity
                    style={styles.addImageButton}
                    onPress={handleAddImage}
                  >
                    <Ionicons name="camera" size={24} color="#007AFF" />
                    <Text style={styles.addImageText}>Add Clinical Image</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            
            <View style={styles.formRow}>
              <View style={styles.formColumn}>
                <Text style={styles.formLabel}>Urgency Level *</Text>
                <View style={styles.urgencyOptions}>
                  {(['low', 'medium', 'high', 'critical'] as const).map((level) => (
                    <TouchableOpacity
                      key={level}
                      style={[
                        styles.urgencyOption,
                        urgency === level && styles.urgencyOptionActive,
                      ]}
                      onPress={() => setUrgency(level)}
                    >
                      <Text style={[
                        styles.urgencyOptionText,
                        urgency === level && styles.urgencyOptionTextActive,
                      ]}>
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
            
            <View style={styles.formRow}>
              <View style={styles.formColumn}>
                <Text style={styles.formLabel}>Specialty *</Text>
                <View style={styles.specialtyOptions}>
                  {specialties.slice(0, 6).map((spec) => (
                    <TouchableOpacity
                      key={spec}
                      style={[
                        styles.specialtyOption,
                        specialty === spec && styles.specialtyOptionActive,
                      ]}
                      onPress={() => setSpecialty(spec)}
                    >
                      <Text style={[
                        styles.specialtyOptionText,
                        specialty === spec && styles.specialtyOptionTextActive,
                      ]}>
                        {spec}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
            
            <View style={styles.formRow}>
              <View style={styles.formColumn}>
                <Text style={styles.formLabel}>Department</Text>
                <View style={styles.departmentOptions}>
                  {departments.slice(0, 4).map((dept) => (
                    <TouchableOpacity
                      key={dept}
                      style={[
                        styles.departmentOption,
                        department === dept && styles.departmentOptionActive,
                      ]}
                      onPress={() => setDepartment(dept)}
                    >
                      <Text style={[
                        styles.departmentOptionText,
                        department === dept && styles.departmentOptionTextActive,
                      ]}>
                        {dept}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
            
            <View style={styles.formRow}>
              <View style={styles.formColumn}>
                <Text style={styles.formLabel}>Tags</Text>
                <View style={styles.tagOptions}>
                  {clinicalTags.slice(0, 8).map((tag) => (
                    <TouchableOpacity
                      key={tag}
                      style={[
                        styles.tagOption,
                        tags.includes(tag) && styles.tagOptionActive,
                      ]}
                      onPress={() => {
                        if (tags.includes(tag)) {
                          setTags(tags.filter(t => t !== tag));
                        } else {
                          setTags([...tags, tag]);
                        }
                      }}
                    >
                      <Text style={[
                        styles.tagOptionText,
                        tags.includes(tag) && styles.tagOptionTextActive,
                      ]}>
                        {tag}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
            
            <View style={styles.formRow}>
              <View style={styles.formColumn}>
                <Text style={styles.formLabel}>Privacy Options</Text>
                <View style={styles.privacyOptions}>
                  <TouchableOpacity
                    style={styles.privacyOption}
                    onPress={() => setIsAnonymous(!isAnonymous)}
                  >
                    <Ionicons
                      name={isAnonymous ? 'checkmark-circle' : 'ellipse-outline'}
                      size={20}
                      color={isAnonymous ? '#007AFF' : '#8E8E93'}
                    />
                    <Text style={styles.privacyOptionText}>Post anonymously</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.privacyOption}
                    onPress={() => setIsEncrypted(!isEncrypted)}
                  >
                    <Ionicons
                      name={isEncrypted ? 'checkmark-circle' : 'ellipse-outline'}
                      size={20}
                      color={isEncrypted ? '#007AFF' : '#8E8E93'}
                    />
                    <Text style={styles.privacyOptionText}>Encrypt sensitive data</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            
            <View style={styles.modalActions}>
              <CustomButton
                title="Cancel"
                onPress={() => setShowPostModal(false)}
                variant="outline"
              />
              <CustomButton
                title="Post Question"
                onPress={handlePostQuestion}
                variant="primary"
                disabled={!questionTitle.trim() || !questionDescription.trim() || !patientSymptoms.trim()}
              />
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Question Detail Modal */}
      <Modal
        visible={showQuestionModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedQuestion && (
              <>
                <View style={styles.questionDetailHeader}>
                  <Text style={styles.questionDetailTitle}>{selectedQuestion.title}</Text>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setShowQuestionModal(false)}
                  >
                    <Ionicons name="close" size={24} color="#8E8E93" />
                  </TouchableOpacity>
                </View>
                
                <ScrollView style={styles.questionDetailContent}>
                  <View style={styles.questionDetailMeta}>
                    <View style={[styles.urgencyBadge, { backgroundColor: getUrgencyColor(selectedQuestion.urgency) }]}>
                      <Text style={styles.urgencyBadgeText}>
                        {selectedQuestion.urgency.toUpperCase()}
                      </Text>
                    </View>
                    <Text style={styles.questionDetailSpecialty}>{selectedQuestion.specialty}</Text>
                    <Text style={styles.questionDetailDate}>
                      {new Date(selectedQuestion.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  
                  <Text style={styles.questionDetailDescription}>
                    {selectedQuestion.description}
                  </Text>
                  
                  <Text style={styles.questionDetailSectionTitle}>Patient Symptoms</Text>
                  <Text style={styles.questionDetailText}>{selectedQuestion.patientSymptoms}</Text>
                  
                  {selectedQuestion.patientHistory && (
                    <>
                      <Text style={styles.questionDetailSectionTitle}>Patient History</Text>
                      <Text style={styles.questionDetailText}>{selectedQuestion.patientHistory}</Text>
                    </>
                  )}
                  
                  {/* Enhanced Clinical Data Display */}
                  {selectedQuestion.labValues && (
                    <>
                      <Text style={styles.questionDetailSectionTitle}>Laboratory Values</Text>
                      <Text style={styles.questionDetailText}>{selectedQuestion.labValues}</Text>
                    </>
                  )}
                  
                  {selectedQuestion.vitalSigns && (
                    <>
                      <Text style={styles.questionDetailSectionTitle}>Vital Signs</Text>
                      <Text style={styles.questionDetailText}>{selectedQuestion.vitalSigns}</Text>
                    </>
                  )}
                  
                  {selectedQuestion.medications && (
                    <>
                      <Text style={styles.questionDetailSectionTitle}>Current Medications</Text>
                      <Text style={styles.questionDetailText}>{selectedQuestion.medications}</Text>
                    </>
                  )}
                  
                  {selectedQuestion.allergies && (
                    <>
                      <Text style={styles.questionDetailSectionTitle}>Allergies</Text>
                      <Text style={styles.questionDetailText}>{selectedQuestion.allergies}</Text>
                    </>
                  )}
                  
                  {selectedQuestion.familyHistory && (
                    <>
                      <Text style={styles.questionDetailSectionTitle}>Family History</Text>
                      <Text style={styles.questionDetailText}>{selectedQuestion.familyHistory}</Text>
                    </>
                  )}
                  
                  {selectedQuestion.socialHistory && (
                    <>
                      <Text style={styles.questionDetailSectionTitle}>Social History</Text>
                      <Text style={styles.questionDetailText}>{selectedQuestion.socialHistory}</Text>
                    </>
                  )}
                  
                  {selectedQuestion.physicalExam && (
                    <>
                      <Text style={styles.questionDetailSectionTitle}>Physical Examination</Text>
                      <Text style={styles.questionDetailText}>{selectedQuestion.physicalExam}</Text>
                    </>
                  )}
                  
                  {/* Clinical Images Display */}
                  {selectedQuestion.clinicalImages && selectedQuestion.clinicalImages.length > 0 && (
                    <>
                      <Text style={styles.questionDetailSectionTitle}>Clinical Images</Text>
                      <View style={styles.clinicalImagesContainer}>
                        {selectedQuestion.clinicalImages.map((image, index) => (
                          <View key={index} style={styles.clinicalImageItem}>
                            <View style={styles.clinicalImagePreview}>
                              <Ionicons name="image" size={48} color="#007AFF" />
                              <Text style={styles.clinicalImageName}>{image.name}</Text>
                            </View>
                            {image.description && (
                              <Text style={styles.clinicalImageDescription}>
                                {image.description}
                              </Text>
                            )}
                          </View>
                        ))}
                      </View>
                    </>
                  )}
                  
                  {selectedQuestion.aiAnalysis && (
                    <View style={styles.aiAnalysisSection}>
                      <Text style={styles.aiAnalysisTitle}>🤖 AI Analysis</Text>
                      <Text style={styles.aiAnalysisDiagnosis}>
                        Primary Diagnosis: {selectedQuestion.aiAnalysis.primaryDiagnosis}
                      </Text>
                      <Text style={styles.aiAnalysisConfidence}>
                        Confidence: {selectedQuestion.aiAnalysis.confidence}%
                      </Text>
                      <Text style={styles.aiAnalysisReasoning}>
                        {selectedQuestion.aiAnalysis.reasoning}
                      </Text>
                    </View>
                  )}
                  
                  <View style={styles.questionDetailActions}>
                    <CustomButton
                      title="View Responses"
                      onPress={() => Alert.alert('Responses', 'View responses functionality coming soon')}
                      variant="secondary"
                      icon="chatbubbles"
                    />
                    <CustomButton
                      title="Add Response"
                      onPress={() => Alert.alert('Add Response', 'Add response functionality coming soon')}
                      variant="primary"
                      icon="add"
                    />
                  </View>
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>
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
  questionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  questionsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  questionItem: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
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
  questionMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  urgencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
  },
  urgencyText: {
    fontSize: 10,
    fontWeight: '600',
  },
  specialtyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#E3F2FD',
  },
  specialtyText: {
    fontSize: 10,
    color: '#007AFF',
    fontWeight: '600',
  },
  questionStats: {
    flexDirection: 'row',
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  questionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
    lineHeight: 22,
  },
  questionDescription: {
    fontSize: 14,
    color: '#000000',
    marginBottom: 12,
    lineHeight: 20,
  },
  questionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  authorInfo: {
    flex: 1,
  },
  authorText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000000',
  },
  authorSpecialty: {
    fontSize: 10,
    color: '#8E8E93',
  },
  questionDate: {
    fontSize: 10,
    color: '#8E8E93',
  },
  questionTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  tag: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 10,
    color: '#8E8E93',
  },
  moreTags: {
    fontSize: 10,
    color: '#8E8E93',
    alignSelf: 'center',
  },
  aiAnalysisIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#E3F2FD',
    alignSelf: 'flex-start',
  },
  aiAnalysisText: {
    fontSize: 10,
    color: '#007AFF',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  trendingItem: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  trendingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  trendingTopic: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  trendingBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  trendingBadgeText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  trendingStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trendingCount: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  trendingSpecialty: {
    fontSize: 12,
    color: '#8E8E93',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '95%',
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
    textAlign: 'center',
    marginTop: 24,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 24,
  },
  formRow: {
    marginBottom: 20,
  },
  formColumn: {
    flex: 1,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  urgencyOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  urgencyOption: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
  },
  urgencyOptionActive: {
    backgroundColor: '#007AFF',
  },
  urgencyOptionText: {
    fontSize: 12,
    color: '#000000',
    fontWeight: '600',
  },
  urgencyOptionTextActive: {
    color: 'white',
  },
  specialtyOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  specialtyOption: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
  },
  specialtyOptionActive: {
    backgroundColor: '#007AFF',
  },
  specialtyOptionText: {
    fontSize: 12,
    color: '#000000',
  },
  specialtyOptionTextActive: {
    color: 'white',
  },
  departmentOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  departmentOption: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
  },
  departmentOptionActive: {
    backgroundColor: '#007AFF',
  },
  departmentOptionText: {
    fontSize: 12,
    color: '#000000',
  },
  departmentOptionTextActive: {
    color: 'white',
  },
  tagOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagOption: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
  },
  tagOptionActive: {
    backgroundColor: '#007AFF',
  },
  tagOptionText: {
    fontSize: 12,
    color: '#000000',
  },
  tagOptionTextActive: {
    color: 'white',
  },
  privacyOptions: {
    gap: 12,
  },
  privacyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  privacyOptionText: {
    fontSize: 14,
    color: '#000000',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 24,
    paddingHorizontal: 24,
    gap: 12,
  },
  formSubtext: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  imageUploadContainer: {
    marginTop: 12,
  },
  uploadedImageItem: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  imagePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
  },
  imageName: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '500',
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 4,
  },
  addImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
    borderRadius: 8,
    backgroundColor: '#F0F8FF',
  },
  addImageText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  clinicalImagesContainer: {
    marginTop: 12,
  },
  clinicalImageItem: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  clinicalImagePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  clinicalImageName: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '500',
  },
  clinicalImageDescription: {
    fontSize: 12,
    color: '#8E8E93',
    fontStyle: 'italic',
  },
  questionDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  questionDetailTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    flex: 1,
    marginRight: 16,
  },
  closeButton: {
    padding: 4,
  },
  questionDetailContent: {
    padding: 24,
  },
  questionDetailMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  urgencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  urgencyBadgeText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
  },
  questionDetailSpecialty: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  questionDetailDate: {
    fontSize: 12,
    color: '#8E8E93',
  },
  questionDetailDescription: {
    fontSize: 16,
    color: '#000000',
    lineHeight: 24,
    marginBottom: 20,
  },
  questionDetailSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
    marginTop: 16,
  },
  questionDetailText: {
    fontSize: 14,
    color: '#000000',
    lineHeight: 20,
    marginBottom: 16,
  },
  aiAnalysisSection: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    marginVertical: 16,
  },
  aiAnalysisTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  aiAnalysisDiagnosis: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 8,
  },
  aiAnalysisConfidence: {
    fontSize: 14,
    color: '#000000',
    marginBottom: 12,
  },
  aiAnalysisReasoning: {
    fontSize: 14,
    color: '#000000',
    lineHeight: 20,
  },
  questionDetailActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
});
