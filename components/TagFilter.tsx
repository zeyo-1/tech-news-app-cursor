'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export const TAGS = [
  // 言語・フレームワーク
  { id: 'javascript', label: 'JavaScript' },
  { id: 'typescript', label: 'TypeScript' },
  { id: 'python', label: 'Python' },
  { id: 'react', label: 'React' },
  { id: 'nextjs', label: 'Next.js' },
  { id: 'nodejs', label: 'Node.js' },
  
  // ツール・プラットフォーム
  { id: 'aws', label: 'AWS' },
  { id: 'docker', label: 'Docker' },
  { id: 'kubernetes', label: 'Kubernetes' },
  { id: 'github', label: 'GitHub' },
  
  // トレンド技術
  { id: 'chatgpt', label: 'ChatGPT' },
  { id: 'llm', label: 'LLM' },
  { id: 'web3', label: 'Web3' },
  { id: 'blockchain', label: 'ブロックチェーン' },
  
  // 開発手法・概念
  { id: 'agile', label: 'アジャイル' },
  { id: 'devops', label: 'DevOps' },
  { id: 'testing', label: 'テスト' },
  { id: 'performance', label: 'パフォーマンス' },
] as const

export type Tag = typeof TAGS[number]['id']

interface TagFilterProps {
  selectedTags: Tag[]
  onTagChange: (tag: Tag) => void
  className?: string
}

export function TagFilter({
  selectedTags,
  onTagChange,
  className,
}: TagFilterProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {TAGS.map((tag) => {
        const isSelected = selectedTags.includes(tag.id)
        return (
          <Badge
            key={tag.id}
            variant={isSelected ? 'default' : 'outline'}
            className={cn(
              'cursor-pointer transition-colors hover:bg-primary/90',
              isSelected ? 'hover:bg-primary/90' : 'hover:bg-primary/20'
            )}
            onClick={() => onTagChange(tag.id)}
          >
            {tag.label}
          </Badge>
        )
      })}
    </div>
  )
} 