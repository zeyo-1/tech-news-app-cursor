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
    <div className="absolute top-full left-0 mt-1">
      <div className="min-w-[280px] max-w-[min(100vw-24px,600px)] rounded-lg border bg-background shadow-lg">
        <div className="py-2">
          {recentSearches.length > 0 && (
            <div className="mb-2">
              <div className="px-3 mb-1.5 text-xs font-medium text-muted-foreground">最近の検索</div>
              {recentSearches.map((search, index) => (
                <Button
                  key={`recent-${index}-${search}`}
                  variant="ghost"
                  className="w-full h-10 px-3 justify-start gap-3 text-sm hover:bg-accent rounded-none"
                  onClick={() => onSelect(search)}
                >
                  <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="truncate max-w-[520px]">{search}</span>
                </Button>
              ))}
            </div>
          )}

          {trendingSearches.length > 0 && (
            <div>
              <div className="px-3 mb-1.5 text-xs font-medium text-muted-foreground">トレンド</div>
              {trendingSearches.map((search, index) => (
                <Button
                  key={`trending-${index}-${search}`}
                  variant="ghost"
                  className="w-full h-10 px-3 justify-start gap-3 text-sm hover:bg-accent rounded-none"
                  onClick={() => onSelect(search)}
                >
                  <TrendingUp className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="truncate max-w-[520px]">{search}</span>
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 