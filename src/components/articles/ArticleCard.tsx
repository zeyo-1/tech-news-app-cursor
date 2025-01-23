'use client'

import { Box, Heading, Text, Image, Badge, HStack, VStack, Link } from '@chakra-ui/react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

interface ArticleCardProps {
  title: string
  url: string
  summary?: string
  sourceName: string
  imageUrl?: string
  publishedAt?: Date
  importance?: {
    score: number
  }
  language: 'ja' | 'en'
}

export function ArticleCard({
  title,
  url,
  summary,
  sourceName,
  imageUrl,
  publishedAt,
  importance,
  language
}: ArticleCardProps) {
  return (
    <Box
      as="a"
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      bg="white"
      rounded="lg"
      shadow="sm"
      overflow="hidden"
      transition="all 0.2s"
      _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
      display="block"
    >
      {imageUrl && (
        <Image
          src={imageUrl}
          alt={title}
          objectFit="cover"
          height="200px"
          width="100%"
        />
      )}
      <Box p={6}>
        <VStack align="stretch" gap={3}>
          <HStack gap={2}>
            <Badge colorScheme={sourceName === 'Hacker News' ? 'orange' : 'blue'}>
              {sourceName}
            </Badge>
            <Badge colorScheme={language === 'ja' ? 'green' : 'purple'}>
              {language === 'ja' ? '日本語' : 'English'}
            </Badge>
            {importance && importance.score >= 0.8 && (
              <Badge colorScheme="red">重要</Badge>
            )}
          </HStack>

          <Heading size="md" isTruncated noOfLines={2}>
            {title}
          </Heading>

          {summary && (
            <Text color="gray.600" isTruncated noOfLines={3}>
              {summary}
            </Text>
          )}

          <HStack gap={2} justify="space-between">
            {publishedAt && (
              <Text fontSize="sm" color="gray.500">
                {format(publishedAt, 'yyyy年MM月dd日 HH:mm', { locale: ja })}
              </Text>
            )}
            {importance && (
              <Text fontSize="sm" color="gray.500">
                重要度: {Math.round(importance.score * 100)}%
              </Text>
            )}
          </HStack>
        </VStack>
      </Box>
    </Box>
  )
} 