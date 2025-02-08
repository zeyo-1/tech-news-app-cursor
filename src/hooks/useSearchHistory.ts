import { useState, useEffect } from 'react'

const MAX_HISTORY_ITEMS = 5
const STORAGE_KEY = 'search_history'

// 古い形式のデータ型を定義
interface OldHistoryItem {
  query: string
  timestamp: number
}

export function useSearchHistory() {
  const [searchHistory, setSearchHistory] = useState<string[]>([])

  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem(STORAGE_KEY)
      if (savedHistory) {
        const parsed = JSON.parse(savedHistory)
        
        // データ形式を判定して適切に変換
        const history = Array.isArray(parsed)
          ? parsed.map(item => {
              if (typeof item === 'string') return item
              if (typeof item === 'object' && item !== null) {
                return (item as OldHistoryItem).query || ''
              }
              return ''
            })
          : []

        // 空の文字列を除外して保存
        const validHistory = history.filter(Boolean)
        setSearchHistory(validHistory)

        // 新しい形式で保存し直す
        if (validHistory.length > 0) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(validHistory))
        }
      }
    } catch (error) {
      console.error('Failed to load search history:', error)
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  const addToHistory = (query: string) => {
    if (!query.trim()) return

    setSearchHistory((prev) => {
      const newHistory = [
        query,
        ...prev.filter((item) => item !== query)
      ].slice(0, MAX_HISTORY_ITEMS)

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory))
      } catch (error) {
        console.error('Failed to save search history:', error)
      }

      return newHistory
    })
  }

  const clearHistory = () => {
    setSearchHistory([])
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.error('Failed to clear search history:', error)
    }
  }

  return {
    searchHistory,
    addToHistory,
    clearHistory
  }
} 