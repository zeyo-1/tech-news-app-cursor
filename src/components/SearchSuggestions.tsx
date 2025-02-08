'use client';

import { Button } from '@/components/ui/button'
import { Clock, TrendingUp } from 'lucide-react'

interface SearchSuggestionsProps {
  query: string
  recentSearches: string[]
  trendingSearches: string[]
  onSelect: (value: string) => void
  visible: boolean
}

export function SearchSuggestions({
  recentSearches,
  trendingSearches,
  onSelect,
  visible
}: SearchSuggestionsProps) {
  if (!visible) return null

  return (
    <div className="absolute top-full left-0 w-full mt-1 rounded-lg border bg-background shadow-lg">
      <div className="p-2">
        {recentSearches.length > 0 && (
          <div className="mb-4">
            <div className="px-2 mb-2 text-xs font-medium text-muted-foreground">最近の検索</div>
            {recentSearches.map((search, index) => (
              <Button
                key={`recent-${index}-${search}`}
                variant="ghost"
                className="w-full justify-start gap-2 text-sm"
                onClick={() => onSelect(search)}
              >
                <Clock className="h-4 w-4" />
                {search}
              </Button>
            ))}
          </div>
        )}

        {trendingSearches.length > 0 && (
          <div>
            <div className="px-2 mb-2 text-xs font-medium text-muted-foreground">トレンド</div>
            {trendingSearches.map((search, index) => (
              <Button
                key={`trending-${index}-${search}`}
                variant="ghost"
                className="w-full justify-start gap-2 text-sm"
                onClick={() => onSelect(search)}
              >
                <TrendingUp className="h-4 w-4" />
                {search}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 