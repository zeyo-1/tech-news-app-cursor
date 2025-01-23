'use client'

import { Box, VStack, Text, Button, Divider, Slider, SliderTrack, SliderFilledTrack, SliderThumb } from '@chakra-ui/react'

export function Sidebar() {
  return (
    <Box bg="white" p={6} rounded="lg" shadow="sm" position="sticky" top="90px">
      <VStack spacing="6" align="stretch">
        <Box>
          <Text fontWeight="bold" mb={3}>ソース</Text>
          <VStack align="stretch" spacing="2">
            <Button variant="ghost" justifyContent="flex-start" size="sm">
              すべて
            </Button>
            <Button variant="ghost" justifyContent="flex-start" size="sm">
              GIGAZINE
            </Button>
            <Button variant="ghost" justifyContent="flex-start" size="sm">
              Publickey
            </Button>
            <Button variant="ghost" justifyContent="flex-start" size="sm">
              gihyo.jp
            </Button>
          </VStack>
        </Box>

        <Divider />

        <Box>
          <Text fontWeight="bold" mb={3}>言語</Text>
          <VStack align="stretch" spacing="2">
            <Button variant="ghost" justifyContent="flex-start" size="sm">
              すべて
            </Button>
            <Button variant="ghost" justifyContent="flex-start" size="sm">
              日本語
            </Button>
            <Button variant="ghost" justifyContent="flex-start" size="sm">
              英語
            </Button>
          </VStack>
        </Box>

        <Divider />

        <Box>
          <Text fontWeight="bold" mb={3}>重要度</Text>
          <Box px={2}>
            <Slider
              defaultValue={50}
              min={0}
              max={100}
              step={1}
            >
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              <SliderThumb />
            </Slider>
          </Box>
        </Box>
      </VStack>
    </Box>
  )
} 