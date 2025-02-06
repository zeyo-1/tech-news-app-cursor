'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface CategoryFilterProps {
  selectedCategory: string | null
  onCategoryChange: (category: string | null) => void
  className?: string
}

export const CATEGORIES = [
  { id: 'all', label: 'すべて' },
  { id: 'tech-news', label: '技術ニュース' },
  { id: 'programming', label: '開発・プログラミング' },
  { id: 'ai-ml', label: 'AI・機械学習' },
  { id: 'cloud', label: 'クラウド・インフラ' },
  { id: 'security', label: 'セキュリティ' },
  { id: 'design', label: 'デザイン・UX' },
  { id: 'business', label: 'ビジネス・スタートアップ' },
] as const

export type Category = typeof CATEGORIES[number]['id']

export function CategoryFilter({
  selectedCategory,
  onCategoryChange,
  className,
}: CategoryFilterProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {CATEGORIES.map((category) => (
        <Button
          key={category.id}
          variant={selectedCategory === category.id ? 'default' : 'outline'}
          onClick={() => onCategoryChange(category.id === 'all' ? null : category.id)}
          className="whitespace-nowrap"
        >
          {category.label}
        </Button>
      ))}
    </div>
  )
} 