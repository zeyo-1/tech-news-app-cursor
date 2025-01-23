import { Box, VStack, Text, useColorModeValue, HStack, Switch } from '@chakra-ui/react'
import { Category, DisplayLanguage } from '@/lib/services/NewsService'

interface SidebarProps {
  selectedCategory?: Category
  onCategoryChange: (category?: Category) => void
  displayLanguage: DisplayLanguage
  onLanguageChange: (language: DisplayLanguage) => void
}

export function Sidebar({ 
  selectedCategory, 
  onCategoryChange, 
  displayLanguage, 
  onLanguageChange 
}: SidebarProps) {
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.100', 'gray.700')
  const textColor = useColorModeValue('gray.600', 'gray.300')
  const hoverBg = useColorModeValue('gray.50', 'gray.700')
  const selectedBg = useColorModeValue('gray.100', 'gray.600')

  const categories: Category[] = [
    'AI/ML',
    'Development',
    'Security',
    'Cloud',
    'Mobile',
    'Web',
    'Blockchain',
    'Other'
  ]

  return (
    <Box
      w="240px"
      h="calc(100vh - 45px)"
      position="sticky"
      top="45px"
      bg={bgColor}
      borderRight="1px"
      borderColor={borderColor}
      overflowY="auto"
    >
      <VStack align="stretch" spacing={0}>
        <HStack 
          px={4} 
          py={3} 
          borderBottom="1px" 
          borderColor={borderColor}
          justify="space-between"
        >
          <Text fontSize="sm" fontWeight="medium" color={textColor}>
            {displayLanguage === 'ja' ? '日本語' : 'English'}
          </Text>
          <Switch
            size="sm"
            isChecked={displayLanguage === 'en'}
            onChange={() => onLanguageChange(displayLanguage === 'ja' ? 'en' : 'ja')}
          />
        </HStack>

        <Text
          fontSize="sm"
          fontWeight="medium"
          color={textColor}
          px={4}
          py={3}
          borderBottom="1px"
          borderColor={borderColor}
        >
          カテゴリー
        </Text>
        <Box 
          as="button"
          w="100%"
          textAlign="left"
          px={4}
          py={2}
          fontSize="sm"
          bg={!selectedCategory ? selectedBg : undefined}
          _hover={{ bg: !selectedCategory ? selectedBg : hoverBg }}
          onClick={() => onCategoryChange(undefined)}
        >
          すべて
        </Box>
        {categories.map(category => (
          <Box 
            key={category}
            as="button"
            w="100%"
            textAlign="left"
            px={4}
            py={2}
            fontSize="sm"
            bg={selectedCategory === category ? selectedBg : undefined}
            _hover={{ bg: selectedCategory === category ? selectedBg : hoverBg }}
            onClick={() => onCategoryChange(category)}
          >
            {category}
          </Box>
        ))}
      </VStack>
    </Box>
  )
} 