'use client';

import { useEffect, useRef } from 'react';
import Highlight from '@/utils/highlight';

type Suggestion = {
  title: string;
  category: string;
};

type SearchSuggestionsProps = {
  query: string;
  titleSuggestions: Suggestion[];
  categorySuggestions: string[];
  onSelect: (query: string) => void;
  onClose: () => void;
  className?: string;
  selectedIndex: number;
};

export default function SearchSuggestions({
  query,
  titleSuggestions,
  categorySuggestions,
  onSelect,
  onClose,
  className = '',
  selectedIndex,
}: SearchSuggestionsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && selectedIndex >= 0) {
      const selectedElement = containerRef.current.querySelector(
        `[data-index="${selectedIndex}"]`
      );
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth',
        });
      }
    }
  }, [selectedIndex]);

  if (titleSuggestions.length === 0 && categorySuggestions.length === 0) {
    return null;
  }

  const allSuggestions = [
    ...titleSuggestions.map((suggestion) => ({
      type: 'title' as const,
      text: suggestion.title,
      category: suggestion.category,
    })),
    ...categorySuggestions.map((category) => ({
      type: 'category' as const,
      text: category,
    })),
  ];

  return (
    <div
      ref={containerRef}
      className={`bg-white rounded-lg shadow-lg max-h-80 overflow-y-auto ${className}`}
    >
      <div className="p-2 space-y-1">
        {allSuggestions.map((suggestion, index) => (
          <div
            key={`${suggestion.type}-${suggestion.text}`}
            data-index={index}
            onClick={() => onSelect(suggestion.text)}
            className={`p-2 rounded cursor-pointer hover:bg-gray-50 ${
              selectedIndex === index ? 'bg-gray-100' : ''
            }`}
          >
            <div className="flex items-center space-x-2">
              <span className="text-gray-400">
                {suggestion.type === 'title' ? '🔍' : '📂'}
              </span>
              <div>
                <div className="text-sm text-gray-700">
                  <Highlight text={suggestion.text} query={query} />
                </div>
                {suggestion.type === 'title' && suggestion.category && (
                  <div className="text-xs text-gray-500 mt-0.5">
                    {suggestion.category}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 