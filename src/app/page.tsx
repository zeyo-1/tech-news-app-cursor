'use client'

import { useEffect, useState } from 'react'
import { Box, SimpleGrid, Spinner, Text, Center, Alert, AlertIcon } from '@chakra-ui/react'
import { MainLayout } from '@/components/MainLayout'
import { ArticleCard } from '@/components/ArticleCard'
import { Article } from '@/lib/services/ScrapingService'

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
            {articles.map(article => (
              <ArticleCard
                key={article.url}
                title={article.title}
                url={article.url}
                summary={article.content}
                sourceName={article.sourceName}
                publishedAt={article.publishedAt ? new Date(article.publishedAt) : undefined}
                importance={article.importance}
              />
            ))}
          </SimpleGrid>
        </Box>
      )}
    </MainLayout>
  )
}
