import { ApiService } from './api';
import { encryptionService } from './encryptionService';

export interface SearchQuery {
  query: string;
  type: 'all' | 'messages' | 'files' | 'users' | 'channels';
  filters: {
    dateRange?: {
      start: string;
      end: string;
    };
    channelId?: string;
    userId?: string;
    fileType?: string;
    messageType?: 'text' | 'file' | 'image' | 'video' | 'audio';
    tags?: string[];
    encrypted?: boolean;
  };
  sortBy?: 'relevance' | 'date' | 'name' | 'size';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  id: string;
  type: 'message' | 'file' | 'user' | 'channel';
  title: string;
  content: string;
  metadata: {
    channelId?: string;
    channelName?: string;
    userId?: string;
    userName?: string;
    timestamp: string;
    relevance: number;
    tags?: string[];
    fileSize?: number;
    fileType?: string;
    encrypted?: boolean;
  };
  highlights: {
    field: string;
    snippet: string;
    positions: number[];
  }[];
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  query: string;
  executionTime: number;
  suggestions: string[];
  facets: {
    channels: Array<{ id: string; name: string; count: number }>;
    users: Array<{ id: string; name: string; count: number }>;
    fileTypes: Array<{ type: string; count: number }>;
    tags: Array<{ tag: string; count: number }>;
    dateRanges: Array<{ range: string; count: number }>;
  };
}

export interface SearchHistory {
  id: string;
  query: string;
  timestamp: string;
  resultCount: number;
  filters: any;
}

class SearchService {
  private api: ApiService;
  private readonly SEARCH_HISTORY_KEY = 'ccn_search_history';
  private readonly MAX_HISTORY_ITEMS = 50;

  constructor() {
    this.api = new ApiService();
  }

  // Perform advanced search across all content types
  async search(query: SearchQuery): Promise<SearchResponse> {
    try {
      // Encrypt sensitive search terms if needed
      const encryptedQuery = await this.encryptSearchQuery(query);
      
      const response = await this.api.post('/search/advanced', encryptedQuery);
      const searchResponse = response.data.data;

      // Store search in history
      await this.addToSearchHistory(query, searchResponse.total);

      // Process and decrypt results if needed
      const processedResults = await this.processSearchResults(searchResponse.results);

      return {
        ...searchResponse,
        results: processedResults,
      };
    } catch (error) {
      console.error('Search failed:', error);
      throw new Error('Search operation failed');
    }
  }

  // Search messages with advanced filters
  async searchMessages(query: string, filters?: {
    channelId?: string;
    userId?: string;
    dateRange?: { start: string; end: string };
    messageType?: string;
    encrypted?: boolean;
  }): Promise<SearchResponse> {
    try {
      const searchQuery: SearchQuery = {
        query,
        type: 'messages',
        filters: filters || {},
        sortBy: 'relevance',
        sortOrder: 'desc',
        limit: 50,
      };

      return await this.search(searchQuery);
    } catch (error) {
      console.error('Message search failed:', error);
      throw new Error('Message search failed');
    }
  }

  // Search files with metadata
  async searchFiles(query: string, filters?: {
    channelId?: string;
    fileType?: string;
    dateRange?: { start: string; end: string };
    tags?: string[];
    encrypted?: boolean;
  }): Promise<SearchResponse> {
    try {
      const searchQuery: SearchQuery = {
        query,
        type: 'files',
        filters: filters || {},
        sortBy: 'date',
        sortOrder: 'desc',
        limit: 50,
      };

      return await this.search(searchQuery);
    } catch (error) {
      console.error('File search failed:', error);
      throw new Error('File search failed');
    }
  }

  // Search users with role and specialty filters
  async searchUsers(query: string, filters?: {
    role?: string;
    specialty?: string;
    department?: string;
    location?: string;
    online?: boolean;
  }): Promise<SearchResponse> {
    try {
      const searchQuery: SearchQuery = {
        query,
        type: 'users',
        filters: filters || {},
        sortBy: 'relevance',
        sortOrder: 'desc',
        limit: 50,
      };

      return await this.search(searchQuery);
    } catch (error) {
      console.error('User search failed:', error);
      throw new Error('User search failed');
    }
  }

  // Search channels with access control
  async searchChannels(query: string, filters?: {
    category?: string;
    specialty?: boolean;
    public?: boolean;
    memberCount?: { min: number; max: number };
  }): Promise<SearchResponse> {
    try {
      const searchQuery: SearchQuery = {
        query,
        type: 'channels',
        filters: filters || {},
        sortBy: 'relevance',
        sortOrder: 'desc',
        limit: 50,
      };

      return await this.search(searchQuery);
    } catch (error) {
      console.error('Channel search failed:', error);
      throw new Error('Channel search failed');
    }
  }

  // Get search suggestions based on query
  async getSearchSuggestions(query: string, type?: string): Promise<string[]> {
    try {
      const response = await this.api.get(`/search/suggestions?q=${encodeURIComponent(query)}&type=${type || 'all'}`);
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to get search suggestions:', error);
      return [];
    }
  }

  // Get search autocomplete
  async getAutocomplete(query: string, type?: string): Promise<{
    suggestions: string[];
    recent: string[];
    popular: string[];
  }> {
    try {
      const response = await this.api.get(`/search/autocomplete?q=${encodeURIComponent(query)}&type=${type || 'all'}`);
      return response.data.data || { suggestions: [], recent: [], popular: [] };
    } catch (error) {
      console.error('Failed to get autocomplete:', error);
      return { suggestions: [], recent: [], popular: [] };
    }
  }

  // Get search history
  async getSearchHistory(): Promise<SearchHistory[]> {
    try {
      const historyString = localStorage.getItem(this.SEARCH_HISTORY_KEY);
      if (historyString) {
        return JSON.parse(historyString);
      }
      return [];
    } catch (error) {
      console.error('Failed to get search history:', error);
      return [];
    }
  }

  // Clear search history
  async clearSearchHistory(): Promise<void> {
    try {
      localStorage.removeItem(this.SEARCH_HISTORY_KEY);
    } catch (error) {
      console.error('Failed to clear search history:', error);
    }
  }

  // Get search analytics
  async getSearchAnalytics(timeRange?: { start: string; end: string }): Promise<{
    totalSearches: number;
    popularQueries: Array<{ query: string; count: number }>;
    searchTrends: Array<{ date: string; count: number }>;
    topResults: Array<{ resultId: string; clicks: number }>;
    userSatisfaction: number;
  }> {
    try {
      const params = timeRange ? `?start=${timeRange.start}&end=${timeRange.end}` : '';
      const response = await this.api.get(`/search/analytics${params}`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to get search analytics:', error);
      throw new Error('Failed to get search analytics');
    }
  }

  // Save search as saved search
  async saveSearch(name: string, query: SearchQuery): Promise<{ id: string; success: boolean }> {
    try {
      const response = await this.api.post('/search/saved', { name, query });
      return response.data.data;
    } catch (error) {
      console.error('Failed to save search:', error);
      throw new Error('Failed to save search');
    }
  }

  // Get saved searches
  async getSavedSearches(): Promise<Array<{
    id: string;
    name: string;
    query: SearchQuery;
    createdAt: string;
    lastUsed: string;
  }>> {
    try {
      const response = await this.api.get('/search/saved');
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to get saved searches:', error);
      return [];
    }
  }

  // Delete saved search
  async deleteSavedSearch(searchId: string): Promise<boolean> {
    try {
      await this.api.delete(`/search/saved/${searchId}`);
      return true;
    } catch (error) {
      console.error('Failed to delete saved search:', error);
      return false;
    }
  }

  // Private helper methods

  private async encryptSearchQuery(query: SearchQuery): Promise<SearchQuery> {
    try {
      // Only encrypt sensitive search terms, not metadata
      if (query.filters.encrypted) {
        const encryptedQuery = await encryptionService.encryptMessage({
          content: query.query,
          metadata: {
            senderId: 'current_user',
            channelId: 'search',
            timestamp: new Date().toISOString(),
            messageType: 'text',
          },
        }, 'system_public_key');

        return {
          ...query,
          query: encryptedQuery.encryptedContent,
        };
      }

      return query;
    } catch (error) {
      console.error('Failed to encrypt search query:', error);
      return query;
    }
  }

  private async processSearchResults(results: SearchResult[]): Promise<SearchResult[]> {
    try {
      // Process and decrypt results if needed
      const processedResults = await Promise.all(
        results.map(async (result) => {
          if (result.metadata.encrypted) {
            try {
              // Decrypt encrypted content
              const decryptedContent = await encryptionService.decryptMessage(
                {
                  encryptedContent: result.content,
                  iv: 'placeholder_iv',
                  keyId: 'placeholder_key',
                  algorithm: 'AES-GCM+RSA-OAEP',
                  signature: 'placeholder_signature',
                  timestamp: result.metadata.timestamp,
                  version: '1.0',
                },
                'current_user_private_key'
              );

              return {
                ...result,
                content: decryptedContent.content,
              };
            } catch (error) {
              console.error('Failed to decrypt search result:', error);
              return {
                ...result,
                content: '[Encrypted Content]',
              };
            }
          }

          return result;
        })
      );

      return processedResults;
    } catch (error) {
      console.error('Failed to process search results:', error);
      return results;
    }
  }

  private async addToSearchHistory(query: SearchQuery, resultCount: number): Promise<void> {
    try {
      const history = await this.getSearchHistory();
      const newEntry: SearchHistory = {
        id: Date.now().toString(),
        query: query.query,
        timestamp: new Date().toISOString(),
        resultCount,
        filters: query.filters,
      };

      // Add to beginning of history
      history.unshift(newEntry);

      // Keep only recent searches
      if (history.length > this.MAX_HISTORY_ITEMS) {
        history.splice(this.MAX_HISTORY_ITEMS);
      }

      localStorage.setItem(this.SEARCH_HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Failed to add to search history:', error);
    }
  }

  // Utility methods for search optimization

  // Build search query from user input
  buildSearchQuery(
    userInput: string,
    type: 'all' | 'messages' | 'files' | 'users' | 'channels' = 'all',
    additionalFilters?: any
  ): SearchQuery {
    return {
      query: userInput.trim(),
      type,
      filters: {
        ...additionalFilters,
        encrypted: false, // Default to unencrypted search
      },
      sortBy: 'relevance',
      sortOrder: 'desc',
      limit: 20,
      offset: 0,
    };
  }

  // Parse search query for advanced operators
  parseSearchQuery(query: string): {
    terms: string[];
    operators: Array<{ type: 'AND' | 'OR' | 'NOT'; term: string }>;
    filters: { [key: string]: string };
  } {
    const terms: string[] = [];
    const operators: Array<{ type: 'AND' | 'OR' | 'NOT'; term: string }> = [];
    const filters: { [key: string]: string } = {};

    // Parse query for special operators
    const queryParts = query.split(/\s+/);
    
    for (const part of queryParts) {
      if (part.startsWith('tag:')) {
        filters.tags = part.substring(4);
      } else if (part.startsWith('from:')) {
        filters.userId = part.substring(5);
      } else if (part.startsWith('in:')) {
        filters.channelId = part.substring(3);
      } else if (part.startsWith('type:')) {
        filters.fileType = part.substring(5);
      } else if (part.startsWith('date:')) {
        filters.date = part.substring(5);
      } else if (part === 'AND' || part === 'OR' || part === 'NOT') {
        // Handle logical operators
        if (terms.length > 0) {
          operators.push({ type: part as 'AND' | 'OR' | 'NOT', term: terms[terms.length - 1] });
        }
      } else {
        terms.push(part);
      }
    }

    return { terms, operators, filters };
  }
}

export const searchService = new SearchService();
export default searchService;



