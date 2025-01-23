import axios from 'axios';
import * as cheerio from 'cheerio';
import Parser from 'rss-parser';

export interface Article {
  title: string;
  url: string;
  content?: string;
  sourceName: string;
  imageUrl?: string;
  publishedAt?: string;
  importance?: {
    score: number;
  };
}

export interface ScrapedArticle {
  title: string;
  url: string;
  content?: string;
  summary?: string;
  sourceName: string;
  imageUrl?: string;
  publishedAt?: string;
  importance?: {
    score: number;
  };
  originalLanguage: 'ja' | 'en';
}

export class ScrapingService {
  private parser: Parser;
  private readonly headers = {
    'User-Agent': 'Mozilla/5.0 (compatible; TechNewsBot/1.0;)',
    'Accept': 'application/rss+xml, application/xml, application/atom+xml, text/xml;q=0.9, */*;q=0.8',
    'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8',
    'Origin': 'http://localhost:3001'
  };

  constructor() {
    this.parser = new Parser({
      customFields: {
        item: ['content:encoded', 'description', 'content'],
      },
      requestOptions: {
        rejectUnauthorized: false
      }
    });
  }

  private async retryWithDelay<T>(
    operation: () => Promise<T>,
    retries: number = 3,
    delay: number = 1000,
    operationName: string
  ): Promise<T> {
    let lastError: any;
    for (let i = 0; i < retries; i++) {
      try {
        console.log(`${operationName}: 試行 ${i + 1}/${retries}`);
        return await operation();
      } catch (error) {
        lastError = error;
        console.error(`${operationName}: 試行 ${i + 1} 失敗:`, error);
        if (i < retries - 1) {
          console.log(`${operationName}: ${delay}ms後に再試行`);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2;
        }
      }
    }
    throw lastError;
  }

  private async scrapeFromRSS(feedUrl: string, sourceName: string): Promise<ScrapedArticle[]> {
    try {
      console.log(`[${sourceName}] フィードを取得中: ${feedUrl}`);
      
      // プロキシサービスを使用してCORSを回避
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(feedUrl)}`;
      
      const axiosConfig = {
        headers: this.headers,
        timeout: 30000,
        responseType: 'text' as const,
        maxRedirects: 5
      };

      const response = await this.retryWithDelay(
        () => axios.get(proxyUrl, axiosConfig),
        3,
        1000,
        `${sourceName}のフィード取得`
      );
      
      if (!response.data) {
        throw new Error('フィードの内容が空です');
      }

      console.log(`[${sourceName}] フィードの内容を解析中...`);
      const feed = await this.parser.parseString(response.data);
      
      if (!feed.items || feed.items.length === 0) {
        console.warn(`[${sourceName}] フィードにアイテムが含まれていません`);
        return [];
      }

      console.log(`[${sourceName}] ${feed.items.length}件の記事を取得`);
      
      // 最新10件の記事を取得
      const articles = feed.items.slice(0, 10).map(item => {
        const article = {
          title: item.title || '無題',
          url: item.link || '',
          content: item['content:encoded'] || item.content || item.description || '',
          sourceName: sourceName,
          imageUrl: this.extractImageFromItem(item),
          publishedAt: item.pubDate,
          originalLanguage: this.detectLanguage(item.title || ''),
          importance: {
            score: 0.5 // デフォルトスコア
          }
        };
        console.log(`[${sourceName}] 記事を処理: ${article.title}`);
        return article;
      });

      return articles;

    } catch (error) {
      console.error(`[${sourceName}] フィード取得エラー:`, error);
      if (axios.isAxiosError(error)) {
        console.error(`[${sourceName}] 詳細:`, {
          status: error.response?.status,
          statusText: error.response?.statusText,
          headers: error.response?.headers,
          url: feedUrl,
          proxyUrl: `https://api.allorigins.win/raw?url=${encodeURIComponent(feedUrl)}`,
          message: error.message,
          code: error.code,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            headers: error.config?.headers,
            timeout: error.config?.timeout
          }
        });
      }
      return [];
    }
  }

  private extractImageFromItem(item: any): string | undefined {
    try {
      // content:encodedからの画像抽出を試みる
      if (item['content:encoded']) {
        const $ = cheerio.load(item['content:encoded']);
        const img = $('img').first();
        if (img.length > 0) {
          return img.attr('src');
        }
      }

      // 通常のcontentからの画像抽出を試みる
      if (item.content) {
        const $ = cheerio.load(item.content);
        const img = $('img').first();
        if (img.length > 0) {
          return img.attr('src');
        }
      }

      return undefined;
    } catch (error) {
      console.error('画像の抽出に失敗:', error);
      return undefined;
    }
  }

  private detectLanguage(text: string): 'ja' | 'en' {
    const hasJapanese = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/.test(text);
    return hasJapanese ? 'ja' : 'en';
  }

  async fetchAllArticles(): Promise<ScrapedArticle[]> {
    console.log('全フィードの取得を開始');
    
    const feeds = [
      { url: 'https://gigazine.net/news/rss_2.0/', name: 'GIGAZINE' },
      { url: 'https://www.publickey1.jp/atom.xml', name: 'Publickey' },
      { url: 'https://gihyo.jp/dev/feed/rss2', name: 'gihyo.jp' }
    ];

    const articles: ScrapedArticle[] = [];
    
    for (const feed of feeds) {
      console.log(`[${feed.name}] 処理開始`);
      const feedArticles = await this.scrapeFromRSS(feed.url, feed.name);
      console.log(`[${feed.name}] ${feedArticles.length}件の記事を取得完了`);
      articles.push(...feedArticles);
    }

    console.log(`全フィードの取得完了: 合計${articles.length}件の記事`);
    return articles;
  }

  async scrapeArticle(url: string): Promise<ScrapedArticle | null> {
    try {
      const response = await axios.get(url, {
        headers: this.headers,
        timeout: 10000
      });

      const $ = cheerio.load(response.data);
      const title = $('h1').first().text() || $('title').text();
      const content = this.extractArticleContent($);

      return {
        title,
        url,
        content,
        sourceName: new URL(url).hostname,
        originalLanguage: this.detectLanguage(title)
      };
    } catch (error) {
      console.error('記事のスクレイピングに失敗:', error);
      return null;
    }
  }

  private extractArticleContent($: cheerio.CheerioAPI): string {
    // 一般的な記事本文のセレクタ
    const selectors = [
      'article',
      '.article-content',
      '.entry-content',
      '.post-content',
      'main',
      '#main-content'
    ];

    for (const selector of selectors) {
      const content = $(selector).first();
      if (content.length > 0) {
        return content.text().trim();
      }
    }

    // セレクタで見つからない場合は、最も長いテキストブロックを探す
    let longestText = '';
    $('p').each((_, elem) => {
      const text = $(elem).text().trim();
      if (text.length > longestText.length) {
        longestText = text;
      }
    });

    return longestText;
  }
} 