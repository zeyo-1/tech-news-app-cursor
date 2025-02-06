'use client'

import { Clock, X } from 'lucide-react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import type { SearchHistoryItem } from '@/hooks/useSearchHistory'

interface SearchHistoryProps {
  history: SearchHistoryItem[]
  onSelect: (query: string) => void
  onRemove: (query: string) => void
  onClear: () => void
  className?: string
}

export function SearchHistory({
  history,
  onSelect,
  onRemove,
  onClear,
  className,
}: SearchHistoryProps) {
  if (history.length === 0) return null

  return (
    <div className="space-y-4 p-4 bg-card rounded-lg shadow-lg">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">検索履歴</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          履歴を削除
        </Button>
      </div>
      <div className="space-y-2">
        {history.map((item) => (
          <div
            key={item.timestamp}
            className="group flex items-center justify-between p-2 rounded-md hover:bg-accent hover:text-accent-foreground cursor-pointer"
            onClick={() => onSelect(item.query)}
          >
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{item.query}</span>
              <span className="text-xs text-muted-foreground">
                {format(item.timestamp, 'M月d日 HH:mm', { locale: ja })}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation()
                onRemove(item.query)
              }}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">削除</span>
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
} 