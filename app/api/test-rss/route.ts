import { NextRequest, NextResponse } from 'next/server'
import { Article } from '@/types/article'

const testArticles: Article[] = [
  {
    title: 'TypeScript 5.4 Beta発表：より賢いタイプチェッキングと新しい構文機能',
    url: 'https://example.com/typescript-5-4',
    source: 'Tech Blog',
    published_at: '2024-02-15T10:00:00Z',
    summary: 'TypeScript 5.4のベータ版が発表されました。新バージョンでは、タイプチェッキングの改善や、新しい構文機能の追加など、開発者の生産性を向上させる機能が多数導入されています。',
    thumbnail: 'https://picsum.photos/800/400'
  },
  {
    title: 'OpenAIがGPT-4 Turboの改良版をリリース：より正確な応答と低レイテンシーを実現',
    url: 'https://example.com/gpt4-turbo-update',
    source: 'AI News',
    published_at: '2024-02-14T15:30:00Z',
    summary: 'OpenAIは、GPT-4 Turboの改良版をリリースしました。新バージョンでは、応答の正確性が向上し、レイテンシーが大幅に削減されています。また、長文処理の能力も改善されています。',
    thumbnail: 'https://picsum.photos/800/400'
  },
  {
    title: 'Next.js 14.1がリリース：Turbopackの安定性向上とパフォーマンス最適化',
    url: 'https://example.com/nextjs-14-1',
    source: 'Dev News',
    published_at: '2024-02-13T09:15:00Z',
    summary: 'Vercelは、Next.js 14.1を正式にリリースしました。今回のアップデートでは、Turbopackの安定性が大幅に向上し、ビルド時間の短縮とパフォーマンスの最適化が実現されています。',
    thumbnail: 'https://picsum.photos/800/400'
  }
]

// 認証をバイパスするためのフラグ
export const dynamic = 'force-dynamic'
export const runtime = 'edge'

// CORSを許可するためのヘッダー
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

export async function GET(request: NextRequest) {
  try {
    return new NextResponse(JSON.stringify({ articles: testArticles }), {
      status: 200,
      headers: {
        'content-type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('API Error:', error)
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: {
        'content-type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  }
} 