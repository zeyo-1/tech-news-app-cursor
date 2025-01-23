'use client'

import { Category, DisplayLanguage } from '@/lib/services/NewsService'

interface SidebarProps {
  selectedCategory?: Category
  onCategoryChange: (category?: Category) => void
  displayLanguage: DisplayLanguage
  onLanguageChange: (language: DisplayLanguage) => void
}

const CATEGORIES = [
  { id: 'AI/ML', name: 'AI/機械学習' },
  { id: 'Development', name: '開発ツール' },
  { id: 'Security', name: 'セキュリティ' },
  { id: 'Cloud', name: 'クラウド' },
  { id: 'Mobile', name: 'モバイル' },
  { id: 'Web', name: 'Web' },
  { id: 'Blockchain', name: 'ブロックチェーン' },
  { id: 'Other', name: 'その他' }
] as const

export function Sidebar({
  selectedCategory,
  onCategoryChange,
  displayLanguage,
  onLanguageChange
}: SidebarProps) {
  return (
    <aside className="fixed left-0 top-16 w-60 h-[calc(100vh-4rem)] bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-200 overflow-y-auto p-4">
      <div className="space-y-6">
        {/* カテゴリーセクション */}
        <div>
          <h2 className="font-bold mb-3 text-gray-900 dark:text-white">カテゴリー</h2>
          <div className="space-y-2">
            {CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.id)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors
                  ${selectedCategory === category.id
                    ? 'bg-indigo-100 text-indigo-900 dark:bg-indigo-900 dark:text-indigo-100'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* 言語切り替えセクション */}
        <div>
          <h2 className="font-bold mb-3 text-gray-900 dark:text-white">言語</h2>
          <div className="space-y-2">
            <button
              onClick={() => onLanguageChange('ja')}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors
                ${displayLanguage === 'ja'
                  ? 'bg-indigo-100 text-indigo-900 dark:bg-indigo-900 dark:text-indigo-100'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
            >
              日本語
            </button>
            <button
              onClick={() => onLanguageChange('en')}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors
                ${displayLanguage === 'en'
                  ? 'bg-indigo-100 text-indigo-900 dark:bg-indigo-900 dark:text-indigo-100'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
            >
              English
            </button>
          </div>
        </div>

        {/* 重要度フィルターセクション */}
        <div>
          <h2 className="font-bold mb-3 text-gray-900 dark:text-white">重要度</h2>
          <div className="space-y-2">
            <button
              className="w-full text-left px-3 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
            >
              高（80%以上）
            </button>
            <button
              className="w-full text-left px-3 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
            >
              中（50-79%）
            </button>
            <button
              className="w-full text-left px-3 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
            >
              低（50%未満）
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
} 