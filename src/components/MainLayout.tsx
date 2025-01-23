'use client'

import { Box, Container } from '@chakra-ui/react'
import { ReactNode } from 'react'

interface MainLayoutProps {
  children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <Box minH="100vh" bg="gray.50" _dark={{ bg: 'gray.900' }}>
      <Container maxW="container.xl" py={4}>
        {children}
      </Container>
    </Box>
  )
} 