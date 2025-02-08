'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookmarkIcon, Share2 } from 'lucide-react'
import type { Article } from '@/types/article'

interface ArticleCardProps {
  article: Article
}

export function ArticleCard({ article }: ArticleCardProps) {
  const {
    title,
    url,
    source_name,
    published_at,
    summary,
    thumbnail
  } = article

  const formattedDate = new Date(published_at).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <Card className="flex flex-col overflow-hidden">
      <CardHeader className="p-0">
        <div className="relative aspect-video">
          <Image
            src={thumbnail}
            alt={title}
            fill
            className="object-cover"
          />
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-2 p-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{source_name}</span>
            <span>•</span>
            <time>{formattedDate}</time>
          </div>
          <Link
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="line-clamp-2 text-lg font-semibold hover:underline"
          >
            {title}
          </Link>
        </div>
        <p className="line-clamp-3 text-sm text-muted-foreground">
          {summary}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <div className="flex w-full justify-between gap-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
          >
            <BookmarkIcon className="mr-2 h-4 w-4" />
            保存
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
          >
            <Share2 className="mr-2 h-4 w-4" />
            共有
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
} 