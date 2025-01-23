import { Box, Container, Flex, HStack, Text, useColorMode } from '@chakra-ui/react'
import { MoonIcon, SunIcon } from '@chakra-ui/icons'

export function Header() {
  const { colorMode, toggleColorMode } = useColorMode()

  return (
    <Box 
      as="header" 
      py={2}
      position="sticky" 
      top={0} 
      zIndex={10}
      bg={colorMode === 'light' ? 'white' : 'gray.800'}
      borderBottom="1px"
      borderColor={colorMode === 'light' ? 'gray.100' : 'gray.700'}
    >
      <Container maxW="container.xl">
        <Flex justify="space-between" align="center">
          <HStack spacing={8}>
            <Text fontSize="lg" fontWeight="bold">
              BuzzTechNow
            </Text>
            <Text 
              fontSize="sm" 
              color={colorMode === 'light' ? 'gray.600' : 'gray.300'}
              cursor="pointer"
              _hover={{ color: colorMode === 'light' ? 'gray.800' : 'gray.100' }}
            >
              ホーム
            </Text>
          </HStack>
          
          <HStack spacing={6}>
            <Text 
              fontSize="sm" 
              color={colorMode === 'light' ? 'gray.600' : 'gray.300'}
              cursor="pointer"
              _hover={{ color: colorMode === 'light' ? 'gray.800' : 'gray.100' }}
            >
              プロフィール
            </Text>
            <Text 
              fontSize="sm" 
              color={colorMode === 'light' ? 'gray.600' : 'gray.300'}
              cursor="pointer"
              _hover={{ color: colorMode === 'light' ? 'gray.800' : 'gray.100' }}
            >
              ログアウト
            </Text>
            <Box
              as="button"
              onClick={toggleColorMode}
              color={colorMode === 'light' ? 'gray.600' : 'gray.300'}
              _hover={{ color: colorMode === 'light' ? 'gray.800' : 'gray.100' }}
            >
              {colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
            </Box>
          </HStack>
        </Flex>
      </Container>
    </Box>
  )
} 