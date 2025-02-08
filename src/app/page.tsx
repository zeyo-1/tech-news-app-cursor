'use client'

import { useState } from 'react'
import { ArticleCard } from '@/components/ArticleCard'
import { CategoryFilter } from '@/components/CategoryFilter'
import { SortFilter } from '@/components/SortFilter'
import { TagFilter } from '@/components/TagFilter'
import type { Article } from '@/types/article'

// テスト用の記事データ
const testArticles: Article[] = [
  {
    title: 'TypeScript 5.4 Beta発表：より賢いタイプチェッキングと新しい構文機能',
    url: 'https://example.com/typescript-5-4',
    source_name: 'Tech Blog',
    published_at: '2024-02-15T19:00:00Z',
    summary: 'TypeScript 5.4のベータ版が発表されました。新バージョンでは、タイプチェッキングの改善や、新しい構文機能の追加など、開発者の生産性を向上させる機能が多数導入されています。',
    thumbnail: 'https://picsum.photos/800/400',
    language: 'ja',
    category: 'programming'
  },
  {
    title: 'OpenAIがGPT-4 Turboの改良版をリリース：より正確な応答と低レイテンシーを実現',
    url: 'https://example.com/gpt4-turbo-update',
    source_name: 'AI News',
    published_at: '2024-02-15T00:30:00Z',
    summary: 'OpenAIは、GPT-4 Turboの改良版をリリースしました。新バージョンでは、応答の正確性が向上し、レイテンシーが大幅に削減されています。また、長文処理の能力も改善されています。',
    thumbnail: 'https://picsum.photos/800/400',
    language: 'ja',
    category: 'ai-ml'
  },
  {
    title: 'Next.js 14.1がリリース：Turbopackの安定性向上とパフォーマンス最適化',
    url: 'https://example.com/nextjs-14-1',
    source_name: 'Dev News',
    published_at: '2024-02-13T18:15:00Z',
    summary: 'Vercelは、Next.js 14.1を正式にリリースしました。今回のアップデートでは、Turbopackの安定性が大幅に向上し、ビルド時間の短縮とパフォーマンスの最適化が実現されています。',
    thumbnail: 'https://picsum.photos/800/400',
    language: 'ja',
    category: 'programming'
  }
]

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedSort, setSelectedSort] = useState<'latest' | 'popular' | 'trending'>('latest')
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category)
  }

  const handleSortChange = (sort: 'latest' | 'popular' | 'trending') => {
    setSelectedSort(sort)
  }

  const handleTagSelect = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  // カテゴリーでフィルタリング
  const filteredArticles = testArticles.filter(article => {
    if (!selectedCategory) return true
    return article.category === selectedCategory
  })

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <CategoryFilter
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
        />

        <div className="flex flex-wrap gap-4">
          <SortFilter
            value={selectedSort}
            onValueChange={handleSortChange}
          />
        </div>

        <TagFilter
          tags={[
            { id: 'javascript', name: 'JavaScript' },
            { id: 'typescript', name: 'TypeScript' },
            { id: 'python', name: 'Python' },
            { id: 'react', name: 'React' },
            { id: 'nextjs', name: 'Next.js' },
            { id: 'nodejs', name: 'Node.js' },
            { id: 'aws', name: 'AWS' },
            { id: 'docker', name: 'Docker' },
            { id: 'kubernetes', name: 'Kubernetes' },
            { id: 'github', name: 'GitHub' },
            { id: 'chatgpt', name: 'ChatGPT' },
            { id: 'llm', name: 'LLM' },
            { id: 'web3', name: 'Web3' },
            { id: 'blockchain', name: 'ブロックチェーン' }
          ]}
          selectedTags={selectedTags}
          onTagSelect={handleTagSelect}
        />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredArticles.map((article) => (
            <ArticleCard
              key={article.url}
              article={article}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
