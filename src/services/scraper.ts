import axios from 'axios';
import * as cheerio from 'cheerio';
import Parser from 'rss-parser';

const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'mediaContent'],
      ['media:thumbnail', 'mediaThumbnail'],
    ],
  },
  defaultRSS: 2.0,
  xml2js: {
    normalize: true,
    normalizeTags: true,
    strict: false,
  }
});

interface Article {
  title: string;
  url: string;
  source_name: string;
  published_at: string;
  content: string;
  image_url: string | null;
  summary: string;
}

// RSSフィードのリスト
const RSS_FEEDS = [
  {
    url: 'https://gigazine.net/news/rss_2.0/',
    name: 'GIGAZINE',
    allowsScraping: true
  },
  {
    url: 'https://rss.itmedia.co.jp/rss/2.0/news_technology.xml',
    name: 'ITmedia NEWS',
    allowsScraping: false
  },
  {
    url: 'https://www.publickey1.jp/atom.xml',
    name: 'Publickey',
    allowsScraping: false
  }
];

// テキストの前処理関数を改善
function preprocessText(text: string): string {
  return text
    .replace(/\s+/g, ' ') // 複数の空白を1つに
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // 制御文字を除去
    .trim()
    .slice(0, 1000); // テキストの長さを制限
}

// GIGAZINEの記事スクレイピング
async function scrapeGigazineArticle(url: string): Promise<{
  title: string;
  content: string;
  image_url: string | null;
  published_at: string;
}> {
  const response = await axios.get(url);
  const html = response.data;
  const $ = cheerio.load(html);

  const title = $('h1.title').text().trim();
  const content = $('.cntimage').text().trim();
  const imageUrl = $('.cntimage img').first().attr('src') || null;
  const publishedAt = $('time').attr('datetime');

  return {
    title,
    content,
    image_url: imageUrl,
    published_at: publishedAt || new Date().toISOString(),
  };
}

// カスタムエラークラスの定義
class ScraperError extends Error {
  constructor(message: string, public readonly code: string, public readonly details?: any) {
    super(message);
    this.name = 'ScraperError';
  }
}

// エラーコードの定義
const ErrorCodes = {
  FEED_FETCH_ERROR: 'FEED_FETCH_ERROR',
  FEED_PARSE_ERROR: 'FEED_PARSE_ERROR',
  SCRAPING_ERROR: 'SCRAPING_ERROR',
  SUMMARY_ERROR: 'SUMMARY_ERROR',
  API_ERROR: 'API_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR'
} as const;

// リトライ処理のユーティリティ関数
async function withRetry<T>(
  operation: () => Promise<T>,
  options: {
    maxRetries?: number;
    baseDelay?: number;
    maxDelay?: number;
    operationName: string;
  }
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    operationName
  } = options;

  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (!(error instanceof Error)) {
        throw new ScraperError(
          `Unknown error in ${operationName}`,
          ErrorCodes.API_ERROR,
          { originalError: error }
        );
      }

      lastError = error;
      
      if (axios.isAxiosError(error)) {
        // ネットワークエラーやタイムアウトの場合のみリトライ
        if (!error.response || error.code === 'ECONNABORTED') {
          const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);
          console.warn(`${operationName} failed (attempt ${attempt}/${maxRetries}). Retrying in ${delay}ms...`, {
            error: error.message,
            status: error.response?.status,
            code: error.code
          });
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }
      
      // その他のエラーは即座に失敗
      throw new ScraperError(
        `${operationName} failed: ${error.message}`,
        ErrorCodes.API_ERROR,
        { originalError: error }
      );
    }
  }
  
  if (lastError) {
    throw new ScraperError(
      `${operationName} failed after ${maxRetries} attempts`,
      ErrorCodes.NETWORK_ERROR,
      { lastError }
    );
  }

  throw new ScraperError(
    `${operationName} failed with unknown error`,
    ErrorCodes.NETWORK_ERROR
  );
}

// 記事の重複チェック用のユーティリティ関数
function isSimilarArticle(article1: Article, article2: Article): boolean {
  // タイトルの類似度チェック
  const title1Words = new Set(article1.title.toLowerCase().split(/\s+/));
  const title2Words = new Set(article2.title.toLowerCase().split(/\s+/));
  const commonWords = new Set([...title1Words].filter(x => title2Words.has(x)));
  const similarity = commonWords.size / Math.max(title1Words.size, title2Words.size);

  // 公開日時の差分チェック（1時間以内なら重複の可能性が高い）
  const timeDiff = Math.abs(
    new Date(article1.published_at).getTime() - new Date(article2.published_at).getTime()
  );
  const isCloseInTime = timeDiff < 60 * 60 * 1000; // 1時間以内

  return similarity > 0.7 || isCloseInTime;
}

// 要約生成のキュー管理
const summaryQueue: { text: string; resolve: (summary: string) => void; }[] = [];
let isProcessingSummaries = false;

// 要約生成のキュー処理
async function processSummaryQueue() {
  if (isProcessingSummaries || summaryQueue.length === 0) return;
  
  isProcessingSummaries = true;
  
  try {
    while (summaryQueue.length > 0) {
      const item = summaryQueue.shift();
      if (!item) break;
      
      try {
        const summary = await generateSummaryWithRetry(item.text);
        item.resolve(summary);
      } catch (error) {
        console.error('Error processing summary queue item:', error);
        item.resolve(item.text.slice(0, 200) + '...');
      }
      
      // 次の要約生成までの待機時間を5秒に設定
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  } finally {
    isProcessingSummaries = false;
  }
}

// 要約生成の実際の処理（リトライロジック含む）
async function generateSummaryWithRetry(text: string): Promise<string> {
  const processedText = preprocessText(text);
  if (!processedText) {
    return text.slice(0, 200) + '...';
  }

  return await withRetry(
    () => axios.post('https://api.deepseek.com/v1/chat/completions', {
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: "あなたは技術記事の要約を生成する専門家です。与えられた記事を3-4文で簡潔に要約してください。"
        },
        {
          role: "user",
          content: processedText
        }
      ],
      temperature: 0.3,
      max_tokens: 200,
      top_p: 0.1,
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000, // タイムアウトを10秒に短縮
      maxBodyLength: 4000,
      maxContentLength: 4000
    }).then(response => {
      if (!response.data?.choices?.[0]?.message?.content) {
        throw new ScraperError(
          'Invalid response format from DeepSeek API',
          ErrorCodes.API_ERROR
        );
      }
      return response.data.choices[0].message.content;
    }),
    {
      operationName: 'Generating summary',
      maxRetries: 2,
      baseDelay: 5000, // 初回リトライまでの待機時間を5秒に設定
      maxDelay: 15000 // 最大待機時間を15秒に制限
    }
  );
}

// 要約生成のメイン関数（キューを使用）
async function generateSummary(text: string): Promise<string> {
  return new Promise((resolve) => {
    summaryQueue.push({ text, resolve });
    processSummaryQueue().catch(error => {
      console.error('Error in summary queue processing:', error);
    });
  });
}

// エラーログの詳細化
function logError(error: unknown, context: string): void {
  const errorDetails = {
    message: error instanceof Error ? error.message : String(error),
    code: error instanceof ScraperError ? error.code : 'UNKNOWN_ERROR',
    context,
    timestamp: new Date().toISOString(),
    details: error instanceof ScraperError ? error.details : undefined
  };

  console.error('Error occurred:', errorDetails);
}

// 記事の重複を防ぐためのキャッシュ
const processedUrls = new Set();

// キャッシュの有効期限を設定（30分に短縮）
const CACHE_EXPIRY = 30 * 60 * 1000;

// キャッシュの型定義
interface CacheEntry {
  data: Article;
  timestamp: number;
}

// メモリキャッシュの実装
const articleCache = new Map<string, CacheEntry>();

// キャッシュの有効性チェック
function isValidCache(entry: CacheEntry): boolean {
  return Date.now() - entry.timestamp < CACHE_EXPIRY;
}

// キャッシュのクリーンアップ
function cleanupCache(): void {
  const now = Date.now();
  for (const [url, entry] of articleCache.entries()) {
    if (now - entry.timestamp > CACHE_EXPIRY) {
      articleCache.delete(url);
    }
  }
}

// RSSフィードから記事を取得（メイン関数）
export async function fetchArticlesFromRSS(): Promise<Article[]> {
  processedUrls.clear();
  const articles: Article[] = [];
  const startTime = Date.now();
  
  cleanupCache();
  
  console.log('Starting to fetch RSS feeds...');
  const cachedArticlesCount = articleCache.size;
  
  try {
    const feedResults = await Promise.allSettled(
      RSS_FEEDS.map(feed => fetchFeedSafely(feed))
    );

    for (const result of feedResults) {
      if (result.status === 'fulfilled') {
        // 各フィードの記事を処理する前に3秒待機
        await new Promise(resolve => setTimeout(resolve, 3000));
        articles.push(...result.value);
      } else {
        logError(result.reason, `Failed to process feed`);
      }
    }

    // 記事を重要度スコアでソート
    articles.sort((a, b) => {
      const scoreA = calculateImportanceScore(a.content, a.title);
      const scoreB = calculateImportanceScore(b.content, b.title);
      return scoreB - scoreA;
    });

    const endTime = Date.now();
    const processingTime = (endTime - startTime) / 1000;
    
    console.log(`Successfully fetched ${articles.length} articles (${cachedArticlesCount} from cache) in ${processingTime.toFixed(2)}s`);
    return articles;
  } catch (error) {
    logError(error, 'Error in fetchArticlesFromRSS');
    return [];
  }
}

// 重要度スコアの計算
function calculateImportanceScore(content: string, title: string): number {
  const factors = {
    // コンテンツの長さ（最大1000文字まで）
    contentLength: Math.min(content.length / 1000, 1) * 0.2,
    
    // 技術用語の出現頻度
    technicalTerms: countTechnicalTerms(content) * 0.3,
    
    // タイトルの質
    titleQuality: assessTitleQuality(title) * 0.2,
    
    // 新しさ（24時間以内の記事を優先）
    freshness: 0.3
  };

  return Object.values(factors).reduce((sum, score) => sum + score, 0);
}

// 技術用語のカウント（日本語対応）
function countTechnicalTerms(text: string): number {
  const technicalTerms = [
    // 一般的な技術用語
    'api', 'javascript', 'python', 'react', 'vue', 'angular', 'node', 'docker',
    'kubernetes', 'aws', 'azure', 'gcp', 'cloud', 'devops', 'ci/cd', 'git',
    'machine learning', 'ai', 'database', 'sql', 'nosql', 'security',
    
    // 日本語の技術用語
    'クラウド', '人工知能', '機械学習', 'ディープラーニング', 'ブロックチェーン',
    'サイバーセキュリティ', 'デジタルトランスフォーメーション', 'dx',
    'オープンソース', '自動化', 'ロボット', 'スマート', '量子', '仮想化',
    '暗号', 'セキュリティ', '開発', 'プログラミング', 'アプリ', 'システム',
    'ネットワーク', 'データ', 'サーバー', 'ストレージ', 'バックアップ'
  ];

  const matches = technicalTerms.reduce((count, term) => {
    const regex = new RegExp(term, 'gi');
    const matches = text.match(regex);
    return count + (matches ? matches.length : 0);
  }, 0);

  return Math.min(matches / 5, 1); // 5個の技術用語で最大スコア
}

// タイトルの質の評価（日本語対応）
function assessTitleQuality(title: string): number {
  const factors = {
    // 適切な長さ（10-50文字）
    length: title.length >= 10 && title.length <= 50 ? 0.4 : 0.2,
    
    // 数字を含む（年号や数値データ）
    hasNumber: /\d+/.test(title) ? 0.2 : 0,
    
    // 技術用語を含む
    hasTechnicalTerm: countTechnicalTerms(title) > 0 ? 0.2 : 0,
    
    // 記事の性質を示す特徴的な表現
    hasNewsIndicator: /新製品|発表|開発|研究|調査|報告|リリース|アップデート|発売|開始/.test(title) ? 0.2 : 0
  };

  return Object.values(factors).reduce((sum, score) => sum + score, 0);
}

// RSSフィードの取得を安全に行う（並列処理の制御を改善）
async function fetchFeedSafely(feed: typeof RSS_FEEDS[0]): Promise<Article[]> {
  try {
    const response = await withRetry(
      () => axios.get(feed.url, {
        headers: {
          'Accept-Charset': 'utf-8',
          'Accept': 'application/xml, application/rss+xml, text/xml',
          'User-Agent': 'Mozilla/5.0 (compatible; Tech News App/1.0;)'
        },
        timeout: 10000
      }),
      { 
        operationName: `Fetching ${feed.name} feed`,
        maxRetries: 2,
        baseDelay: 3000
      }
    );

    if (!response.data) {
      throw new ScraperError(
        `Empty response from ${feed.name}`,
        ErrorCodes.FEED_FETCH_ERROR
      );
    }

    const feedContent = await parser.parseString(response.data);
    if (!feedContent || !feedContent.items) {
      throw new ScraperError(
        `Invalid feed content from ${feed.name}`,
        ErrorCodes.FEED_PARSE_ERROR
      );
    }

    const articles: Article[] = [];
    // 同時に処理する記事数を制限
    const itemsToProcess = feedContent.items.slice(0, 3);
    
    for (const item of itemsToProcess) {
      if (!item.link || processedUrls.has(item.link)) continue;

      const cachedEntry = articleCache.get(item.link);
      if (cachedEntry && isValidCache(cachedEntry)) {
        processedUrls.add(item.link);
        if (!articles.some(article => isSimilarArticle(article, cachedEntry.data))) {
          articles.push(cachedEntry.data);
        }
        continue;
      }

      processedUrls.add(item.link);
      let articleData: Article = {
        title: item.title?.trim() || '',
        url: item.link,
        source_name: feed.name,
        published_at: item.pubDate || item.isoDate || new Date().toISOString(),
        content: (item.content || item.contentSnippet || '').trim(),
        image_url: item.mediaContent?.[0]?.$.url || 
                  item.mediaThumbnail?.[0]?.$.url ||
                  item.enclosure?.url || null,
        summary: ''
      };

      if (feed.allowsScraping && feed.name === 'GIGAZINE' && item.link) {
        try {
          const scrapedData = await scrapeGigazineArticle(item.link);
          articleData = {
            ...articleData,
            content: scrapedData.content || articleData.content,
            title: scrapedData.title || articleData.title,
            image_url: scrapedData.image_url || articleData.image_url,
            published_at: scrapedData.published_at || articleData.published_at
          };
        } catch (error) {
          console.error(`Error scraping GIGAZINE article: ${item.link}`, error);
        }
      }

      if (articleData.content) {
        articleData.summary = await generateSummary(articleData.content);
      } else {
        articleData.summary = articleData.title;
      }

      if (!articles.some(article => isSimilarArticle(article, articleData))) {
        articles.push(articleData);
        articleCache.set(item.link, {
          data: articleData,
          timestamp: Date.now()
        });
      }
    }

    return articles;
  } catch (error) {
    if (error instanceof ScraperError) throw error;
    throw new ScraperError(
      `Unexpected error fetching ${feed.name} feed: ${(error as Error).message}`,
      ErrorCodes.FEED_FETCH_ERROR,
      { originalError: error }
    );
  }
} 