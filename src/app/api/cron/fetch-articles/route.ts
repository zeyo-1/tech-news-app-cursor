import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { fetchArticlesFromRSS } from '@/services/scraper';
import { NotificationService } from '@/lib/services/NotificationService';

// Vercel Cron Job用のセキュリティチェック
const CRON_SECRET = process.env.CRON_SECRET;

// エッジランタイム設定を削除
// export const runtime = 'edge';
// export const preferredRegion = 'hnd1';
export const maxDuration = 300; // 5分

interface ProcessStats {
  total: number;
  success: number;
  failed: number;
  errors: Array<{ message: string; context?: any }>;
}

export async function POST(request: Request) {
  const stats: ProcessStats = {
    total: 0,
    success: 0,
    failed: 0,
    errors: [],
  };

  try {
    // 認証チェック
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      console.error('Unauthorized access attempt to cron job');
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const startTime = Date.now();
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // 記事の取得と要約
    const articles = await fetchArticlesFromRSS();
    stats.total = articles.length;
    console.log(`Fetched ${articles.length} articles`);

    // 記事をデータベースに保存
    for (const article of articles) {
      try {
        const { error } = await supabase
          .from('articles')
          .upsert({
            title: article.title,
            source_url: article.url,
            content: article.content || '',
            summary: article.summary,
            source_name: article.source_name,
            image_url: article.image_url,
            published_at: article.published_at,
          }, {
            onConflict: 'source_url',
            ignoreDuplicates: false,
          });

        if (error) {
          stats.failed++;
          stats.errors.push({
            message: `Failed to save article: ${error.message}`,
            context: { url: article.url }
          });
        } else {
          stats.success++;
        }
      } catch (error) {
        stats.failed++;
        stats.errors.push({
          message: error instanceof Error ? error.message : 'Unknown error saving article',
          context: { url: article.url }
        });
      }
    }

    const endTime = Date.now();
    const processingTime = (endTime - startTime) / 1000;

    // 実行結果をコンソールに出力
    console.log('処理が完了しました', {
      total: stats.total,
      success: stats.success,
      failed: stats.failed,
      processingTime: `${processingTime.toFixed(2)}秒`,
      timestamp: new Date().toISOString()
    });

    // 一時的にコメントアウト
    // await notificationService.notifySuccess('記事の取得と要約が完了しました', {
    //   total: stats.total,
    //   success: stats.success,
    //   failed: stats.failed,
    //   processingTime: `${processingTime.toFixed(2)}秒`,
    //   timestamp: new Date().toISOString()
    // });

    return NextResponse.json({
      success: true,
      stats: {
        ...stats,
        processingTime: `${processingTime.toFixed(2)}秒`
      }
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error in cron job';
    console.error('Cron job failed:', error);

    // エラーをコンソールに出力
    console.error('エラーが発生しました', {
      message: errorMessage,
      stats,
      timestamp: new Date().toISOString()
    });

    // 一時的にコメントアウト
    // try {
    //   const notificationService = new NotificationService(process.env.SLACK_WEBHOOK_URL!);
    //   await notificationService.notifyError(
    //     error instanceof Error ? error : new Error(errorMessage),
    //     { context: 'Cron Job: Fetch Articles', stats }
    //   );
    // } catch (notifyError) {
    //   console.error('Failed to notify error:', notifyError);
    // }

    return NextResponse.json({
      success: false,
      error: errorMessage,
      stats
    }, { status: 500 });
  }
} 