'use client'

import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Article } from '@/lib/services/ScrapingService'

interface ArticleCardProps {
  article: Article
  onClick: (article: Article) => void
}

function removeHtmlTags(text: string): string {
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/&[^;]+;/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function ArticleCard({ article, onClick }: ArticleCardProps) {
  const truncatedTitle = removeHtmlTags(article.title).slice(0, 30) + (article.title.length > 30 ? '...' : '')
  const truncatedContent = article.content 
    ? removeHtmlTags(article.content).slice(0, 200) + (article.content.length > 200 ? '...' : '')
    : ''

  const importanceScore = article.importance?.score || 0
  const importanceColor = importanceScore >= 0.8 
    ? 'bg-red-100 text-red-800' 
    : importanceScore >= 0.5 
      ? 'bg-orange-100 text-orange-800' 
      : 'bg-gray-100 text-gray-800'

  return (
    <article
      onClick={() => onClick(article)}
      className="
        cursor-pointer
        bg-white dark:bg-gray-900
        rounded-2xl
        p-6 mb-6
        transition-all duration-300
        shadow-lg
        relative
        hover:transform hover:-translate-y-1 hover:shadow-2xl
        before:content-['']
        before:absolute before:inset-0
        before:rounded-2xl
        before:bg-gradient-to-b before:from-white/15 before:to-transparent
        before:opacity-0
        hover:before:opacity-100
        before:transition-opacity
        dark:text-white
      "
    >
      <div className="flex flex-col gap-4">
        <h3 className="text-xl font-bold leading-tall tracking-tight text-gray-900 dark:text-white">
          {truncatedTitle}
        </h3>
        
        <p className="text-md leading-7 tracking-wide text-gray-600 dark:text-gray-300">
          {truncatedContent}
        </p>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500 font-medium tracking-wide">
            {article.publishedAt
              ? format(new Date(article.publishedAt), 'yyyy/MM/dd', { locale: ja })
              : '日付なし'}
          </span>

          <span className={`
            px-4 py-1.5 
            rounded-full 
            text-sm font-medium 
            tracking-wide
            ${importanceColor}
          `}>
            重要度: {Math.round(importanceScore * 100)}%
          </span>
        </div>
      </div>
    </article>
  )
} 