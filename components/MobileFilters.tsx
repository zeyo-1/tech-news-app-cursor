'use client'

import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { CategoryFilter } from '@/components/CategoryFilter'
import { SortFilter } from '@/components/SortFilter'
import { TagFilter, type Tag } from '@/components/TagFilter'
import type { SortOption } from '@/components/SortFilter'

interface MobileFiltersProps {
  selectedCategory: string | null
  selectedSort: SortOption
  selectedTags: Tag[]
  onCategoryChange: (category: string | null) => void
  onSortChange: (sort: SortOption) => void
  onTagChange: (tag: Tag) => void
}

export function MobileFilters({
  selectedCategory,
  selectedSort,
  selectedTags,
  onCategoryChange,
  onSortChange,
  onTagChange,
}: MobileFiltersProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="flex sm:hidden"
          aria-label="フィルターを開く"
        >
          <Menu className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle>フィルター</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-6 py-6">
          <div className="space-y-4">
            <h3 className="font-medium">カテゴリー</h3>
            <CategoryFilter
              selectedCategory={selectedCategory}
              onCategoryChange={onCategoryChange}
              className="flex-col items-start gap-2"
            />
          </div>
          <div className="space-y-4">
            <h3 className="font-medium">タグ</h3>
            <TagFilter
              selectedTags={selectedTags}
              onTagChange={onTagChange}
              className="flex-col items-start gap-2"
            />
          </div>
          <div className="space-y-4">
            <h3 className="font-medium">並び替え</h3>
            <SortFilter
              selectedSort={selectedSort}
              onSortChange={onSortChange}
              className="flex-col items-start gap-2"
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
} 