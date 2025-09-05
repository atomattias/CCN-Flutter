import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
  FlatList,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { fileService, FileMetadata } from '../services/fileService';
import { searchService } from '../services/searchService';
import { CustomButton } from '../components/CustomButton';
import { CustomInput } from '../components/CustomInput';

export const FileManagementScreen: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<FileMetadata[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size' | 'type'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [filters, setFilters] = useState({
    fileType: '',
    channelId: '',
    tags: [] as string[],
    dateRange: { start: '', end: '' },
    encrypted: false,
  });

  useEffect(() => {
    loadFiles();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [files, searchQuery, filters, sortBy, sortOrder]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      // Load files from all channels the user has access to
      const allFiles: FileMetadata[] = [];
      
      // Get files from user's channels
      const userChannels = ['general', 'emergency', 'cardiology']; // This would come from user's channels
      
      for (const channelId of userChannels) {
        try {
          const channelFiles = await fileService.getChannelFiles(channelId);
          allFiles.push(...channelFiles);
        } catch (error) {
          console.error(`Failed to load files from channel ${channelId}:`, error);
        }
      }
      
      setFiles(allFiles);
    } catch (error) {
      console.error('Failed to load files:', error);
      Alert.alert('Error', 'Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFiles();
    setRefreshing(false);
  };

  const applyFiltersAndSort = () => {
    let filtered = [...files];

    // Apply search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(file =>
        file.originalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        file.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply file type filter
    if (filters.fileType) {
      filtered = filtered.filter(file => file.mimeType.includes(filters.fileType));
    }

    // Apply channel filter
    if (filters.channelId) {
      filtered = filtered.filter(file => file.channelId === filters.channelId);
    }

    // Apply tags filter
    if (filters.tags.length > 0) {
      filtered = filtered.filter(file =>
        filters.tags.some(tag => file.tags.includes(tag))
      );
    }

    // Apply date range filter
    if (filters.dateRange.start && filters.dateRange.end) {
      filtered = filtered.filter(file => {
        const fileDate = new Date(file.uploadedAt);
        const startDate = new Date(filters.dateRange.start);
        const endDate = new Date(filters.dateRange.end);
        return fileDate >= startDate && fileDate <= endDate;
      });
    }

    // Apply encryption filter
    if (filters.encrypted) {
      filtered = filtered.filter(file => file.isEncrypted);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.originalName.localeCompare(b.originalName);
          break;
        case 'date':
          comparison = new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
          break;
        case 'size':
          comparison = a.size - b.size;
          break;
        case 'type':
          comparison = a.mimeType.localeCompare(b.mimeType);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredFiles(filtered);
  };

  const handleFileUpload = async () => {
    try {
      const documentResult = await fileService.pickDocument();
      
      if (documentResult.canceled || !documentResult.assets || documentResult.assets.length === 0) {
        return;
      }

      const asset = documentResult.assets[0];
      
      // Validate file
      const validation = await fileService.validateFile(asset.uri);
      if (!validation.valid) {
        Alert.alert('Invalid File', validation.errors.join('\n'));
        return;
      }

      // Show upload modal for additional metadata
      setShowUploadModal(true);
      
      // Upload file with progress tracking
      const uploadOptions = {
        channelId: 'general', // Default channel, user can change
        tags: [],
        encrypt: false,
        onProgress: (progress: { loaded: number; total: number; percentage: number }) => {
          setUploadProgress(prev => ({
            ...prev,
            [asset.uri]: progress.percentage,
          }));
        },
      };

      const uploadedFile = await fileService.uploadFile(asset.uri, uploadOptions);
      
      // Add to files list
      setFiles(prev => [uploadedFile, ...prev]);
      
      // Clear progress
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[asset.uri];
        return newProgress;
      });
      
      setShowUploadModal(false);
      Alert.alert('Success', 'File uploaded successfully!');
      
    } catch (error) {
      console.error('File upload failed:', error);
      Alert.alert('Upload Failed', 'Failed to upload file');
    }
  };

  const handleFileDownload = async (file: FileMetadata) => {
    try {
      Alert.alert(
        'Download File',
        `Download ${file.originalName}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Download',
            onPress: async () => {
              try {
                const localUri = await fileService.downloadFile(file._id, {
                  onProgress: (progress) => {
                    console.log(`Download progress: ${progress.percentage}%`);
                  },
                });
                Alert.alert('Download Complete', `File saved to: ${localUri}`);
              } catch (error) {
                Alert.alert('Download Failed', 'Failed to download file');
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('File download failed:', error);
      Alert.alert('Error', 'Failed to download file');
    }
  };

  const handleFileDelete = async (file: FileMetadata) => {
    Alert.alert(
      'Delete File',
      `Are you sure you want to delete ${file.originalName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await fileService.deleteFile(file._id);
              setFiles(prev => prev.filter(f => f._id !== file._id));
              Alert.alert('Success', 'File deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete file');
            }
          },
        },
      ]
    );
  };

  const handleFileSelection = (fileId: string) => {
    const newSelection = new Set(selectedFiles);
    if (newSelection.has(fileId)) {
      newSelection.delete(fileId);
    } else {
      newSelection.add(fileId);
    }
    setSelectedFiles(newSelection);
  };

  const handleBulkAction = (action: 'delete' | 'download' | 'tag') => {
    if (selectedFiles.size === 0) {
      Alert.alert('No Selection', 'Please select files first');
      return;
    }

    switch (action) {
      case 'delete':
        Alert.alert(
          'Delete Files',
          `Delete ${selectedFiles.size} selected files?`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: async () => {
                try {
                  for (const fileId of selectedFiles) {
                    await fileService.deleteFile(fileId);
                  }
                  setFiles(prev => prev.filter(f => !selectedFiles.has(f._id)));
                  setSelectedFiles(new Set());
                  Alert.alert('Success', 'Files deleted successfully');
                } catch (error) {
                  Alert.alert('Error', 'Failed to delete some files');
                }
              },
            },
          ]
        );
        break;
      case 'download':
        Alert.alert('Download Files', `Download ${selectedFiles.size} files? This may take a while.`);
        // Implement bulk download
        break;
      case 'tag':
        // Show tag input modal
        break;
    }
  };

  const renderFileItem = ({ item }: { item: FileMetadata }) => {
    const isSelected = selectedFiles.has(item._id);
    const isUploading = uploadProgress[item.uri || ''] !== undefined;
    const uploadPercentage = uploadProgress[item.uri || ''];

    return (
      <TouchableOpacity
        style={[styles.fileItem, isSelected && styles.fileItemSelected]}
        onPress={() => handleFileSelection(item._id)}
        onLongPress={() => {
          Alert.alert(
            item.originalName,
            'Choose action:',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Download', onPress: () => handleFileDownload(item) },
              { text: 'Delete', style: 'destructive', onPress: () => handleFileDelete(item) },
              { text: 'Share', onPress: () => Alert.alert('Share', 'Share functionality coming soon') },
            ]
          );
        }}
      >
        <View style={styles.fileHeader}>
          <View style={styles.fileIcon}>
            <Text style={styles.fileIconText}>
              {fileService.getFileIcon(item.mimeType)}
            </Text>
          </View>
          
          <View style={styles.fileInfo}>
            <Text style={styles.fileName} numberOfLines={2}>
              {item.originalName}
            </Text>
            <Text style={styles.fileMeta}>
              {fileService.formatFileSize(item.size)} • {new Date(item.uploadedAt).toLocaleDateString()}
            </Text>
            {item.tags.length > 0 && (
              <View style={styles.fileTags}>
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
          </View>
          
          <View style={styles.fileActions}>
            {isUploading && (
              <View style={styles.uploadProgress}>
                <Text style={styles.uploadPercentage}>{uploadPercentage}%</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${uploadPercentage}%` }]} />
                </View>
              </View>
            )}
            
            {item.isEncrypted && (
              <Ionicons name="lock-closed" size={16} color="#34C759" />
            )}
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleFileDownload(item)}
            >
              <Ionicons name="download" size={20} color="#007AFF" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading Files...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>File Management</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowFilterModal(true)}
          >
            <Ionicons name="filter" size={24} color="#007AFF" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            <Ionicons
              name={viewMode === 'grid' ? 'list' : 'grid'}
              size={24}
              color="#007AFF"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <CustomInput
          placeholder="Search files..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon={<Ionicons name="search" size={20} color="#8E8E93" />}
        />
      </View>

      {/* Bulk Actions */}
      {selectedFiles.size > 0 && (
        <View style={styles.bulkActions}>
          <Text style={styles.bulkActionsText}>
            {selectedFiles.size} file(s) selected
          </Text>
          <View style={styles.bulkActionButtons}>
            <CustomButton
              title="Download"
              onPress={() => handleBulkAction('download')}
              variant="secondary"
              size="small"
            />
            <CustomButton
              title="Delete"
              onPress={() => handleBulkAction('delete')}
              variant="destructive"
              size="small"
            />
          </View>
        </View>
      )}

      {/* Sort Controls */}
      <View style={styles.sortControls}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'name' && styles.sortButtonActive]}
          onPress={() => setSortBy('name')}
        >
          <Text style={styles.sortButtonText}>Name</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'date' && styles.sortButtonActive]}
          onPress={() => setSortBy('date')}
        >
          <Text style={styles.sortButtonText}>Date</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'size' && styles.sortButtonActive]}
          onPress={() => setSortBy('size')}
        >
          <Text style={styles.sortButtonText}>Size</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.sortOrderButton}
          onPress={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
        >
          <Ionicons
            name={sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'}
            size={16}
            color="#007AFF"
          />
        </TouchableOpacity>
      </View>

      {/* File List */}
      <FlatList
        data={filteredFiles}
        renderItem={renderFileItem}
        keyExtractor={(item) => item._id}
        style={styles.fileList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="document-outline" size={64} color="#8E8E93" />
            <Text style={styles.emptyStateText}>No files found</Text>
            <Text style={styles.emptyStateSubtext}>
              {searchQuery ? 'Try adjusting your search or filters' : 'Upload your first file to get started'}
            </Text>
          </View>
        }
      />

      {/* Upload Button */}
      <TouchableOpacity
        style={styles.uploadButton}
        onPress={handleFileUpload}
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>

      {/* Upload Modal */}
      <Modal
        visible={showUploadModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Upload File</Text>
            <Text style={styles.modalSubtitle}>Configure upload settings</Text>
            
            <CustomInput
              label="Channel"
              placeholder="Select channel"
              value="General"
              onChangeText={() => {}}
            />
            
            <CustomInput
              label="Tags (comma separated)"
              placeholder="Enter tags"
              onChangeText={() => {}}
            />
            
            <View style={styles.modalActions}>
              <CustomButton
                title="Cancel"
                onPress={() => setShowUploadModal(false)}
                variant="outline"
              />
              <CustomButton
                title="Upload"
                onPress={() => setShowUploadModal(false)}
                variant="primary"
              />
            </View>
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
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 16,
  },
  headerButton: {
    padding: 8,
  },
  searchContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  bulkActions: {
    backgroundColor: '#007AFF',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bulkActionsText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  bulkActionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  sortControls: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  sortLabel: {
    fontSize: 14,
    color: '#8E8E93',
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
  },
  sortButtonActive: {
    backgroundColor: '#007AFF',
  },
  sortButtonText: {
    fontSize: 12,
    color: '#000000',
  },
  sortOrderButton: {
    padding: 8,
  },
  fileList: {
    flex: 1,
  },
  fileItem: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  fileItemSelected: {
    backgroundColor: '#E3F2FD',
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  fileHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  fileIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  fileIconText: {
    fontSize: 24,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  fileMeta: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
  },
  fileTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  tag: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: '#007AFF',
  },
  moreTags: {
    fontSize: 12,
    color: '#8E8E93',
    alignSelf: 'center',
  },
  fileActions: {
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  uploadProgress: {
    alignItems: 'center',
    marginBottom: 8,
  },
  uploadPercentage: {
    fontSize: 12,
    color: '#007AFF',
    marginBottom: 4,
  },
  progressBar: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E5EA',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
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
  },
  uploadButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
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
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
});



