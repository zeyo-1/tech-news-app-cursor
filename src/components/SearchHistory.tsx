'use client';

import { useState, useEffect } from 'react';
import { SearchHistoryItem, getSearchHistory, removeSearchHistory, clearSearchHistory } from '@/utils/searchHistory';

type SearchHistoryProps = {
  onSelect: (query: string) => void;
  className?: string;
};

export default function SearchHistory({ onSelect, className = '' }: SearchHistoryProps) {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);

  useEffect(() => {
    setHistory(getSearchHistory());
  }, []);

  const handleRemove = (query: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeSearchHistory(query);
    setHistory(getSearchHistory());
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearSearchHistory();
    setHistory([]);
  };

  if (history.length === 0) return null;

  return (
    <div className={`bg-white rounded-lg shadow-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-700">検索履歴</h3>
        <button
          onClick={handleClear}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          すべて削除
        </button>
      </div>
      <div className="space-y-2">
        {history.map((item) => (
          <div
            key={item.timestamp}
            onClick={() => onSelect(item.query)}
            className="flex items-center justify-between p-2 rounded hover:bg-gray-50 cursor-pointer group"
          >
            <div className="flex items-center space-x-2">
              <span className="text-gray-400">🕒</span>
              <span className="text-sm text-gray-700">{item.query}</span>
            </div>
            <button
              onClick={(e) => handleRemove(item.query, e)}
              className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
} 