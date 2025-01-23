'use client'

import { Box, Container, Flex, Heading, IconButton, useColorMode } from '@chakra-ui/react'
import { MoonIcon, SunIcon } from '@chakra-ui/icons'

export function Header() {
  const { colorMode, toggleColorMode } = useColorMode()

  return (
    <Box bg="white" borderBottom="1px" borderColor="gray.200" position="sticky" top={0} zIndex={10}>
      <Container maxW="container.xl">
        <Flex h="16" alignItems="center" justifyContent="space-between">
          <Heading size="md" color="brand.600">Tech News App</Heading>
          <Flex gap={4} alignItems="center">
            <IconButton
              aria-label="Toggle color mode"
              icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
              onClick={toggleColorMode}
              variant="ghost"
              size="md"
            />
          </Flex>
        </Flex>
      </Container>
    </Box>
  )
} 