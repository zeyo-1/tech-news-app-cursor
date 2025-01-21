'use client';

import { useState, useEffect } from 'react';

const CATEGORIES = [
  { id: 'all', name: 'すべて' },
  { id: 'tech', name: 'テクノロジー' },
  { id: 'business', name: 'ビジネス' },
  { id: 'science', name: '科学' },
  { id: 'health', name: '健康' },
  { id: 'entertainment', name: 'エンタメ' }
];

type CategoryFilterProps = {
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
};

export default function CategoryFilter({
  selectedCategory,
  onCategoryChange
}: CategoryFilterProps) {
  return (
    <div className="mb-8">
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id === 'all' ? null : category.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
              ${
                (selectedCategory === category.id) ||
                (selectedCategory === null && category.id === 'all')
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
} 