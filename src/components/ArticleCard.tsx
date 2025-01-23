import { Box, Text, HStack, VStack, useColorModeValue } from '@chakra-ui/react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

interface ArticleCardProps {
  title: string
  url: string
  summary?: string
  sourceName: string
  publishedAt?: Date
  importance?: {
    score: number
  }
}

export function ArticleCard({ title, url, sourceName, publishedAt, importance }: ArticleCardProps) {
  const borderColor = useColorModeValue('gray.100', 'gray.700')
  const textColor = useColorModeValue('gray.600', 'gray.300')
  const hoverBg = useColorModeValue('gray.50', 'gray.700')

  return (
    <Box
      as="a"
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      borderBottom="1px"
      borderColor={borderColor}
      py={4}
      transition="all 0.2s"
      _hover={{
        bg: hoverBg,
        textDecoration: 'none'
      }}
    >
      <VStack align="stretch" spacing={2}>
        <Text 
          fontSize="md" 
          fontWeight="medium"
          color={useColorModeValue('gray.800', 'white')}
          noOfLines={2}
          lineHeight="tall"
        >
          {title}
        </Text>

        <HStack justify="space-between" fontSize="sm" color={textColor}>
          <HStack spacing={4}>
            <Text>{sourceName}</Text>
            {publishedAt && (
              <Text>
                {format(publishedAt, 'yyyy年MM月dd日 HH:mm', { locale: ja })}
              </Text>
            )}
          </HStack>
          {importance && (
            <Text>
              重要度: {Math.round(importance.score * 100)}%
            </Text>
          )}
        </HStack>
      </VStack>
    </Box>
  )
} 