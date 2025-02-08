'use client';

import { Badge } from "@/components/ui/badge"

export interface Tag {
  id: string
  name: string
  count?: number
}

interface TagFilterProps {
  tags: Tag[]
  selectedTags: string[]
  onTagSelect: (tagId: string) => void
}

export function TagFilter({ tags, selectedTags, onTagSelect }: TagFilterProps) {
  if (!tags || tags.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <Badge
          key={tag.id}
          variant={selectedTags.includes(tag.id) ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => onTagSelect(tag.id)}
        >
          {tag.name}
          {tag.count !== undefined && ` (${tag.count})`}
        </Badge>
      ))}
    </div>
  )
} 