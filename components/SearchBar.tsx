'use client'

import { useState, useRef, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useDebounce } from '@/hooks/useDebounce'
import { useSearchHistory } from '@/hooks/useSearchHistory'
import { SearchHistory } from '@/components/SearchHistory'

interface SearchBarProps {
  onSearch: (query: string) => void
  placeholder?: string
}

export function SearchBar({
  onSearch,
  placeholder = '記事を検索...',
}: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const debouncedQuery = useDebounce(query, 300)
  const { history, addToHistory, removeFromHistory, clearHistory } = useSearchHistory()

  // 検索クエリが変更されたときの処理
  useEffect(() => {
    onSearch(debouncedQuery)
  }, [debouncedQuery, onSearch])

  // 検索を実行する
  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query)
      addToHistory(query)
    }
  }

  // Enterキーのハンドリング
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSearch()
    }
  }

  // クリックイベントのハンドリング
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowHistory(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // 検索をクリアする
  const handleClear = () => {
    setQuery('')
    onSearch('')
    inputRef.current?.focus()
  }

  // 検索履歴から選択
  const handleHistorySelect = (selectedQuery: string) => {
    setQuery(selectedQuery)
    onSearch(selectedQuery)
    setShowHistory(false)
  }

  return (
    <div ref={containerRef} className="relative">
      <div
        className={`
          relative flex items-center transition-all duration-200
          ${isFocused ? 'ring-2 ring-primary ring-offset-2' : ''}
          rounded-lg bg-background
        `}
      >
        <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            setIsFocused(true)
            setShowHistory(true)
          }}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="pl-9 pr-24"
        />
        <div className="absolute right-1 flex items-center gap-1">
          {query && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 px-0"
              onClick={handleClear}
              aria-label="検索をクリア"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <Button
            size="sm"
            className="h-7"
            onClick={handleSearch}
            aria-label="検索を実行"
          >
            検索
          </Button>
        </div>
      </div>

      {showHistory && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50">
          <SearchHistory
            history={history}
            onSelect={handleHistorySelect}
            onRemove={removeFromHistory}
            onClear={clearHistory}
          />
        </div>
      )}
    </div>
  )
} 