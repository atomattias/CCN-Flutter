import { ApiService } from './api';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { Platform, Alert } from 'react-native';

export interface FileMetadata {
  _id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedBy: string;
  channelId: string;
  uploadedAt: string;
  updatedAt: string;
  isEncrypted: boolean;
  checksum: string;
  tags: string[];
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface FileUploadOptions {
  channelId: string;
  tags?: string[];
  encrypt?: boolean;
  onProgress?: (progress: UploadProgress) => void;
}

export interface FileDownloadOptions {
  onProgress?: (progress: UploadProgress) => void;
}

class FileService {
  private api: ApiService;
  private readonly MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
  private readonly ALLOWED_MIME_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/zip',
    'application/x-rar-compressed',
  ];

  constructor() {
    this.api = new ApiService();
  }

  // Pick a document from device
  async pickDocument(): Promise<DocumentPicker.DocumentResult> {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: this.ALLOWED_MIME_TYPES,
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled) {
        throw new Error('Document picking was cancelled');
      }

      if (!result.assets || result.assets.length === 0) {
        throw new Error('No document selected');
      }

      const asset = result.assets[0];
      
      // Validate file size
      if (asset.size && asset.size > this.MAX_FILE_SIZE) {
        throw new Error(`File size exceeds maximum limit of ${this.MAX_FILE_SIZE / (1024 * 1024)}MB`);
      }

      // Validate MIME type
      if (asset.mimeType && !this.ALLOWED_MIME_TYPES.includes(asset.mimeType)) {
        throw new Error('File type not supported');
      }

      return result;
    } catch (error) {
      console.error('Document picking failed:', error);
      throw error;
    }
  }

  // Upload file to channel
  async uploadFile(fileUri: string, options: FileUploadOptions): Promise<FileMetadata> {
    try {
      // Get file info
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!fileInfo.exists) {
        throw new Error('File does not exist');
      }

      // Create form data
      const formData = new FormData();
      formData.append('file', {
        uri: fileUri,
        type: this.getMimeType(fileUri),
        name: this.getFileName(fileUri),
      } as any);
      
      formData.append('channelId', options.channelId);
      if (options.tags) {
        formData.append('tags', JSON.stringify(options.tags));
      }
      formData.append('encrypt', options.encrypt ? 'true' : 'false');

      // Upload with progress tracking
      const response = await this.api.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (options.onProgress && progressEvent.total) {
            const progress: UploadProgress = {
              loaded: progressEvent.loaded,
              total: progressEvent.total,
              percentage: Math.round((progressEvent.loaded / progressEvent.total) * 100),
            };
            options.onProgress(progress);
          }
        },
      });

      return response.data.data;
    } catch (error) {
      console.error('File upload failed:', error);
      throw error;
    }
  }

  // Download file
  async downloadFile(fileId: string, options: FileDownloadOptions = {}): Promise<string> {
    try {
      // Get file metadata first
      const metadata = await this.getFileMetadata(fileId);
      
      // Create download directory if it doesn't exist
      const downloadDir = `${FileSystem.documentDirectory}downloads/`;
      const dirInfo = await FileSystem.getInfoAsync(downloadDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(downloadDir, { intermediates: true });
      }

      // Download file
      const downloadResumable = FileSystem.createDownloadResumable(
        `${this.api.baseURL}/files/${fileId}/download`,
        `${downloadDir}${metadata.originalName}`,
        {},
        (downloadProgress) => {
          if (options.onProgress) {
            const progress: UploadProgress = {
              loaded: downloadProgress.totalBytesWritten,
              total: downloadProgress.totalBytesExpectedToWrite,
              percentage: Math.round((downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite) * 100),
            };
            options.onProgress(progress);
          }
        }
      );

      const result = await downloadResumable.downloadAsync();
      if (!result) {
        throw new Error('Download failed');
      }

      return result.uri;
    } catch (error) {
      console.error('File download failed:', error);
      throw error;
    }
  }

  // Get file metadata
  async getFileMetadata(fileId: string): Promise<FileMetadata> {
    try {
      const response = await this.api.get(`/files/${fileId}`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to get file metadata:', error);
      throw error;
    }
  }

  // Get files in a channel
  async getChannelFiles(channelId: string): Promise<FileMetadata[]> {
    try {
      const response = await this.api.get(`/files/channel/${channelId}`);
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to get channel files:', error);
      throw error;
    }
  }

  // Search files
  async searchFiles(query: string, channelId?: string): Promise<FileMetadata[]> {
    try {
      const params = new URLSearchParams();
      params.append('q', query);
      if (channelId) params.append('channelId', channelId);

      const response = await this.api.get(`/files/search?${params.toString()}`);
      return response.data.data || [];
    } catch (error) {
      console.error('File search failed:', error);
      throw error;
    }
  }

  // Delete file
  async deleteFile(fileId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.api.delete(`/files/${fileId}`);
      return response.data.data;
    } catch (error) {
      console.error('File deletion failed:', error);
      throw error;
    }
  }

  // Update file tags
  async updateFileTags(fileId: string, tags: string[]): Promise<FileMetadata> {
    try {
      const response = await this.api.put(`/files/${fileId}/tags`, { tags });
      return response.data.data;
    } catch (error) {
      console.error('Failed to update file tags:', error);
      throw error;
    }
  }

  // Get file preview URL
  getFilePreviewUrl(fileId: string): string {
    return `${this.api.baseURL}/files/${fileId}/preview`;
  }

  // Get file download URL
  getFileDownloadUrl(fileId: string): string {
    return `${this.api.baseURL}/files/${fileId}/download`;
  }

  // Check if file type is supported
  isFileTypeSupported(mimeType: string): boolean {
    return this.ALLOWED_MIME_TYPES.includes(mimeType);
  }

  // Get file size in human readable format
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Get file icon based on MIME type
  getFileIcon(mimeType: string): string {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('video/')) return '🎥';
    if (mimeType.startsWith('audio/')) return '🎵';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📽️';
    if (mimeType.includes('zip') || mimeType.includes('rar')) return '📦';
    if (mimeType.includes('text')) return '📄';
    return '📎';
  }

  // Validate file before upload
  async validateFile(fileUri: string): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      
      if (!fileInfo.exists) {
        errors.push('File does not exist');
        return { valid: false, errors };
      }

      if (fileInfo.size && fileInfo.size > this.MAX_FILE_SIZE) {
        errors.push(`File size exceeds maximum limit of ${this.MAX_FILE_SIZE / (1024 * 1024)}MB`);
      }

      const mimeType = this.getMimeType(fileUri);
      if (mimeType && !this.isFileTypeSupported(mimeType)) {
        errors.push('File type not supported');
      }

      return { valid: errors.length === 0, errors };
    } catch (error) {
      errors.push('Failed to validate file');
      return { valid: false, errors };
    }
  }

  // Private helper methods
  private getMimeType(uri: string): string {
    const extension = uri.split('.').pop()?.toLowerCase();
    const mimeTypes: { [key: string]: string } = {
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'ppt': 'application/vnd.ms-powerpoint',
      'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'txt': 'text/plain',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'zip': 'application/zip',
      'rar': 'application/x-rar-compressed',
    };
    
    return mimeTypes[extension || ''] || 'application/octet-stream';
  }

  private getFileName(uri: string): string {
    return uri.split('/').pop() || 'unknown_file';
  }
}

export const fileService = new FileService();
export default fileService;



