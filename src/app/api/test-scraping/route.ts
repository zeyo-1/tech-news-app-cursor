import { NextResponse } from 'next/server';
import { ScrapingService } from '@/lib/services/ScrapingService';
import { NotificationService } from '@/lib/services/NotificationService';

export async function GET() {
  const scrapingService = new ScrapingService();
  const notificationService = new NotificationService(process.env.SLACK_WEBHOOK_URL!);

  try {
    // GIGAZINEからの記事取得をテスト
    const articles = await scrapingService.scrapeFromRSS(
      ScrapingService.NEWS_FEEDS.gigazine.url,
      ScrapingService.NEWS_FEEDS.gigazine.name
    );

    console.log('Fetched articles count:', articles.length); // デバッグ用

    // 最初の記事の詳細を取得
    if (articles.length > 0) {
      const firstArticle = articles[0];
      console.log('First article:', {
        title: firstArticle.title,
        url: firstArticle.url,
        hasContent: !!firstArticle.content,
        contentLength: firstArticle.content.length
      }); // デバッグ用

      const detailedArticle = await scrapingService.scrapeArticle(firstArticle.url);
      console.log('Detailed article:', {
        title: detailedArticle.title,
        url: detailedArticle.url,
        hasContent: !!detailedArticle.content,
        contentLength: detailedArticle.content.length
      }); // デバッグ用

      // 成功通知
      await notificationService.notifySuccess(
        'スクレイピングテスト成功',
        {
          title: detailedArticle.title,
          url: detailedArticle.url,
          sourceName: detailedArticle.sourceName,
          hasImage: !!detailedArticle.imageUrl,
          contentLength: detailedArticle.content.length,
          originalContentLength: firstArticle.content.length
        }
      );

      return NextResponse.json({
        success: true,
        article: detailedArticle,
        originalArticle: firstArticle
      });
    }

    return NextResponse.json({
      success: false,
      error: '記事が見つかりませんでした'
    });
  } catch (error) {
    console.error('Scraping error:', error); // デバッグ用

    // エラー通知
    await notificationService.notifyError(error as Error, {
      context: 'Scraping Test',
      feedUrl: ScrapingService.NEWS_FEEDS.gigazine.url
    });

    return NextResponse.json(
      { 
        success: false, 
        error: 'スクレイピング中にエラーが発生しました',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 