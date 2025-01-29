'use client'

import { Box, Select, HStack, Text } from '@chakra-ui/react'

export type SortOption = 'date-desc' | 'date-asc' | 'importance' | 'source'

interface SortControlProps {
  value: SortOption
  onChange: (value: SortOption) => void
}

export function SortControl({ value, onChange }: SortControlProps) {
  return (
    <HStack spacing={4} mb={4}>
      <Text fontWeight="medium">並び替え:</Text>
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value as SortOption)}
        w="200px"
      >
        <option value="date-desc">日付（新しい順）</option>
        <option value="date-asc">日付（古い順）</option>
        <option value="importance">重要度順</option>
        <option value="source">ソース別</option>
      </Select>
    </HStack>
  )
} 