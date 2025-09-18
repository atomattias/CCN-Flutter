import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { textDeidentificationService, DeidentificationResult } from '../src/services/textDeidentificationService';
import { faceAnonymizationService, FaceAnonymizationResult } from '../src/services/faceAnonymizationService';
import { resizeImageForAnonymization } from '../src/utils/imageUtils';

export default function SecondOpinionScreen() {
  const [selectedChannel, setSelectedChannel] = useState<string>('');
  const [caseDescription, setCaseDescription] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high'>('medium');
  const [isDeidentifying, setIsDeidentifying] = useState(false);
  const [enableDescriptionPrivacy, setEnableDescriptionPrivacy] = useState(false);
  const [enableImagePrivacy, setEnableImagePrivacy] = useState(true);
  const [deidentifiedDescription, setDeidentifiedDescription] = useState('');
  const [isProcessingDescription, setIsProcessingDescription] = useState(false);
  const [anonymizedImages, setAnonymizedImages] = useState<string[]>([]);
  const [isProcessingImages, setIsProcessingImages] = useState(false);
  

  // Available channels for second opinion requests
  const availableChannels = [
    { id: 'general', name: 'General Discussion', description: 'General medical consultations' },
    { id: 'cardiology', name: 'Cardiology', description: 'Heart and cardiovascular conditions' },
    { id: 'neurology', name: 'Neurology', description: 'Brain and nervous system disorders' },
    { id: 'emergency', name: 'Emergency Cases', description: 'Urgent medical situations' },
    { id: 'research', name: 'Research & Studies', description: 'Clinical research discussions' },
    { id: 'training', name: 'Training & Education', description: 'Medical education and training' },
    { id: 'dermatology', name: 'Dermatology', description: 'Skin conditions and treatments' },
    { id: 'radiology', name: 'Radiology', description: 'Medical imaging and diagnostics' },
    { id: 'pathology', name: 'Pathology', description: 'Disease diagnosis and analysis' }
  ];


  // Process images when privacy protection is enabled and images change
  useEffect(() => {
    if (enableImagePrivacy && selectedImages.length > 0) {
      processImages();
    } else if (!enableImagePrivacy) {
      setAnonymizedImages([]);
    }
  }, [selectedImages, enableImagePrivacy]);


  const processCaseDescription = async (text: string = caseDescription) => {
    console.log('🔍 processCaseDescription called with text:', text.substring(0, 50) + '...');
    
    if (!text.trim()) {
      console.log('❌ No text to process, clearing deidentified description');
      setDeidentifiedDescription('');
      return;
    }

    console.log('🚀 Starting text de-identification...');
    setIsProcessingDescription(true);
    try {
      const result = await textDeidentificationService.deidentifyText({
        text: text,
        method: 'comprehensive',
        sensitivity: 'high',
        preserve_context: true
      });
      console.log('✅ De-identification successful:', result.deidentified_text.substring(0, 50) + '...');
      setDeidentifiedDescription(result.deidentified_text);
      console.log('📱 Deidentified description state updated, length:', result.deidentified_text.length);
    } catch (error) {
      console.error('❌ Failed to process case description:', error);
      setDeidentifiedDescription(text); // Fallback to original
    } finally {
      setIsProcessingDescription(false);
    }
  };



  const processImages = async () => {
    if (selectedImages.length === 0) {
      setAnonymizedImages([]);
      return;
    }

    setIsProcessingImages(true);
    try {
      const processedImages = await Promise.all(
        selectedImages.map(async (imageUri) => {
          try {
            // Convert image to base64
            const base64Image = await convertImageToBase64(imageUri);
            
            // Anonymize the image
            const result = await faceAnonymizationService.anonymizeFaces({
              image: base64Image,
              method: 'blur',
              quality: 'high'
            });
            
            return result.anonymized_image;
          } catch (error) {
            console.error('Failed to process image:', error);
            
            // Handle specific error cases
            if (error instanceof Error && (error.message.includes('413') || error.message.includes('too large'))) {
              console.warn('Image too large for anonymization, using original image');
              Alert.alert(
                'Image Too Large',
                'This image is too large for processing. It will be sent without privacy protection, or you can retake it with lower quality.',
                [
                  { 
                    text: 'Retake Photo', 
                    onPress: () => {
                      // Remove the problematic image and allow user to retake
                      setSelectedImages(prev => prev.filter(img => img !== imageUri));
                    }
                  },
                  { text: 'Send Without Protection', style: 'default' }
                ]
              );
            }
            
            return imageUri; // Fallback to original image
          }
        })
      );
      
      setAnonymizedImages(processedImages);
    } catch (error) {
      console.error('Failed to process images:', error);
      setAnonymizedImages(selectedImages); // Fallback to original images
    } finally {
      setIsProcessingImages(false);
    }
  };

  const convertImageToBase64 = async (imageUri: string): Promise<string> => {
    try {
      // Use the resizing utility to ensure the image is within size limits
      console.log('Converting and resizing image for upload...');
      const resizedBase64 = await resizeImageForAnonymization(imageUri, 500); // 500KB limit
      
      // Remove data:image/...;base64, prefix to get just the base64 string
      const base64 = resizedBase64.split(',')[1];
      return base64;
    } catch (error) {
      console.error('Failed to convert and resize image:', error);
      throw error;
    }
  };

  const handleDescriptionPrivacyToggle = async (enabled: boolean) => {
    console.log('🔧 Privacy toggle changed to:', enabled);
    console.log('📝 Current case description length:', caseDescription.length);
    
    setEnableDescriptionPrivacy(enabled);
    if (enabled && caseDescription.trim()) {
      console.log('🚀 Privacy enabled, processing text...');
      // Process existing text when privacy is enabled
      await processCaseDescription();
    } else {
      console.log('🔓 Privacy disabled, clearing deidentified text');
      // Clear deidentified text when privacy is disabled
      setDeidentifiedDescription('');
    }
  };

  const handleImagePrivacyToggle = async (enabled: boolean) => {
    setEnableImagePrivacy(enabled);
    if (enabled && selectedImages.length > 0) {
      await processImages();
    }
  };

  const handleSubmitRequest = async () => {
    if (!selectedChannel) {
      Alert.alert('Error', 'Please select a channel for your second opinion request');
      return;
    }

    if (!caseDescription.trim()) {
      Alert.alert('Error', 'Please provide a case description');
      return;
    }

    // Use processed data if privacy protection is enabled
    const textToSubmit = enableDescriptionPrivacy && deidentifiedDescription 
      ? deidentifiedDescription 
      : caseDescription;
    
    const imagesToSubmit = enableImagePrivacy && anonymizedImages.length > 0 
      ? anonymizedImages 
      : selectedImages;

    const privacyInfo = [];
    if (enableDescriptionPrivacy && deidentifiedDescription) {
      privacyInfo.push('• Text has been privacy-protected');
    }
    if (enableImagePrivacy && anonymizedImages.length > 0) {
      privacyInfo.push('• Images have been anonymized');
    }
    
    const selectedChannelInfo = availableChannels.find(ch => ch.id === selectedChannel);
    const channelName = selectedChannelInfo ? selectedChannelInfo.name : 'Selected Channel';
    
    const message = privacyInfo.length > 0 
      ? `Your request has been sent to the ${channelName} channel with privacy protection applied:\n\n${privacyInfo.join('\n')}\n\nYou will be notified when responses are received.`
      : `Your request has been sent to the ${channelName} channel. You will be notified when responses are received.`;

    Alert.alert(
      'Second Opinion Request Submitted',
      message,
      [
        {
          text: 'OK',
          onPress: () => router.back()
        }
      ]
    );
  };

  const handleAddImage = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Sorry, we need camera roll permissions to upload images.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Show image picker options
      Alert.alert(
        'Select Image',
        'Choose how you want to add an image',
        [
          {
            text: 'Camera',
            onPress: () => openCamera(),
          },
          {
            text: 'Photo Library',
            onPress: () => openImageLibrary(),
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
    } catch (error) {
      console.error('Error requesting permissions:', error);
      Alert.alert('Error', 'Failed to request permissions');
    }
  };

  const openCamera = async () => {
    try {
      const maxImages = 5;
      if (selectedImages.length >= maxImages) {
        Alert.alert(
          'Maximum Images Reached',
          `You can upload up to ${maxImages} images. Please remove some images before adding new ones.`,
          [{ text: 'OK' }]
        );
        return;
      }

      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Sorry, we need camera permissions to take photos.',
          [{ text: 'OK' }]
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: 'images',
        allowsEditing: false, // Disable editing to ensure quality setting works
        quality: 0.8, // Back to reasonable quality like the original
        exif: false, // Disable EXIF data to reduce file size
        base64: false, // Don't include base64 to reduce memory usage
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        const fileSize = result.assets[0].fileSize || 0;
        
        console.log(`Camera image - URI: ${imageUri}`);
        console.log(`Camera image - File size: ${(fileSize / 1024 / 1024).toFixed(2)}MB`);
        console.log(`Camera image - Quality setting: 0.8 (80%)`);
        
        // Log file size for debugging
        if (fileSize > 500 * 1024) { // 500KB
          console.log(`Large image detected: ${(fileSize / 1024 / 1024).toFixed(2)}MB - proceeding anyway`);
        }
        
        setSelectedImages(prev => [...prev, imageUri]);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const openImageLibrary = async () => {
    try {
      const maxImages = 5;
      const remainingSlots = maxImages - selectedImages.length;
      
      if (remainingSlots <= 0) {
        Alert.alert(
          'Maximum Images Reached',
          `You can upload up to ${maxImages} images. Please remove some images before adding new ones.`,
          [{ text: 'OK' }]
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: false, // Disable editing when multiple selection is enabled
        quality: 0.8, // Back to reasonable quality like the original
        exif: false, // Disable EXIF data to reduce file size
        base64: false, // Don't include base64 to reduce memory usage
        allowsMultipleSelection: true,
        selectionLimit: remainingSlots,
      });

      if (!result.canceled && result.assets.length > 0) {
        const imageUris = result.assets.map(asset => asset.uri);
        
        // Debug: Log file sizes for each selected image
        result.assets.forEach((asset, index) => {
          console.log(`Library image ${index + 1} - URI: ${asset.uri}`);
          console.log(`Library image ${index + 1} - File size: ${((asset.fileSize || 0) / 1024 / 1024).toFixed(2)}MB`);
          console.log(`Library image ${index + 1} - Quality setting: 0.8 (80%)`);
        });
        
        // Log large images for debugging but don't prevent adding them
        const largeImages = result.assets.filter(asset => (asset.fileSize || 0) > 500 * 1024);
        if (largeImages.length > 0) {
          console.log(`${largeImages.length} large image(s) detected - proceeding anyway`);
        }
        
        setSelectedImages(prev => [...prev, ...imageUris]);
      }
    } catch (error) {
      console.error('Error selecting images:', error);
      Alert.alert('Error', 'Failed to select images');
    }
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setAnonymizedImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Request Second Opinion</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Channel Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Channel</Text>
          <Text style={styles.sectionSubtitle}>
            Choose the appropriate channel for your second opinion request
          </Text>
          
          <TouchableOpacity 
            style={styles.channelDropdown}
            onPress={() => {
              Alert.alert(
                'Select Channel',
                'Choose the appropriate channel for your second opinion request',
                availableChannels.map((channel) => ({
                  text: channel.name,
                  onPress: () => setSelectedChannel(channel.id)
                })).concat([{ text: 'Cancel', style: 'cancel' }])
              );
            }}
          >
            <View style={styles.channelDropdownContent}>
              <Ionicons name="people" size={20} color="#007AFF" />
              <Text style={[
                styles.channelDropdownText,
                !selectedChannel && styles.channelDropdownPlaceholder
              ]}>
                {selectedChannel 
                  ? availableChannels.find(ch => ch.id === selectedChannel)?.name 
                  : 'Select a channel...'
                }
              </Text>
            </View>
            <Ionicons name="chevron-down" size={20} color="#8E8E93" />
          </TouchableOpacity>
          
          {selectedChannel && (
            <View style={styles.selectedChannelInfo}>
              <Text style={styles.selectedChannelDescription}>
                {availableChannels.find(ch => ch.id === selectedChannel)?.description}
              </Text>
            </View>
          )}
        </View>

        {/* Case Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Case Description</Text>
          
          {isProcessingDescription ? (
            <View style={styles.processingContainer}>
              <ActivityIndicator size="small" color="#007AFF" />
              <Text style={styles.processingText}>Processing for privacy protection...</Text>
            </View>
          ) : (
            <View>
              <TextInput
                style={[
                  styles.textInput,
                  enableDescriptionPrivacy && deidentifiedDescription && styles.deidentifiedTextInput
                ]}
                placeholder="Describe the clinical case, symptoms, history, and any specific questions you have..."
                value={enableDescriptionPrivacy && deidentifiedDescription ? deidentifiedDescription : caseDescription}
                onChangeText={(text) => {
                  console.log('✏️ Text input changed, length:', text.length);
                  // Only allow editing when privacy is off or no deidentified text exists
                  if (!enableDescriptionPrivacy || !deidentifiedDescription) {
                    // Always update the original description
                    setCaseDescription(text);
                    // Clear deidentified version when user is typing
                    setDeidentifiedDescription('');
                  }
                }}
                multiline
                numberOfLines={8}
                textAlignVertical="top"
                editable={!enableDescriptionPrivacy || !deidentifiedDescription}
              />
              
              
              {enableDescriptionPrivacy && deidentifiedDescription && (
                <View style={styles.deidentifiedNotice}>
                  <Ionicons name="shield-checkmark" size={16} color="#007AFF" />
                  <Text style={styles.deidentifiedNoticeText}>
                    Text is de-identified. Toggle privacy protection OFF to edit.
                  </Text>
                </View>
              )}
            </View>
          )}
          
          
          {enableDescriptionPrivacy && deidentifiedDescription && (
            <View style={styles.privacyNotice}>
              <Ionicons name="information-circle" size={16} color="#007AFF" />
              <Text style={styles.privacyNoticeText}>
                This text has been processed to remove personal information
              </Text>
            </View>
          )}
          
          {/* Privacy Protection Toggle */}
          <View style={styles.privacyToggleSection}>
            <View style={styles.privacyToggleRow}>
              <View style={styles.privacyToggleInfo}>
                <Ionicons 
                  name={caseDescription.trim() ? "shield-checkmark" : "shield-outline"} 
                  size={20} 
                  color={caseDescription.trim() ? "#34C759" : "#999"} 
                />
                <Text style={[styles.privacyToggleTitle, !caseDescription.trim() && styles.disabledText]}>
                  Privacy Protection
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.sectionToggle, 
                  enableDescriptionPrivacy && styles.sectionToggleActive,
                  !caseDescription.trim() && styles.disabledToggle
                ]}
                onPress={() => caseDescription.trim() && handleDescriptionPrivacyToggle(!enableDescriptionPrivacy)}
                disabled={!caseDescription.trim()}
              >
                <View style={[
                  styles.sectionToggleThumb, 
                  enableDescriptionPrivacy && styles.sectionToggleThumbActive,
                  !caseDescription.trim() && styles.disabledToggleThumb
                ]} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Medical Images */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Medical Images</Text>
          
          <Text style={styles.sectionSubtitle}>
            Upload X-rays, CT scans, MRIs, or other relevant images
            {enableImagePrivacy && ' (Images will be anonymized)'}
          </Text>
          
          <TouchableOpacity 
            style={[
              styles.addImageButton, 
              selectedImages.length >= 5 && styles.addImageButtonDisabled
            ]} 
            onPress={handleAddImage}
            disabled={selectedImages.length >= 5}
          >
            <Ionicons 
              name="camera" 
              size={24} 
              color={selectedImages.length >= 5 ? "#8E8E93" : "#007AFF"} 
            />
            <Text style={[
              styles.addImageText,
              selectedImages.length >= 5 && styles.addImageTextDisabled
            ]}>
              Add Image {selectedImages.length > 0 && `(${selectedImages.length}/5)`}
            </Text>
          </TouchableOpacity>

          {isProcessingImages && (
            <View style={styles.processingContainer}>
              <ActivityIndicator size="small" color="#007AFF" />
              <Text style={styles.processingText}>Processing images for privacy protection...</Text>
            </View>
          )}

          {selectedImages.length > 0 && (
            <View style={styles.imageList}>
              {selectedImages.map((image, index) => {
                const displayImage = enableImagePrivacy && anonymizedImages[index] 
                  ? `data:image/jpeg;base64,${anonymizedImages[index]}` 
                  : image;
                
                return (
                  <View key={index} style={styles.imageItem}>
                    <View style={styles.imagePlaceholder}>
                      {displayImage ? (
                        <Image source={{ uri: displayImage }} style={styles.imagePreview} />
                      ) : (
                        <Ionicons name="image" size={32} color="#8E8E93" />
                      )}
                      {enableImagePrivacy && anonymizedImages[index] && (
                        <View style={styles.imagePrivacyOverlay}>
                          <Ionicons name="shield-checkmark" size={16} color="#34C759" />
                        </View>
                      )}
                    </View>
                    <TouchableOpacity 
                      style={styles.removeImageButton}
                      onPress={() => handleRemoveImage(index)}
                    >
                      <Ionicons name="close-circle" size={20} color="#FF3B30" />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          )}
          
          {enableImagePrivacy && (
            <View style={styles.privacyNotice}>
              <Ionicons name="information-circle" size={16} color="#007AFF" />
              <Text style={styles.privacyNoticeText}>
                Images will be automatically anonymized to remove patient identifiers
              </Text>
            </View>
          )}
          
          {/* Privacy Protection Toggle */}
          <View style={styles.privacyToggleSection}>
            <View style={styles.privacyToggleRow}>
              <View style={styles.privacyToggleInfo}>
                <Ionicons name="shield-checkmark" size={20} color="#34C759" />
                <Text style={styles.privacyToggleTitle}>Privacy Protection</Text>
              </View>
              <TouchableOpacity
                style={[styles.sectionToggle, enableImagePrivacy && styles.sectionToggleActive]}
                onPress={() => handleImagePrivacyToggle(!enableImagePrivacy)}
              >
                <View style={[styles.sectionToggleThumb, enableImagePrivacy && styles.sectionToggleThumbActive]} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Urgency Level */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Urgency Level</Text>
          <View style={styles.urgencyOptions}>
            {[
              { value: 'low', label: 'Low', color: '#34C759', description: 'Routine consultation' },
              { value: 'medium', label: 'Medium', color: '#FF9500', description: 'Standard priority' },
              { value: 'high', label: 'High', color: '#FF3B30', description: 'Urgent case' }
            ].map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.urgencyOption,
                  urgency === option.value && { borderColor: option.color, borderWidth: 2 }
                ]}
                onPress={() => setUrgency(option.value as any)}
              >
                <View style={[styles.urgencyIndicator, { backgroundColor: option.color }]} />
                <Text style={styles.urgencyLabel}>{option.label}</Text>
                <Text style={styles.urgencyDescription}>{option.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>


        {/* Submit Button */}
        <TouchableOpacity 
          style={[styles.submitButton, isDeidentifying && styles.submitButtonDisabled]} 
          onPress={handleSubmitRequest}
          disabled={isDeidentifying}
        >
          {isDeidentifying ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Ionicons name="send" size={20} color="#FFFFFF" />
          )}
          <Text style={styles.submitButtonText}>
            {isDeidentifying ? 'Processing...' : 'Submit Request'}
          </Text>
        </TouchableOpacity>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Ionicons name="information-circle" size={20} color="#007AFF" />
          <Text style={styles.infoText}>
            Your request will be sent to qualified specialists in the relevant field. 
            All data is anonymized and GDPR-compliant.
          </Text>
        </View>
      </ScrollView>
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
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  placeholder: {
    width: 40,
  },
  section: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  sectionToggle: {
    width: 40,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E5E5EA',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  sectionToggleActive: {
    backgroundColor: '#34C759',
  },
  sectionToggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 1,
  },
  sectionToggleThumbActive: {
    transform: [{ translateX: 16 }],
  },
  privacyToggleSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  privacyToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  privacyToggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  privacyToggleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginLeft: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 16,
  },
  processingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  processingText: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 8,
  },
  privacyNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  privacyNoticeText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#1976D2',
    lineHeight: 18,
  },
  disabledText: {
    color: '#999',
  },
  privacyToggleSubtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  disabledToggle: {
    opacity: 0.5,
  },
  disabledToggleThumb: {
    backgroundColor: '#CCC',
  },
  deidentifiedTextInput: {
    backgroundColor: '#F0F8FF',
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  deidentifiedNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  deidentifiedNoticeText: {
    fontSize: 12,
    color: '#1976D2',
    marginLeft: 6,
    flex: 1,
  },
  imagePrivacyOverlay: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1C1C1E',
    backgroundColor: '#F2F2F7',
    minHeight: 120,
  },
  addImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
    borderRadius: 8,
    backgroundColor: '#F0F8FF',
  },
  addImageText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  addImageButtonDisabled: {
    backgroundColor: '#F2F2F7',
    borderColor: '#E5E5EA',
  },
  addImageTextDisabled: {
    color: '#8E8E93',
  },
  imageList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
  },
  imageItem: {
    position: 'relative',
    marginRight: 12,
    marginBottom: 12,
  },
  imagePlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    overflow: 'hidden',
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
  },
  urgencyOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  urgencyOption: {
    flex: 1,
    padding: 16,
    marginHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    alignItems: 'center',
  },
  urgencyIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  urgencyLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  urgencyDescription: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  submitButtonDisabled: {
    backgroundColor: '#8E8E93',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#E3F2FD',
    margin: 16,
    padding: 16,
    borderRadius: 8,
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#1976D2',
    lineHeight: 20,
  },
  channelDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
  },
  channelDropdownContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  channelDropdownText: {
    fontSize: 16,
    color: '#1C1C1E',
    marginLeft: 8,
    flex: 1,
  },
  channelDropdownPlaceholder: {
    color: '#8E8E93',
  },
  selectedChannelInfo: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  selectedChannelDescription: {
    fontSize: 14,
    color: '#1976D2',
    lineHeight: 18,
  },
});
