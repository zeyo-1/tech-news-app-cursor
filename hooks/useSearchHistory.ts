'use client'

import { useState, useEffect } from 'react'

const SEARCH_HISTORY_KEY = 'search_history'
const MAX_HISTORY_ITEMS = 10

export interface SearchHistoryItem {
  query: string
  timestamp: number
}

export function useSearchHistory() {
  const [history, setHistory] = useState<SearchHistoryItem[]>([])

  // 初期化時に履歴を読み込む
  useEffect(() => {
    const savedHistory = localStorage.getItem(SEARCH_HISTORY_KEY)
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory))
    }
  }, [])

  // 検索クエリを履歴に追加
  const addToHistory = (query: string) => {
    if (!query.trim()) return

    const newItem: SearchHistoryItem = {
      query: query.trim(),
      timestamp: Date.now(),
    }

    setHistory((prev) => {
      // 重複を除去
      const filteredHistory = prev.filter(
        (item) => item.query.toLowerCase() !== query.toLowerCase()
      )

      // 新しい検索クエリを先頭に追加
      const newHistory = [newItem, ...filteredHistory].slice(0, MAX_HISTORY_ITEMS)

      // ローカルストレージに保存
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory))

      return newHistory
    })
  }

  // 履歴から項目を削除
  const removeFromHistory = (query: string) => {
    setHistory((prev) => {
      const newHistory = prev.filter(
        (item) => item.query.toLowerCase() !== query.toLowerCase()
      )
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory))
      return newHistory
    })
  }

  // 履歴を全て削除
  const clearHistory = () => {
    localStorage.removeItem(SEARCH_HISTORY_KEY)
    setHistory([])
  }

  return {
    history,
    addToHistory,
    removeFromHistory,
    clearHistory,
  }
} 