import { ArticleCard } from '@/components/ArticleCard'
import { Article } from '@/types/article'

async function getArticles(): Promise<Article[]> {
  const res = await fetch('http://localhost:3000/api/test-rss', {
    next: { revalidate: 300 } // 5分ごとに再検証
  })
  
  if (!res.ok) {
    throw new Error('Failed to fetch articles')
  }
  
  const data = await res.json()
  return data.articles
}

export default async function Home() {
  const articles = await getArticles()

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold">Tech News</h1>
        <p className="text-muted-foreground">
          最新のテクノロジーニュースをAIが要約してお届けします
        </p>
      </div>
      
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <ArticleCard key={article.url} article={article} />
        ))}
      </div>
    </div>
  )
} 