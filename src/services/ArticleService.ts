import { createClient } from '@supabase/supabase-js';
import { Article } from '../types/article';
import { scrapeArticle } from './scraper';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export class ArticleService {
  // 記事の取得（キャッシュを優先）
  static async getArticles(options: {
    category?: string;
    language?: string;
    limit?: number;
    offset?: number;
  }) {
    const { category, language = 'ja', limit = 10, offset = 0 } = options;

    let query = supabase
      .from('articles')
      .select('*')
      .is('deleted_at', null)
      .order('published_at', { ascending: false })
      .limit(limit)
      .range(offset, offset + limit - 1);

    if (category) {
      query = query.eq('category', category);
    }

    if (language) {
      query = query.eq('language', language);
    }

    const { data: articles, error } = await query;

    if (error) {
      console.error('Error fetching articles:', error);
      throw error;
    }

    return articles;
  }

  // 記事の保存（スクレイピング結果を含む）
  static async saveArticle(url: string, sourceData: Partial<Article>) {
    // 既存の記事をチェック
    const { data: existingArticle } = await supabase
      .from('articles')
      .select('*')
      .eq('url', url)
      .single();

    // スクレイピング頻度をチェック
    if (existingArticle) {
      const lastScraped = new Date(existingArticle.last_scraped_at);
      const frequency = existingArticle.scraping_frequency || '1 hour';
      const nextScrape = new Date(lastScraped.getTime() + parseDuration(frequency));

      if (new Date() < nextScrape) {
        return existingArticle;
      }
    }

    try {
      // 記事をスクレイピング
      const scrapedData = await scrapeArticle(url);
      
      const articleData = {
        ...sourceData,
        ...scrapedData,
        url,
        last_scraped_at: new Date().toISOString(),
        error_count: 0,
        last_error: null
      };

      // upsert操作
      const { data: savedArticle, error } = await supabase
        .from('articles')
        .upsert(articleData, {
          onConflict: 'url',
          returning: 'minimal'
        });

      if (error) throw error;
      return savedArticle;

    } catch (error) {
      // エラー処理
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      await supabase
        .from('articles')
        .upsert({
          url,
          error_count: (existingArticle?.error_count || 0) + 1,
          last_error: errorMessage,
          last_scraped_at: new Date().toISOString()
        }, {
          onConflict: 'url'
        });

      throw error;
    }
  }
}

// ヘルパー関数：時間間隔の文字列をミリ秒に変換
function parseDuration(duration: string): number {
  const units: { [key: string]: number } = {
    minute: 60 * 1000,
    hour: 60 * 60 * 1000,
    day: 24 * 60 * 60 * 1000
  };

  const [amount, unit] = duration.split(' ');
  return parseInt(amount) * (units[unit] || units.hour);
} 