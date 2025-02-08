'use client'

import { useState, useEffect } from 'react'
import { ArticleCard } from '@/components/ArticleCard'
import { Article } from '@/types/article'
import { CategoryFilter } from '@/components/CategoryFilter'
import { SortFilter } from '@/components/SortFilter'
import { Pagination } from '@/components/Pagination'
import { SearchBar } from '@/components/SearchBar'
import type { SortOption } from '@/components/SortFilter'
import { ArticleSkeletonGrid } from '@/components/ArticleSkeleton'
import { ErrorMessage } from '@/components/ErrorMessage'
import { MobileFilters } from '@/components/MobileFilters'
import { TagFilter, type Tag } from '@/components/TagFilter'

async function getArticles(): Promise<Article[]> {
  try {
    // 完全なURLを構築
    const baseUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3000' 
      : process.env.NEXT_PUBLIC_API_URL || ''
    const apiUrl = `${baseUrl}/api/test-rss`

    const res = await fetch(apiUrl, {
      method: 'GET',
      cache: 'no-store',
      next: { revalidate: 0 },
      headers: {
        'Accept': 'application/json',
      },
      credentials: 'omit'  // 認証を無視
    })

    if (!res.ok) {
      console.error(`HTTP error! status: ${res.status}`)
      throw new Error(`HTTP error! status: ${res.status}`)
    }

    const data = await res.json()
    
    if (!data.articles) {
      throw new Error('Invalid response format')
    }

    return data.articles
  } catch (error) {
    console.error('Failed to fetch articles:', error)
    throw new Error('Failed to fetch articles')
  }
}

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedSort, setSelectedSort] = useState<SortOption>('latest')
  const [selectedTags, setSelectedTags] = useState<Tag[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 9

  // 記事を取得する関数
  const fetchArticles = async () => {
    try {
      setLoading(true)
      const fetchedArticles = await getArticles()
      setArticles(fetchedArticles)
      setError(null)
    } catch (err) {
      setError('記事の取得に失敗しました')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // ページ変更時の処理
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // カテゴリー変更時にページをリセット
  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category)
    setCurrentPage(1)
  }

  // ソート変更時にページをリセット
  const handleSortChange = (sort: SortOption) => {
    setSelectedSort(sort)
    setCurrentPage(1)
  }

  // 検索処理
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1)
  }

  // タグ変更時の処理
  const handleTagChange = (tag: Tag) => {
    setSelectedTags(prev => {
      const isSelected = prev.includes(tag)
      if (isSelected) {
        return prev.filter(t => t !== tag)
      } else {
        return [...prev, tag]
      }
    })
    setCurrentPage(1)
  }

  // 記事のフィルタリングとソート
  const filteredAndSortedArticles = articles
    .filter(article => {
      const matchesCategory = !selectedCategory || article.category === selectedCategory
      const matchesSearch = !searchQuery || (
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.summary.toLowerCase().includes(searchQuery.toLowerCase())
      )
      const matchesTags = selectedTags.length === 0 || (
        article.tags?.some(tag => selectedTags.includes(tag))
      )
      return matchesCategory && matchesSearch && matchesTags
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

  // ページネーションの計算
  const totalItems = filteredAndSortedArticles.length
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE)
  const paginatedArticles = filteredAndSortedArticles.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  // コンポーネントのマウント時に記事を取得
  useEffect(() => {
    fetchArticles()
  }, [])

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">Buzz Tech Now</h1>
          <p className="text-muted-foreground">
            最新のテクノロジーニュースをAIが要約してお届けします
          </p>
        </div>
        
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
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">Buzz Tech Now</h1>
          <p className="text-muted-foreground">
            最新のテクノロジーニュースをAIが要約してお届けします
          </p>
        </div>

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
            selectedSort={selectedSort}
            onSortChange={handleSortChange}
          />
        </div>

        <TagFilter
          selectedTags={selectedTags}
          onTagChange={handleTagChange}
        />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
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