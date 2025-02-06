'use client'

import { Button } from '@/components/ui/button'
import { Clock, TrendingUp, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

export type SortOption = 'latest' | 'popular' | 'trending'

const SORT_OPTIONS = [
  { id: 'latest', name: '最新順', icon: Clock },
  { id: 'popular', name: '人気順', icon: Star },
  { id: 'trending', name: '注目順', icon: TrendingUp }
] as const

export interface SortFilterProps {
  selectedSort: SortOption
  onSortChange: (sort: SortOption) => void
  className?: string
}

export function SortFilter({
  selectedSort,
  onSortChange,
  className,
}: SortFilterProps) {
  return (
    <div className={cn('flex gap-2', className)}>
      {SORT_OPTIONS.map((option) => {
        const Icon = option.icon
        return (
          <Button
            key={option.id}
            variant={selectedSort === option.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => onSortChange(option.id as SortOption)}
          >
            <Icon className="mr-2 h-4 w-4" />
            {option.name}
          </Button>
        )
      })}
    </div>
  )
} 