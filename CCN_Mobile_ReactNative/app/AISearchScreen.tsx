import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  similarity: number;
  specialty: string;
  date: string;
  type: 'case' | 'research' | 'guideline';
}

export default function AISearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    specialty: 'all',
    type: 'all',
    dateRange: 'all'
  });

  const mockResults: SearchResult[] = [
    {
      id: '1',
      title: 'Chest X-ray Analysis: Pneumonia vs COVID-19',
      description: 'Comparative analysis of radiographic findings in pneumonia and COVID-19 cases with AI-assisted diagnosis',
      similarity: 95,
      specialty: 'Radiology',
      date: '2024-01-15',
      type: 'case'
    },
    {
      id: '2',
      title: 'ECG Interpretation: Atrial Fibrillation Detection',
      description: 'Machine learning model for detecting atrial fibrillation in ECG readings with 98% accuracy',
      similarity: 87,
      specialty: 'Cardiology',
      date: '2024-01-10',
      type: 'research'
    },
    {
      id: '3',
      title: 'Treatment Guidelines: Hypertension Management',
      description: 'Updated clinical guidelines for hypertension treatment in elderly patients',
      similarity: 82,
      specialty: 'Internal Medicine',
      date: '2024-01-08',
      type: 'guideline'
    },
    {
      id: '4',
      title: 'Dermatology: Melanoma Detection Algorithm',
      description: 'AI-powered skin lesion analysis for early melanoma detection using dermoscopy images',
      similarity: 78,
      specialty: 'Dermatology',
      date: '2024-01-05',
      type: 'research'
    }
  ];

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      Alert.alert('Error', 'Please enter a search query');
      return;
    }

    setIsSearching(true);
    
    // Simulate AI search
    setTimeout(() => {
      setSearchResults(mockResults);
      setIsSearching(false);
    }, 2000);
  };

  const handleResultPress = (result: SearchResult) => {
    Alert.alert(
      result.title,
      `Similarity: ${result.similarity}%\nSpecialty: ${result.specialty}\nType: ${result.type}\nDate: ${result.date}`,
      [
        { text: 'View Details', onPress: () => {} },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'case': return 'medical';
      case 'research': return 'flask';
      case 'guideline': return 'document-text';
      default: return 'document';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'case': return '#007AFF';
      case 'research': return '#34C759';
      case 'guideline': return '#FF9500';
      default: return '#8E8E93';
    }
  };

  const renderSearchResult = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity style={styles.resultCard} onPress={() => handleResultPress(item)}>
      <View style={styles.resultHeader}>
        <View style={styles.resultType}>
          <Ionicons 
            name={getTypeIcon(item.type)} 
            size={16} 
            color={getTypeColor(item.type)} 
          />
          <Text style={[styles.resultTypeText, { color: getTypeColor(item.type) }]}>
            {item.type.toUpperCase()}
          </Text>
        </View>
        <View style={styles.similarityBadge}>
          <Text style={styles.similarityText}>{item.similarity}%</Text>
        </View>
      </View>
      
      <Text style={styles.resultTitle}>{item.title}</Text>
      <Text style={styles.resultDescription}>{item.description}</Text>
      
      <View style={styles.resultFooter}>
        <View style={styles.specialtyBadge}>
          <Ionicons name="medical" size={12} color="#007AFF" />
          <Text style={styles.specialtyText}>{item.specialty}</Text>
        </View>
        <Text style={styles.resultDate}>{item.date}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.title}>AI-Powered Search</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Search Section */}
        <View style={styles.searchSection}>
          <Text style={styles.sectionTitle}>Search Similar Cases</Text>
          <Text style={styles.sectionSubtitle}>
            Use AI to find similar clinical cases, research papers, and treatment guidelines
          </Text>
          
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color="#8E8E93" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Describe symptoms, conditions, or clinical scenarios..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              multiline
            />
          </View>

          <TouchableOpacity 
            style={[styles.searchButton, isSearching && styles.searchButtonDisabled]} 
            onPress={handleSearch}
            disabled={isSearching}
          >
            <Ionicons name="search" size={20} color="#FFFFFF" />
            <Text style={styles.searchButtonText}>
              {isSearching ? 'Searching...' : 'Search with AI'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <View style={styles.resultsSection}>
            <Text style={styles.resultsTitle}>
              Found {searchResults.length} similar cases
            </Text>
            
            <FlatList
              data={searchResults}
              renderItem={renderSearchResult}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}

        {/* AI Features Info */}
        <View style={styles.infoSection}>
          <Ionicons name="bulb" size={20} color="#FF9500" />
          <Text style={styles.infoTitle}>AI-Powered Features</Text>
          <Text style={styles.infoText}>
            • Semantic search across medical literature{'\n'}
            • Image similarity matching for radiology{'\n'}
            • Clinical guideline recommendations{'\n'}
            • Research paper analysis
          </Text>
        </View>

        {/* Privacy Notice */}
        <View style={styles.privacySection}>
          <Ionicons name="shield-checkmark" size={20} color="#34C759" />
          <Text style={styles.privacyText}>
            All searches are anonymized and GDPR-compliant. No patient data is stored.
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
  searchSection: {
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
    marginBottom: 20,
    lineHeight: 20,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#F2F2F7',
    marginBottom: 16,
  },
  searchIcon: {
    marginTop: 2,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1C1C1E',
    minHeight: 60,
    textAlignVertical: 'top',
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
  },
  searchButtonDisabled: {
    backgroundColor: '#8E8E93',
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  resultsSection: {
    margin: 16,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  resultCard: {
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
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultType: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultTypeText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  similarityBadge: {
    backgroundColor: '#34C759',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  similarityText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  resultDescription: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
    marginBottom: 12,
  },
  resultFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  specialtyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  specialtyText: {
    fontSize: 12,
    color: '#1976D2',
    marginLeft: 4,
  },
  resultDate: {
    fontSize: 12,
    color: '#8E8E93',
  },
  infoSection: {
    backgroundColor: '#FFF3E0',
    margin: 16,
    padding: 16,
    borderRadius: 8,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E65100',
    marginTop: 8,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#E65100',
    lineHeight: 20,
  },
  privacySection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#E8F5E8',
    margin: 16,
    padding: 16,
    borderRadius: 8,
  },
  privacyText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#2E7D32',
    lineHeight: 20,
  },
});









