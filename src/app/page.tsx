'use client'

import { useEffect, useState, useMemo } from 'react'
import { Box, SimpleGrid, Spinner, Text, Center, Alert, AlertIcon } from '@chakra-ui/react'
import { MainLayout } from '@/components/MainLayout'
import { ArticleCard } from '@/components/ArticleCard'
import { ArticleModal } from '@/components/ArticleModal'
import { Article } from '@/lib/services/ScrapingService'
import { SortControl, SortOption } from '@/components/SortControl'

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortOption, setSortOption] = useState<SortOption>('date-desc')
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await fetch('/api/test-news')
        const data = await response.json()
        if (data.success) {
          setArticles(data.articles)
        } else {
          setError(data.error || '記事の取得に失敗しました')
        }
      } catch (error) {
        setError('記事の取得中にエラーが発生しました')
        console.error('記事の取得中にエラーが発生:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchArticles()
  }, [])

  const sortedArticles = useMemo(() => {
    return [...articles].sort((a, b) => {
      switch (sortOption) {
        case 'date-desc':
          return new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime()
        case 'date-asc':
          return new Date(a.publishedAt || 0).getTime() - new Date(b.publishedAt || 0).getTime()
        case 'importance':
          return (b.importance?.score || 0) - (a.importance?.score || 0)
        case 'source':
          return a.sourceName.localeCompare(b.sourceName)
        default:
          return 0
      }
    })
  }, [articles, sortOption])

  const handleArticleClick = (article: Article) => {
    setSelectedArticle(article)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedArticle(null)
  }

  return (
    <MainLayout>
      {isLoading ? (
        <Center h="50vh">
          <Spinner size="xl" color="blue.500" thickness="4px" />
        </Center>
      ) : error ? (
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          {error}
        </Alert>
      ) : articles.length === 0 ? (
        <Center h="50vh">
          <Text fontSize="lg" color="gray.500">
            記事が見つかりませんでした
          </Text>
        </Center>
      ) : (
        <Box py={4}>
          <SortControl value={sortOption} onChange={setSortOption} />
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
            {sortedArticles.map(article => (
              <ArticleCard
                key={article.url}
                article={article}
                onClick={handleArticleClick}
              />
            ))}
          </SimpleGrid>
          {selectedArticle && (
            <ArticleModal
              article={selectedArticle}
              isOpen={isModalOpen}
              onClose={handleModalClose}
            />
          )}
        </Box>
      )}
    </MainLayout>
  )
}
