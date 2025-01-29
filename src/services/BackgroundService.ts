import { ArticleService } from './ArticleService';
import { createClient } from '@supabase/supabase-js';
import { fetchArticlesFromRSS } from './scraper';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export class BackgroundService {
  private static isRunning = false;
  private static intervals: NodeJS.Timeout[] = [];

  // バックグラウンドジョブの開始
  static startBackgroundJobs() {
    if (this.isRunning) return;
    
    this.isRunning = true;

    // 定期実行のスケジュール設定
    const scheduleHours = [6, 12, 18, 0]; // 24時は0時として設定
    
    // 各時間に対してスケジュールを設定
    scheduleHours.forEach(hour => {
      const now = new Date();
      const next = new Date();
      next.setHours(hour, 0, 0, 0);
      
      // 次の実行時刻が過去の場合は翌日に設定
      if (next <= now) {
        next.setDate(next.getDate() + 1);
      }
      
      // 初回実行までの待機時間を計算
      const delay = next.getTime() - now.getTime();
      
      // スケジュール設定
      const interval = setInterval(() => {
        this.updateArticles();
      }, 24 * 60 * 60 * 1000); // 24時間ごとに実行
      
      // 初回実行のタイマー設定
      const timeout = setTimeout(() => {
        this.updateArticles();
        this.intervals.push(interval);
      }, delay);
      
      this.intervals.push(timeout);
    });

    // 初回実行
    this.updateArticles();
  }

  // バックグラウンドジョブの停止
  static stopBackgroundJobs() {
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals = [];
    this.isRunning = false;
  }

  // 記事の更新処理
  private static async updateArticles() {
    try {
      console.log('Starting article update at:', new Date().toISOString());

      // RSSフィードから記事を取得
      const articles = await fetchArticlesFromRSS();

      // 各記事を保存
      await Promise.all(
        articles.map(article =>
          ArticleService.saveArticle(article.url, article).catch(error => {
            console.error(`Error saving article ${article.url}:`, error);
            return null;
          })
        )
      );

      console.log(`Updated ${articles.length} articles`);

    } catch (error) {
      console.error('Error in background update:', error);
    }
  }

  // エラー回復処理
  private static async retryFailedArticles() {
    try {
      const { data: failedArticles, error } = await supabase
        .from('articles')
        .select('*')
        .gt('error_count', 0)
        .lt('error_count', 5) // 5回以上エラーの場合は除外
        .is('deleted_at', null)
        .limit(5);

      if (error) throw error;
      if (!failedArticles || failedArticles.length === 0) return;

      for (const article of failedArticles) {
        try {
          await ArticleService.saveArticle(article.url, {
            category: article.category,
            language: article.language
          });
          console.log(`Successfully retried article ${article.url}`);
        } catch (error) {
          console.error(`Retry failed for article ${article.url}:`, error);
        }
      }
    } catch (error) {
      console.error('Error in retry process:', error);
    }
  }
} 