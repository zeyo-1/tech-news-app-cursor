'use client';

import { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { addSearchHistory } from '@/utils/searchHistory';
import SearchHistory from './SearchHistory';
import SearchSuggestions from './SearchSuggestions';

type Suggestion = {
  title: string;
  category: string;
};

type SearchBarProps = {
  onSearch: (query: string) => void;
};

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [titleSuggestions, setTitleSuggestions] = useState<Suggestion[]>([]);
  const [categorySuggestions, setCategorySuggestions] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const debouncedQuery = useDebounce(query, 300);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onSearch(debouncedQuery);
    if (debouncedQuery.trim()) {
      addSearchHistory(debouncedQuery);
      fetchSuggestions(debouncedQuery);
    } else {
      setTitleSuggestions([]);
      setCategorySuggestions([]);
    }
  }, [debouncedQuery, onSearch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowHistory(false);
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchSuggestions = async (searchQuery: string) => {
    try {
      const response = await fetch(
        `/api/articles/suggestions?q=${encodeURIComponent(searchQuery)}`
      );
      if (!response.ok) throw new Error('Failed to fetch suggestions');

      const data = await response.json();
      setTitleSuggestions(data.suggestions.titles);
      setCategorySuggestions(data.suggestions.categories);
      setShowSuggestions(true);
      setSelectedIndex(-1);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const suggestions = [...titleSuggestions.map(s => s.title), ...categorySuggestions];
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          e.preventDefault();
          handleSuggestionSelect(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setShowHistory(false);
        break;
    }
  };

  const handleClear = () => {
    setQuery('');
    setShowHistory(false);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleHistorySelect = (selectedQuery: string) => {
    setQuery(selectedQuery);
    setShowHistory(false);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleSuggestionSelect = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="relative mb-6">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowHistory(true)}
          onKeyDown={handleKeyDown}
          placeholder="記事を検索..."
          className="w-full px-4 py-2 pl-10 pr-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          🔍
        </span>
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>

      {showSuggestions && query ? (
        <div className="absolute z-10 w-full mt-1">
          <SearchSuggestions
            query={query}
            titleSuggestions={titleSuggestions}
            categorySuggestions={categorySuggestions}
            onSelect={handleSuggestionSelect}
            onClose={() => setShowSuggestions(false)}
            className="border border-gray-200"
            selectedIndex={selectedIndex}
          />
        </div>
      ) : showHistory && !query ? (
        <div className="absolute z-10 w-full mt-1">
          <SearchHistory
            onSelect={handleHistorySelect}
            className="border border-gray-200"
          />
        </div>
      ) : null}
    </div>
  );
} 