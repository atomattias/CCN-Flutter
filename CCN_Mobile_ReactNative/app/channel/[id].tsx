import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, TextInput, FlatList, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

interface DiscussionPost {
  id: string;
  type: 'question' | 'ai_response' | 'community_response';
  author: string;
  content: string;
  timestamp: string;
  votes?: { up: number; down: number };
  userVote?: 'up' | 'down';
  replies?: number;
}

interface Channel {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  isJoined: boolean;
  type: 'general' | 'specific';
}

export default function ChannelDetailScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [isAskAIModalVisible, setAskAIModalVisible] = useState(false);
  const [isAskCommunityModalVisible, setAskCommunityModalVisible] = useState(false);
  const [aiQuestion, setAiQuestion] = useState('');
  const [communityQuestion, setCommunityQuestion] = useState('');
  const [aiImage, setAiImage] = useState<string | null>(null);
  const [communityImage, setCommunityImage] = useState<string | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  // Mock channel data - in real app, this would be fetched based on the id
  const channel: Channel = {
    id: id as string,
    name: id === '1' ? 'General Medical Discussion' : 
          id === '2' ? 'Cardiology Specialists' :
          id === '3' ? 'Emergency Medicine' :
          'Channel Name',
    description: id === '1' ? 'Open discussions for all medical topics and general healthcare questions' :
                 id === '2' ? 'Specialized discussions for cardiology professionals and heart-related cases' :
                 id === '3' ? 'Fast-paced discussions for emergency care and urgent medical situations' :
                 'Channel description',
    memberCount: id === '1' ? 1247 : id === '2' ? 89 : 156,
    isJoined: true,
    type: id === '1' ? 'general' : 'specific',
  };

  // Mock discussion posts
  const [discussionPosts] = useState<DiscussionPost[]>([
    {
      id: '1',
      type: 'question',
      author: 'Dr. Sarah Johnson',
      content: 'What are the latest guidelines for hypertension management in elderly patients?',
      timestamp: '2 hours ago',
      replies: 5,
    },
    {
      id: '2',
      type: 'ai_response',
      author: 'AI Assistant',
      content: 'Based on current AHA guidelines, first-line treatment for elderly patients with hypertension includes ACE inhibitors or ARBs, with consideration for thiazide diuretics. Blood pressure targets should be individualized, typically <130/80 mmHg for most patients, but may be relaxed to <140/90 mmHg for frail elderly.',
      timestamp: '1 hour ago',
      votes: { up: 12, down: 2 },
      userVote: 'up',
    },
    {
      id: '3',
      type: 'community_response',
      author: 'Dr. Michael Chen',
      content: 'I agree with the AI response. In my practice, I also consider frailty assessment using tools like the Clinical Frailty Scale before setting BP targets. For patients with significant frailty, I often start with a more conservative approach.',
      timestamp: '45 minutes ago',
      votes: { up: 8, down: 0 },
    },
    {
      id: '4',
      type: 'question',
      author: 'Dr. Emily Rodriguez',
      content: 'Has anyone had experience with the new SGLT2 inhibitors for heart failure patients?',
      timestamp: '3 hours ago',
      replies: 3,
    },
    {
      id: '5',
      type: 'ai_response',
      author: 'AI Assistant',
      content: 'SGLT2 inhibitors like empagliflozin and dapagliflozin have shown significant benefits in heart failure patients, including reduced cardiovascular death and heart failure hospitalizations. They are now recommended as first-line therapy for HFrEF regardless of diabetes status.',
      timestamp: '2 hours ago',
      votes: { up: 15, down: 1 },
    },
  ]);

  const anonymizeImage = async (imageUri: string): Promise<string> => {
    try {
      setIsProcessingImage(true);
      console.log('Starting face anonymization for image:', imageUri);
      
      // Convert image to base64
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      console.log('Image converted to base64, length:', base64.length);

      // Call face anonymization service
      console.log('Calling face anonymization service...');
      const response = await fetch('http://192.168.1.224:8000/anonymize-json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64,
          method: 'blur',
          quality: 'high',
        }),
      });

      console.log('Response status:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Face anonymization failed:', response.status, errorText);
        throw new Error(`Face anonymization failed: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      console.log('Face anonymization successful:', result);
      
      // Compare original and anonymized base64 to verify they're different
      const originalBase64 = base64;
      const anonymizedBase64 = result.anonymized_image;
      console.log('Original base64 length:', originalBase64.length);
      console.log('Anonymized base64 length:', anonymizedBase64.length);
      console.log('Images are different:', originalBase64 !== anonymizedBase64);
      
      // Save anonymized image to local storage
      const anonymizedUri = `${FileSystem.documentDirectory}anonymized_${Date.now()}.jpg`;
      await FileSystem.writeAsStringAsync(anonymizedUri, result.anonymized_image, {
        encoding: FileSystem.EncodingType.Base64,
      });
      console.log('Anonymized image saved to:', anonymizedUri);
      
      // Verify the file was saved correctly
      const fileInfo = await FileSystem.getInfoAsync(anonymizedUri);
      console.log('Anonymized file info:', fileInfo);
      
      // Create data URI for immediate display
      const anonymizedDataUri = `data:image/jpeg;base64,${result.anonymized_image}`;
      console.log('Anonymized data URI created for display');

      // If faces were detected, ask user if they want to anonymize
      if (result.faces_detected > 0) {
        console.log(`Faces detected: ${result.faces_detected}, asking user for choice`);
        
        return new Promise((resolve) => {
          Alert.alert(
            'Face Detection Alert',
            `${result.faces_detected} face(s) detected in your image. For patient privacy, would you like to anonymize the faces?`,
            [
              {
                text: 'Use Original',
                style: 'cancel',
                onPress: () => {
                  console.log('User chose to use original image');
                  console.log('Resolving with original URI:', imageUri);
                  resolve(imageUri);
                }
              },
              {
                text: 'Anonymize Faces',
                onPress: () => {
                  console.log('User chose to anonymize faces');
                  console.log('Resolving with anonymized data URI:', anonymizedDataUri.substring(0, 50) + '...');
                  resolve(anonymizedDataUri);
                }
              }
            ]
          );
        });
      } else {
        console.log('No faces detected in image');
        Alert.alert(
          'Image Processed',
          'No faces detected in the image. Using original image.'
        );
        return imageUri; // Return original if no faces detected
      }
    } catch (error) {
      console.error('Face anonymization error:', error);
      console.error('Error details:', error.message);
      Alert.alert(
        'Processing Error', 
        `Failed to process image for privacy protection: ${error.message}. Using original image.`
      );
      return imageUri; // Return original image if anonymization fails
    } finally {
      setIsProcessingImage(false);
    }
  };

  const pickImage = async (setImage: (uri: string) => void) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to upload images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const originalUri = result.assets[0].uri;
      console.log('Original image URI:', originalUri);
      const processedUri = await anonymizeImage(originalUri);
      console.log('Processed URI type:', processedUri ? (processedUri.startsWith('data:') ? 'data URI' : 'file URI') : 'null');
      
      // Convert data URI to file URI for better performance
      if (processedUri && processedUri.startsWith('data:')) {
        console.log('Converting data URI to file URI for better performance...');
        const base64Data = processedUri.split(',')[1];
        const finalUri = `${FileSystem.documentDirectory}anonymized_${Date.now()}.jpg`;
        
        console.log('Data URI length:', processedUri.length);
        console.log('Base64 data length:', base64Data.length);
        
        // Write the anonymized base64 data to file
        try {
          await FileSystem.writeAsStringAsync(finalUri, base64Data, {
            encoding: FileSystem.EncodingType.Base64,
          });
          console.log('Anonymized image saved to:', finalUri);
          
          // Verify the file was saved correctly
          const fileInfo = await FileSystem.getInfoAsync(finalUri);
          console.log('File info:', fileInfo);
          
          if (fileInfo.exists) {
            console.log('Setting image state with file URI:', finalUri);
            setImage(finalUri);
          } else {
            console.error('File was not created successfully');
            setImage(originalUri);
          }
        } catch (error) {
          console.error('Error saving anonymized image:', error);
          setImage(originalUri);
        }
      } else if (processedUri) {
        console.log('Using processed URI directly:', processedUri);
        console.log('Setting image state with processed URI:', processedUri);
        setImage(processedUri);
      } else {
        console.log('No processed URI, using original:', originalUri);
        console.log('Setting image state with original URI:', originalUri);
        setImage(originalUri);
      }
    }
  };

  const takePhoto = async (setImage: (uri: string) => void) => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Sorry, we need camera permissions to take photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const originalUri = result.assets[0].uri;
      console.log('Original image URI:', originalUri);
      const processedUri = await anonymizeImage(originalUri);
      console.log('Processed URI type:', processedUri ? (processedUri.startsWith('data:') ? 'data URI' : 'file URI') : 'null');
      
      // Convert data URI to file URI for better performance
      if (processedUri && processedUri.startsWith('data:')) {
        console.log('Converting data URI to file URI for better performance...');
        const base64Data = processedUri.split(',')[1];
        const finalUri = `${FileSystem.documentDirectory}anonymized_${Date.now()}.jpg`;
        
        console.log('Data URI length:', processedUri.length);
        console.log('Base64 data length:', base64Data.length);
        
        // Write the anonymized base64 data to file
        try {
          await FileSystem.writeAsStringAsync(finalUri, base64Data, {
            encoding: FileSystem.EncodingType.Base64,
          });
          console.log('Anonymized image saved to:', finalUri);
          
          // Verify the file was saved correctly
          const fileInfo = await FileSystem.getInfoAsync(finalUri);
          console.log('File info:', fileInfo);
          
          if (fileInfo.exists) {
            console.log('Setting image state with file URI:', finalUri);
            setImage(finalUri);
          } else {
            console.error('File was not created successfully');
            setImage(originalUri);
          }
        } catch (error) {
          console.error('Error saving anonymized image:', error);
          setImage(originalUri);
        }
      } else if (processedUri) {
        console.log('Using processed URI directly:', processedUri);
        console.log('Setting image state with processed URI:', processedUri);
        setImage(processedUri);
      } else {
        console.log('No processed URI, using original:', originalUri);
        console.log('Setting image state with original URI:', originalUri);
        setImage(originalUri);
      }
    }
  };

  const showImageOptions = (setImage: (uri: string) => void) => {
    Alert.alert(
      'Add Image',
      'Choose how you want to add an image',
      [
        { text: 'Camera', onPress: () => takePhoto(setImage) },
        { text: 'Photo Library', onPress: () => pickImage(setImage) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };


  const handleAskAI = () => {
    if (aiQuestion.trim()) {
      const message = aiImage 
        ? 'Your question with image has been sent to the AI. You will receive a response shortly.'
        : 'Your question has been sent to the AI. You will receive a response shortly.';
      Alert.alert('AI Question Submitted', message);
      setAskAIModalVisible(false);
      setAiQuestion('');
      setAiImage(null);
    } else {
      Alert.alert('Error', 'Please enter your question.');
    }
  };

  const handleAskCommunity = () => {
    if (communityQuestion.trim()) {
      const message = communityImage 
        ? 'Your question with image has been posted to the community.'
        : 'Your question has been posted to the community.';
      Alert.alert('Question Posted', message);
      setAskCommunityModalVisible(false);
      setCommunityQuestion('');
      setCommunityImage(null);
    } else {
      Alert.alert('Error', 'Please enter your question.');
    }
  };

  const handleVote = (postId: string, vote: 'up' | 'down') => {
    Alert.alert('Vote Recorded', `Your ${vote === 'up' ? 'up' : 'down'}vote has been recorded.`);
  };

  const renderDiscussionPost = ({ item }: { item: DiscussionPost }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={styles.authorInfo}>
          <View style={[
            styles.authorAvatar,
            { backgroundColor: item.type === 'ai_response' ? '#007AFF' : '#34C759' }
          ]}>
            <Ionicons 
              name={item.type === 'ai_response' ? 'chatbubble-ellipses' : 'person'} 
              size={16} 
              color="#FFFFFF" 
            />
          </View>
          <View style={styles.authorDetails}>
            <Text style={styles.authorName}>{item.author}</Text>
            <Text style={styles.timestamp}>{item.timestamp}</Text>
          </View>
        </View>
        {item.type === 'ai_response' && (
          <View style={styles.aiBadge}>
            <Text style={styles.aiBadgeText}>AI</Text>
          </View>
        )}
      </View>
      
      <Text style={styles.postContent}>{item.content}</Text>
      
      <View style={styles.postFooter}>
        {item.votes && (
          <View style={styles.votingSection}>
            <TouchableOpacity 
              style={[styles.voteButton, item.userVote === 'up' && styles.votedButton]}
              onPress={() => handleVote(item.id, 'up')}
            >
              <Ionicons name="thumbs-up" size={16} color={item.userVote === 'up' ? '#FFFFFF' : '#34C759'} />
              <Text style={[styles.voteText, item.userVote === 'up' && styles.votedText]}>
                {item.votes.up}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.voteButton, item.userVote === 'down' && styles.votedButton]}
              onPress={() => handleVote(item.id, 'down')}
            >
              <Ionicons name="thumbs-down" size={16} color={item.userVote === 'down' ? '#FFFFFF' : '#FF3B30'} />
              <Text style={[styles.voteText, item.userVote === 'down' && styles.votedText]}>
                {item.votes.down}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        
        {item.replies && (
          <TouchableOpacity style={styles.repliesButton}>
            <Ionicons name="chatbubble-outline" size={16} color="#8E8E93" />
            <Text style={styles.repliesText}>{item.replies} replies</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <View style={styles.channelTitleRow}>
              <Ionicons 
                name={channel.type === 'general' ? 'globe-outline' : 'lock-closed-outline'} 
                size={20} 
                color={channel.type === 'general' ? '#007AFF' : '#34C759'} 
              />
              <Text style={styles.channelName}>{channel.name}</Text>
            </View>
            <Text style={styles.memberCount}>{channel.memberCount} members</Text>
          </View>
        </View>

        {/* Channel Description */}
        <View style={styles.descriptionCard}>
          <Text style={styles.descriptionText}>{channel.description}</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.primaryAction]}
            onPress={() => setAskAIModalVisible(true)}
          >
            <Ionicons name="chatbubble-ellipses" size={20} color="#FFFFFF" />
            <Text style={styles.primaryActionText}>Ask AI</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setAskCommunityModalVisible(true)}
          >
            <Ionicons name="people" size={20} color="#007AFF" />
            <Text style={styles.actionButtonText}>Ask Community</Text>
          </TouchableOpacity>
        </View>

        {/* Discussion Posts */}
        <View style={styles.discussionSection}>
          <Text style={styles.sectionTitle}>Discussion History</Text>
          <FlatList
            data={discussionPosts}
            renderItem={renderDiscussionPost}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.postsList}
          />
        </View>

        {/* Ask AI Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={isAskAIModalVisible}
          onRequestClose={() => setAskAIModalVisible(false)}
        >
          <KeyboardAvoidingView 
            style={styles.modalOverlay}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <ScrollView 
              contentContainerStyle={styles.modalScrollContainer}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Ask AI Assistant</Text>
                <Text style={styles.modalSubtitle}>Channel: {channel.name}</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Type your medical question for the AI..."
                  multiline
                  value={aiQuestion}
                  onChangeText={setAiQuestion}
                />
                
                {/* Image Upload Section */}
                <View style={styles.imageUploadSection}>
                  <Text style={styles.privacyNotice}>
                    🔒 Images are automatically processed to protect patient privacy
                  </Text>
                  <TouchableOpacity
                    style={[styles.imageUploadButton, isProcessingImage && styles.processingButton]}
                    onPress={() => showImageOptions(setAiImage)}
                    disabled={isProcessingImage}
                  >
                    {isProcessingImage ? (
                      <>
                        <Ionicons name="hourglass-outline" size={20} color="#FF9500" />
                        <Text style={[styles.imageUploadText, { color: '#FF9500' }]}>
                          Processing...
                        </Text>
                      </>
                    ) : (
                      <>
                        <Ionicons name="camera-outline" size={20} color="#007AFF" />
                        <Text style={styles.imageUploadText}>
                          {aiImage ? 'Change Image' : 'Add Image'}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                  
                  {aiImage && (
                    <View style={styles.imagePreviewContainer}>
                      <Text style={styles.debugText}>AI Image URI: {aiImage}</Text>
                      {(aiImage.includes('anonymized_') || aiImage.includes('final_image_') || aiImage.startsWith('data:')) && (
                        <Text style={styles.anonymizedLabel}>🔒 ANONYMIZED IMAGE</Text>
                      )}
                      <Image 
                        source={{ uri: aiImage }} 
                        style={styles.imagePreview}
                        onLoad={() => {
                          console.log('AI Image loaded successfully');
                          console.log('Loaded image URI:', aiImage);
                        }}
                        onError={(error) => {
                          console.log('AI Image load error:', error);
                          console.log('Failed to load URI:', aiImage);
                        }}
                        onLoadStart={() => console.log('AI Image loading started...')}
                        onLoadEnd={() => console.log('AI Image loading ended')}
                      />
                      <TouchableOpacity
                        style={styles.removeImageButton}
                        onPress={() => setAiImage(null)}
                      >
                        <Ionicons name="close-circle" size={24} color="#FF3B30" />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
                <View style={styles.modalButtonContainer}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setAskAIModalVisible(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.confirmButton]}
                    onPress={handleAskAI}
                  >
                    <Text style={styles.confirmButtonText}>Ask AI</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </Modal>

        {/* Ask Community Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={isAskCommunityModalVisible}
          onRequestClose={() => setAskCommunityModalVisible(false)}
        >
          <KeyboardAvoidingView 
            style={styles.modalOverlay}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <ScrollView 
              contentContainerStyle={styles.modalScrollContainer}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Ask Community</Text>
                <Text style={styles.modalSubtitle}>Channel: {channel.name}</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Type your question for the community..."
                  multiline
                  value={communityQuestion}
                  onChangeText={setCommunityQuestion}
                />
                
                {/* Image Upload Section */}
                <View style={styles.imageUploadSection}>
                  <Text style={styles.privacyNotice}>
                    🔒 Images are automatically processed to protect patient privacy
                  </Text>
                  <TouchableOpacity
                    style={[styles.imageUploadButton, isProcessingImage && styles.processingButton]}
                    onPress={() => showImageOptions(setCommunityImage)}
                    disabled={isProcessingImage}
                  >
                    {isProcessingImage ? (
                      <>
                        <Ionicons name="hourglass-outline" size={20} color="#FF9500" />
                        <Text style={[styles.imageUploadText, { color: '#FF9500' }]}>
                          Processing...
                        </Text>
                      </>
                    ) : (
                      <>
                        <Ionicons name="camera-outline" size={20} color="#007AFF" />
                        <Text style={styles.imageUploadText}>
                          {communityImage ? 'Change Image' : 'Add Image'}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                  
                  {communityImage && (
                    <View style={styles.imagePreviewContainer}>
                      <Text style={styles.debugText}>Community Image URI: {communityImage}</Text>
                      {(communityImage.includes('anonymized_') || communityImage.includes('final_image_') || communityImage.startsWith('data:')) && (
                        <Text style={styles.anonymizedLabel}>🔒 ANONYMIZED IMAGE</Text>
                      )}
                      <Image 
                        source={{ uri: communityImage }} 
                        style={styles.imagePreview}
                        onLoad={() => console.log('Community Image loaded successfully')}
                        onError={(error) => console.log('Community Image load error:', error)}
                      />
                      <TouchableOpacity
                        style={styles.removeImageButton}
                        onPress={() => setCommunityImage(null)}
                      >
                        <Ionicons name="close-circle" size={24} color="#FF3B30" />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
                <View style={styles.modalButtonContainer}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setAskCommunityModalVisible(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.confirmButton]}
                    onPress={handleAskCommunity}
                  >
                    <Text style={styles.confirmButtonText}>Post Question</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  channelTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  channelName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginLeft: 8,
  },
  memberCount: {
    fontSize: 14,
    color: '#8E8E93',
  },
  descriptionCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  descriptionText: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  primaryAction: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginLeft: 8,
  },
  primaryActionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  discussionSection: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  postsList: {
    paddingBottom: 20,
  },
  postCard: {
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
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  authorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  authorDetails: {
    flex: 1,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  timestamp: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  aiBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  aiBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  postContent: {
    fontSize: 14,
    color: '#1C1C1E',
    lineHeight: 20,
    marginBottom: 12,
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  votingSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  voteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  votedButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  voteText: {
    fontSize: 12,
    marginLeft: 4,
    color: '#8E8E93',
  },
  votedText: {
    color: '#FFFFFF',
  },
  repliesButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  repliesText: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalScrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
    color: '#1C1C1E',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    color: '#1C1C1E',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#E5E5EA',
  },
  cancelButtonText: {
    color: '#1C1C1E',
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#007AFF',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  imageUploadSection: {
    marginBottom: 16,
  },
  privacyNotice: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  imageUploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
  },
  processingButton: {
    borderColor: '#FF9500',
    backgroundColor: '#FFF8F0',
  },
  imageUploadText: {
    color: '#007AFF',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 14,
  },
  imagePreviewContainer: {
    marginTop: 12,
    position: 'relative',
    alignItems: 'center',
  },
  imagePreview: {
    width: 200,
    height: 150,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  debugText: {
    fontSize: 10,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 5,
    fontFamily: 'monospace',
    backgroundColor: '#FFF8F0',
    padding: 4,
    borderRadius: 4,
  },
  anonymizedLabel: {
    fontSize: 12,
    color: '#34C759',
    textAlign: 'center',
    marginBottom: 5,
    fontWeight: 'bold',
    backgroundColor: '#E8F5E8',
    padding: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#34C759',
  },
});
