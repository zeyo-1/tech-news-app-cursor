'use client'

import Image from 'next/image'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { ExternalLink, BookmarkIcon, Share2 } from 'lucide-react'
import { Article } from '@/types/article'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface ArticleCardProps {
  article: Article
}

export function ArticleCard({ article }: ArticleCardProps) {
  const publishedDate = article.published_at ? new Date(article.published_at) : new Date()

  return (
    <Card className="flex flex-col overflow-hidden transition-all hover:shadow-lg">
      <CardHeader className="p-0">
        {article.image_url ? (
          <div className="relative aspect-video w-full overflow-hidden">
            <Image
              src={article.image_url}
              alt={article.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        ) : (
          <div className="aspect-video w-full bg-muted" />
        )}
      </CardHeader>
      <CardContent className="flex-grow p-4">
        <div className="mb-2 flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {article.source_name}
          </Badge>
          <time className="text-xs text-muted-foreground">
            {format(publishedDate, 'yyyy年MM月dd日 HH:mm', { locale: ja })}
          </time>
        </div>
        <CardTitle className="mb-2 line-clamp-2 text-lg">
          {article.title}
        </CardTitle>
        <p className="line-clamp-3 text-sm text-muted-foreground">
          {article.summary}
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
            asChild
          >
            <a
              href={article.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2"
            >
              記事を読む
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
} 