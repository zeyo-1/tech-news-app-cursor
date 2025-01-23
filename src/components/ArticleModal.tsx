'use client'

import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Article } from '@/lib/services/ScrapingService'
import { XIcon } from 'lucide-react'

interface ArticleModalProps {
  article: Article | null
  isOpen: boolean
  onClose: () => void
}

export function ArticleModal({ article, isOpen, onClose }: ArticleModalProps) {
  if (!article) return null

  const formattedDate = article.publishedAt
    ? format(new Date(article.publishedAt), 'yyyy年MM月dd日 HH:mm', { locale: ja })
    : '日付不明'

  const importanceScore = article.importance?.score || 0
  const importanceColor = importanceScore >= 0.8 
    ? 'bg-red-100 text-red-800' 
    : importanceScore >= 0.5 
      ? 'bg-orange-100 text-orange-800' 
      : 'bg-gray-100 text-gray-800'

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-xl transition-all">
                <div className="relative">
                  <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white pr-8">
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {article.title}
                    </a>
                  </Dialog.Title>
                  
                  <button
                    onClick={onClose}
                    className="absolute right-0 top-0 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  >
                    <XIcon className="h-5 w-5" />
                  </button>
                </div>

                <div className="mt-6 space-y-4">
                  {article.imageUrl && (
                    <div className="relative h-48 w-full">
                      <img
                        src={article.imageUrl}
                        alt={article.title}
                        className="rounded-lg object-cover w-full h-full"
                      />
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900 px-2.5 py-0.5 text-sm font-medium text-blue-800 dark:text-blue-200">
                      {article.sourceName}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {formattedDate}
                    </span>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-medium ${importanceColor}`}>
                      重要度: {Math.round(importanceScore * 100)}%
                    </span>
                  </div>

                  {article.content && (
                    <div className="prose dark:prose-invert max-w-none">
                      <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                        {article.content}
                      </div>
                    </div>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
} 