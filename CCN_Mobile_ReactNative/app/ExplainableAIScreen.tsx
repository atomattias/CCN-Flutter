import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

interface AIExplanation {
  id: string;
  type: 'gradcam' | 'shap' | 'integrated_gradients';
  title: string;
  description: string;
  confidence: number;
  highlightedRegions: number;
  color: string;
}

export default function ExplainableAIScreen() {
  const [selectedExplanation, setSelectedExplanation] = useState<string>('gradcam');
  const [selectedImage, setSelectedImage] = useState<string>('chest_xray');

  const explanations: AIExplanation[] = [
    {
      id: 'gradcam',
      type: 'gradcam',
      title: 'Grad-CAM',
      description: 'Gradient-weighted Class Activation Mapping shows which regions of the image the model focuses on for its decision.',
      confidence: 94,
      highlightedRegions: 3,
      color: '#FF3B30'
    },
    {
      id: 'shap',
      type: 'shap',
      title: 'SHAP Values',
      description: 'SHapley Additive exPlanations quantify the contribution of each pixel to the final prediction.',
      confidence: 91,
      highlightedRegions: 5,
      color: '#007AFF'
    },
    {
      id: 'integrated_gradients',
      type: 'integrated_gradients',
      title: 'Integrated Gradients',
      description: 'Integrated Gradients provide feature attribution by integrating gradients along the path from baseline to input.',
      confidence: 89,
      highlightedRegions: 4,
      color: '#34C759'
    }
  ];

  const mockImages = [
    { id: 'chest_xray', name: 'Chest X-ray', diagnosis: 'Pneumonia', confidence: 94 },
    { id: 'brain_mri', name: 'Brain MRI', diagnosis: 'Normal', confidence: 98 },
    { id: 'skin_lesion', name: 'Skin Lesion', diagnosis: 'Benign', confidence: 87 }
  ];

  const handleExplanationSelect = (explanationId: string) => {
    setSelectedExplanation(explanationId);
  };

  const handleImageSelect = (imageId: string) => {
    setSelectedImage(imageId);
  };

  const handleGenerateExplanation = () => {
    Alert.alert(
      'Generating Explanation',
      `Generating ${explanations.find(e => e.id === selectedExplanation)?.title} visualization for the selected image...`,
      [{ text: 'OK' }]
    );
  };

  const selectedExplanationData = explanations.find(e => e.id === selectedExplanation);
  const selectedImageData = mockImages.find(img => img.id === selectedImage);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Explainable AI</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Image Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Medical Image</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScrollView}>
            {mockImages.map((image) => (
              <TouchableOpacity
                key={image.id}
                style={[
                  styles.imageCard,
                  selectedImage === image.id && styles.selectedImageCard
                ]}
                onPress={() => handleImageSelect(image.id)}
              >
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="image" size={32} color="#8E8E93" />
                </View>
                <Text style={styles.imageName}>{image.name}</Text>
                <Text style={styles.imageDiagnosis}>{image.diagnosis}</Text>
                <View style={styles.confidenceBadge}>
                  <Text style={styles.confidenceText}>{image.confidence}%</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Explanation Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Explanation Methods</Text>
          <Text style={styles.sectionSubtitle}>
            Choose an explanation method to understand how the AI made its decision
          </Text>
          
          {explanations.map((explanation) => (
            <TouchableOpacity
              key={explanation.id}
              style={[
                styles.explanationCard,
                selectedExplanation === explanation.id && styles.selectedExplanationCard
              ]}
              onPress={() => handleExplanationSelect(explanation.id)}
            >
              <View style={styles.explanationHeader}>
                <View style={[styles.explanationIcon, { backgroundColor: explanation.color }]}>
                  <Ionicons name="analytics" size={20} color="#FFFFFF" />
                </View>
                <View style={styles.explanationInfo}>
                  <Text style={styles.explanationTitle}>{explanation.title}</Text>
                  <Text style={styles.explanationDescription}>{explanation.description}</Text>
                </View>
                <View style={styles.explanationMetrics}>
                  <Text style={styles.confidenceLabel}>Confidence</Text>
                  <Text style={[styles.confidenceValue, { color: explanation.color }]}>
                    {explanation.confidence}%
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Visualization Area */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Explanation Visualization</Text>
          
          <View style={styles.visualizationContainer}>
            <View style={styles.imageContainer}>
              <View style={styles.medicalImage}>
                <Ionicons name="image" size={48} color="#8E8E93" />
                <Text style={styles.imageLabel}>Medical Image</Text>
              </View>
              
              <View style={styles.overlayContainer}>
                <View style={[styles.highlightedRegion, { backgroundColor: selectedExplanationData?.color + '40' }]}>
                  <Text style={styles.regionLabel}>AI Focus Area</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.visualizationInfo}>
              <Text style={styles.visualizationTitle}>
                {selectedExplanationData?.title} Analysis
              </Text>
              <Text style={styles.visualizationDescription}>
                {selectedExplanationData?.description}
              </Text>
              
              <View style={styles.metricsContainer}>
                <View style={styles.metric}>
                  <Text style={styles.metricLabel}>Confidence</Text>
                  <Text style={[styles.metricValue, { color: selectedExplanationData?.color }]}>
                    {selectedExplanationData?.confidence}%
                  </Text>
                </View>
                <View style={styles.metric}>
                  <Text style={styles.metricLabel}>Regions</Text>
                  <Text style={styles.metricValue}>
                    {selectedExplanationData?.highlightedRegions}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Generate Button */}
        <TouchableOpacity style={styles.generateButton} onPress={handleGenerateExplanation}>
          <Ionicons name="refresh" size={20} color="#FFFFFF" />
          <Text style={styles.generateButtonText}>Generate New Explanation</Text>
        </TouchableOpacity>

        {/* Technical Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Technical Details</Text>
          <View style={styles.technicalDetails}>
            <View style={styles.detailItem}>
              <Ionicons name="flask" size={16} color="#007AFF" />
              <Text style={styles.detailText}>Model: ResNet-50 with attention mechanism</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="layers" size={16} color="#007AFF" />
              <Text style={styles.detailText}>Layers: 50 convolutional layers</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="trending-up" size={16} color="#007AFF" />
              <Text style={styles.detailText}>Training: 100,000+ medical images</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="shield-checkmark" size={16} color="#007AFF" />
              <Text style={styles.detailText}>Validation: FDA-approved dataset</Text>
            </View>
          </View>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Ionicons name="information-circle" size={20} color="#007AFF" />
          <Text style={styles.infoText}>
            These explanations help clinicians understand AI decision-making processes, 
            improving trust and enabling better clinical decision support.
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
  sectionSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 16,
    lineHeight: 20,
  },
  imageScrollView: {
    marginHorizontal: -20,
  },
  imageCard: {
    width: 120,
    marginRight: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    alignItems: 'center',
  },
  selectedImageCard: {
    borderColor: '#007AFF',
    borderWidth: 2,
    backgroundColor: '#F0F8FF',
  },
  imagePlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  imageName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1C1C1E',
    textAlign: 'center',
    marginBottom: 4,
  },
  imageDiagnosis: {
    fontSize: 10,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 8,
  },
  confidenceBadge: {
    backgroundColor: '#34C759',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  confidenceText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  explanationCard: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    marginBottom: 12,
  },
  selectedExplanationCard: {
    borderColor: '#007AFF',
    borderWidth: 2,
    backgroundColor: '#F0F8FF',
  },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  explanationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  explanationInfo: {
    flex: 1,
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  explanationDescription: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 18,
  },
  explanationMetrics: {
    alignItems: 'center',
  },
  confidenceLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 2,
  },
  confidenceValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  visualizationContainer: {
    alignItems: 'center',
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  medicalImage: {
    width: width - 80,
    height: 200,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  imageLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 8,
  },
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  highlightedRegion: {
    width: 100,
    height: 80,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  regionLabel: {
    fontSize: 12,
    color: '#1C1C1E',
    fontWeight: '600',
  },
  visualizationInfo: {
    width: '100%',
  },
  visualizationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  visualizationDescription: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
    marginBottom: 16,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  metric: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  technicalDetails: {
    marginTop: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#1C1C1E',
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
});









