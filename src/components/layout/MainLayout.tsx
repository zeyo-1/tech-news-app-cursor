'use client'

import { Box, Container, Flex } from '@chakra-ui/react'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <Box minH="100vh" bg="gray.50">
      <Header />
      <Container maxW="container.xl" py={8}>
        <Flex gap={8}>
          <Box w="280px" display={{ base: 'none', lg: 'block' }}>
            <Sidebar />
          </Box>
          <Box flex={1}>
            {children}
          </Box>
        </Flex>
      </Container>
    </Box>
  )
} 