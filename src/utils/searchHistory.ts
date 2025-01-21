const SEARCH_HISTORY_KEY = 'search_history';
const MAX_HISTORY_ITEMS = 10;

export type SearchHistoryItem = {
  query: string;
  timestamp: number;
};

export function getSearchHistory(): SearchHistoryItem[] {
  if (typeof window === 'undefined') return [];
  
  const history = localStorage.getItem(SEARCH_HISTORY_KEY);
  return history ? JSON.parse(history) : [];
}

export function addSearchHistory(query: string): void {
  if (typeof window === 'undefined' || !query.trim()) return;

  const history = getSearchHistory();
  const newItem: SearchHistoryItem = {
    query: query.trim(),
    timestamp: Date.now(),
  };

  // 重複を削除
  const filteredHistory = history.filter(
    (item) => item.query.toLowerCase() !== query.toLowerCase()
  );

  // 新しい検索クエリを先頭に追加
  const newHistory = [newItem, ...filteredHistory].slice(0, MAX_HISTORY_ITEMS);

  localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
}

export function removeSearchHistory(query: string): void {
  if (typeof window === 'undefined') return;

  const history = getSearchHistory();
  const newHistory = history.filter(
    (item) => item.query.toLowerCase() !== query.toLowerCase()
  );

  localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
}

export function clearSearchHistory(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SEARCH_HISTORY_KEY);
} 