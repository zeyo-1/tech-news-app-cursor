'use client'

import { ArticleCard } from '@/components/ArticleCard'
import type { Article } from '@/types/article'

// テスト用の記事データ
const testArticles: Article[] = [
  {
    title: 'TypeScript 5.4 Beta発表：より賢いタイプチェッキングと新しい構文機能',
    url: 'https://example.com/typescript-5-4',
    source_name: 'Tech Blog',
    published_at: '2024-02-15T19:00:00Z',
    summary: 'TypeScript 5.4のベータ版が発表されました。新バージョンでは、タイプチェッキングの改善や、新しい構文機能の追加など、開発者の生産性を向上させる機能が多数導入されています。',
    thumbnail: 'https://picsum.photos/800/400',
    language: 'ja',
    category: 'programming'
  },
  {
    title: 'OpenAIがGPT-4 Turboの改良版をリリース：より正確な応答と低レイテンシーを実現',
    url: 'https://example.com/gpt4-turbo-update',
    source_name: 'AI News',
    published_at: '2024-02-15T00:30:00Z',
    summary: 'OpenAIは、GPT-4 Turboの改良版をリリースしました。新バージョンでは、応答の正確性が向上し、レイテンシーが大幅に削減されています。また、長文処理の能力も改善されています。',
    thumbnail: 'https://picsum.photos/800/400',
    language: 'ja',
    category: 'ai-ml'
  }
]

export default function FavoritesPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold">お気に入り記事</h1>
        <p className="text-muted-foreground">
          保存した記事の一覧です
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {testArticles.map((article) => (
          <ArticleCard
            key={article.url}
            article={article}
          />
        ))}
      </div>
    </div>
  )
} 