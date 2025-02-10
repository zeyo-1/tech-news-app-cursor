'use client'

import { useState, useEffect } from 'react'
import { ArticleCard } from '@/components/ArticleCard'
import { Article } from '@/types/article'
import { CategoryFilter } from '@/components/CategoryFilter'
import { SortFilter } from '@/components/SortFilter'
import type { SortOption } from '@/components/SortFilter'
import { ArticleSkeletonGrid } from '@/components/ArticleSkeleton'
import { ErrorMessage } from '@/components/ErrorMessage'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedSort, setSelectedSort] = useState<SortOption>('latest')
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  // 記事を取得する関数
  const fetchArticles = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('published_at', { ascending: false })

      if (error) throw error
      setArticles(data || [])
      setError(null)
    } catch (err) {
      setError('記事の取得に失敗しました')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // カテゴリー変更時の処理
  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category)
  }

  // ソート変更時の処理
  const handleSortChange = (sort: SortOption) => {
    setSelectedSort(sort)
  }

  // 記事のフィルタリングとソート
  const filteredAndSortedArticles = articles
    .filter(article => {
      const matchesCategory = !selectedCategory || article.category === selectedCategory
      return matchesCategory
    })
    .sort((a, b) => {
      switch (selectedSort) {
        case 'latest':
          return new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
        case 'popular':
          return (b.view_count || 0) - (a.view_count || 0)
        case 'trending':
          return (b.engagement_score || 0) - (a.engagement_score || 0)
        default:
          return 0
      }
    })

  // コンポーネントのマウント時に記事を取得
  useEffect(() => {
    fetchArticles()
  }, [])

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col gap-4">
          <div className="h-10 w-full animate-pulse rounded-lg bg-muted" />
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-9 w-24 animate-pulse rounded-md bg-muted" />
              ))}
            </div>
            <div className="flex gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-9 w-28 animate-pulse rounded-md bg-muted" />
              ))}
            </div>
          </div>
        </div>

        <ArticleSkeletonGrid />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-8">
        <ErrorMessage
          message={error}
          onRetry={fetchArticles}
        />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <div className="flex flex-wrap gap-4">
          <CategoryFilter
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
          />
          <SortFilter
            value={selectedSort}
            onValueChange={handleSortChange}
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredAndSortedArticles.map((article) => (
            <ArticleCard
              key={article.source_url}
              article={article}
            />
          ))}
        </div>
      </div>
    </div>
  )
} 