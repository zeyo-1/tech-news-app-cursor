import { NextResponse } from 'next/server';
import { NewsService } from '@/lib/services/NewsService';
import { ScrapingService } from '@/lib/services/ScrapingService';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const articleUrl = url.searchParams.get('url');
    
    const scrapingService = new ScrapingService();
    
    if (articleUrl) {
      // 特定の記事の詳細を取得
      const article = await scrapingService.scrapeArticle(articleUrl);
      return NextResponse.json({ success: true, article });
    } else {
      // 全記事を取得
      const articles = await scrapingService.fetchAllArticles();
      return NextResponse.json({ 
        success: true, 
        articles,
        stats: {
          total: articles.length,
          bySource: {
            GIGAZINE: articles.filter(a => a.sourceName === 'GIGAZINE').length,
            Publickey: articles.filter(a => a.sourceName === 'Publickey').length,
            'gihyo.jp': articles.filter(a => a.sourceName === 'gihyo.jp').length
          }
        }
      });
    }
  } catch (error) {
    console.error('APIエラー:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'ニュースの取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}