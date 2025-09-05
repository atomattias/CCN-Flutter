import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { searchService, SearchQuery, SearchResult, SearchResponse } from '../services/searchService';
import { CustomButton } from '../components/CustomButton';

export const GlobalSearchScreen: React.FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [searchType, setSearchType] = useState<'all' | 'messages' | 'files' | 'users' | 'channels'>('all');
  const [filters, setFilters] = useState({
    dateRange: { start: '', end: '' },
    channelId: '',
    userId: '',
    fileType: '',
    tags: [] as string[],
    encrypted: false,
  });
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [popularSearches, setPopularSearches] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    loadSearchData();
  }, []);

  useEffect(() => {
    if (searchInput.trim()) {
      // Debounce search input
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      
      searchTimeoutRef.current = setTimeout(() => {
        handleSearchInput(searchInput);
      }, 300);
    } else {
      setSuggestions([]);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchInput]);

  const loadSearchData = async () => {
    try {
      const [history, autocomplete] = await Promise.all([
        searchService.getSearchHistory(),
        searchService.getAutocomplete('', 'all'),
      ]);
      
      setSearchHistory(history.map(h => h.query));
      setRecentSearches(autocomplete.recent);
      setPopularSearches(autocomplete.popular);
    } catch (error) {
      console.error('Failed to load search data:', error);
    }
  };

  const handleSearchInput = async (input: string) => {
    if (input.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const suggestions = await searchService.getSearchSuggestions(input, searchType);
      setSuggestions(suggestions);
    } catch (error) {
      console.error('Failed to get suggestions:', error);
    }
  };

  const performSearch = async (query: string, type: string = 'all') => {
    if (!query.trim()) return;

    try {
      setLoading(true);
      setSearchQuery(query);
      
      const searchQuery: SearchQuery = {
        query: query.trim(),
        type: type as any,
        filters,
        sortBy: 'relevance',
        sortOrder: 'desc',
        limit: 50,
        offset: 0,
      };

      const response: SearchResponse = await searchService.search(searchQuery);
      setSearchResults(response.results);
      
      // Add to recent searches
      if (!recentSearches.includes(query)) {
        setRecentSearches(prev => [query, ...prev.slice(0, 9)]);
      }
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchInput.trim()) {
      performSearch(searchInput, searchType);
    }
  };

  const handleQuickSearch = (query: string) => {
    setSearchInput(query);
    performSearch(query, searchType);
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      dateRange: { start: '', end: '' },
      channelId: '',
      userId: '',
      fileType: '',
      tags: [],
      encrypted: false,
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSearchData();
    if (searchQuery) {
      await performSearch(searchQuery, searchType);
    }
    setRefreshing(false);
  };

  const renderSearchResult = ({ item }: { item: SearchResult }) => {
    const getResultIcon = (type: string) => {
      switch (type) {
        case 'message':
          return 'chatbubble';
        case 'file':
          return 'document';
        case 'user':
          return 'person';
        case 'channel':
          return 'people';
        default:
          return 'search';
      }
    };

    const getResultColor = (type: string) => {
      switch (type) {
        case 'message':
          return '#007AFF';
        case 'file':
          return '#34C759';
        case 'user':
          return '#FF9500';
        case 'channel':
          return '#AF52DE';
        default:
          return '#8E8E93';
      }
    };

    return (
      <TouchableOpacity style={styles.resultItem}>
        <View style={styles.resultHeader}>
          <View style={[styles.resultIcon, { backgroundColor: getResultColor(item.type) }]}>
            <Ionicons name={getResultIcon(item.type)} size={20} color="white" />
          </View>
          
          <View style={styles.resultInfo}>
            <Text style={styles.resultTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={styles.resultMeta}>
              {item.metadata.channelName && `${item.metadata.channelName} • `}
              {new Date(item.metadata.timestamp).toLocaleDateString()}
              {item.metadata.encrypted && ' • 🔒 Encrypted'}
            </Text>
          </View>
          
          <View style={styles.resultActions}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="ellipsis-vertical" size={20} color="#8E8E93" />
            </TouchableOpacity>
          </View>
        </View>
        
        <Text style={styles.resultContent} numberOfLines={3}>
          {item.content}
        </Text>
        
        {item.metadata.tags && item.metadata.tags.length > 0 && (
          <View style={styles.resultTags}>
            {item.metadata.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
            {item.metadata.tags.length > 3 && (
              <Text style={styles.moreTags}>+{item.metadata.tags.length - 3}</Text>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderSearchSuggestions = () => (
    <View style={styles.suggestionsContainer}>
      {suggestions.length > 0 && (
        <View style={styles.suggestionSection}>
          <Text style={styles.suggestionTitle}>Suggestions</Text>
          {suggestions.map((suggestion, index) => (
            <TouchableOpacity
              key={index}
              style={styles.suggestionItem}
              onPress={() => handleQuickSearch(suggestion)}
            >
              <Ionicons name="search" size={16} color="#8E8E93" />
              <Text style={styles.suggestionText}>{suggestion}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      
      {recentSearches.length > 0 && (
        <View style={styles.suggestionSection}>
          <Text style={styles.suggestionTitle}>Recent Searches</Text>
          {recentSearches.map((search, index) => (
            <TouchableOpacity
              key={index}
              style={styles.suggestionItem}
              onPress={() => handleQuickSearch(search)}
            >
              <Ionicons name="time" size={16} color="#8E8E93" />
              <Text style={styles.suggestionText}>{search}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      
      {popularSearches.length > 0 && (
        <View style={styles.suggestionSection}>
          <Text style={styles.suggestionTitle}>Popular Searches</Text>
          {popularSearches.map((search, index) => (
            <TouchableOpacity
              key={index}
              style={styles.suggestionItem}
              onPress={() => handleQuickSearch(search)}
            >
              <Ionicons name="trending-up" size={16} color="#8E8E93" />
              <Text style={styles.suggestionText}>{search}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      <View style={styles.filterHeader}>
        <Text style={styles.filterTitle}>Search Filters</Text>
        <TouchableOpacity onPress={clearFilters}>
          <Text style={styles.clearFiltersText}>Clear All</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.filterRow}>
        <Text style={styles.filterLabel}>Search Type:</Text>
        <View style={styles.filterOptions}>
          {(['all', 'messages', 'files', 'users', 'channels'] as const).map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.filterOption,
                searchType === type && styles.filterOptionActive,
              ]}
              onPress={() => setSearchType(type)}
            >
              <Text style={[
                styles.filterOptionText,
                searchType === type && styles.filterOptionTextActive,
              ]}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <View style={styles.filterRow}>
        <Text style={styles.filterLabel}>Encrypted Only:</Text>
        <TouchableOpacity
          style={[
            styles.filterToggle,
            filters.encrypted && styles.filterToggleActive,
          ]}
          onPress={() => handleFilterChange('encrypted', !filters.encrypted)}
        >
          <Ionicons
            name={filters.encrypted ? 'checkmark' : 'close'}
            size={16}
            color={filters.encrypted ? 'white' : '#8E8E93'}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchHeader}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#8E8E93" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search messages, files, users, channels..."
            value={searchInput}
            onChangeText={setSearchInput}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchInput.length > 0 && (
            <TouchableOpacity onPress={() => setSearchInput('')}>
              <Ionicons name="close-circle" size={20} color="#8E8E93" />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons name="filter" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      {showFilters && renderFilters()}

      {/* Search Results or Suggestions */}
      {searchQuery ? (
        <FlatList
          data={searchResults}
          renderItem={renderSearchResult}
          keyExtractor={(item) => item.id}
          style={styles.resultsList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListHeaderComponent={
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsTitle}>
                {loading ? 'Searching...' : `Found ${searchResults.length} results`}
              </Text>
              {searchQuery && (
                <Text style={styles.searchQueryText}>
                  for "{searchQuery}"
                </Text>
              )}
            </View>
          }
          ListEmptyComponent={
            !loading && (
              <View style={styles.emptyResults}>
                <Ionicons name="search" size={64} color="#8E8E93" />
                <Text style={styles.emptyResultsText}>No results found</Text>
                <Text style={styles.emptyResultsSubtext}>
                  Try adjusting your search terms or filters
                </Text>
              </View>
            )
          }
        />
      ) : (
        <ScrollView
          style={styles.suggestionsList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {renderSearchSuggestions()}
        </ScrollView>
      )}

      {/* Loading Overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  searchHeader: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
    marginLeft: 8,
  },
  filterButton: {
    padding: 8,
  },
  filtersContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  clearFiltersText: {
    fontSize: 14,
    color: '#007AFF',
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 14,
    color: '#000000',
  },
  filterOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  filterOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
  },
  filterOptionActive: {
    backgroundColor: '#007AFF',
  },
  filterOptionText: {
    fontSize: 12,
    color: '#000000',
  },
  filterOptionTextActive: {
    color: 'white',
  },
  filterToggle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterToggleActive: {
    backgroundColor: '#007AFF',
  },
  suggestionsContainer: {
    padding: 16,
  },
  suggestionSection: {
    marginBottom: 24,
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  suggestionText: {
    fontSize: 16,
    color: '#000000',
    marginLeft: 12,
  },
  resultsList: {
    flex: 1,
  },
  resultsHeader: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  searchQueryText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  resultItem: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 4,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  resultIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  resultInfo: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  resultMeta: {
    fontSize: 14,
    color: '#8E8E93',
  },
  resultActions: {
    marginLeft: 8,
  },
  actionButton: {
    padding: 4,
  },
  resultContent: {
    fontSize: 14,
    color: '#000000',
    lineHeight: 20,
    marginBottom: 12,
  },
  resultTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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
  suggestionsList: {
    flex: 1,
  },
  emptyResults: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyResultsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyResultsSubtext: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8E8E93',
  },
});



