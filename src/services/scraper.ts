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

// DeepSeekを使用した要約生成
async function generateSummary(text: string, language: string = 'ja'): Promise<string> {
  try {
    const processedText = preprocessText(text);
    if (!processedText) {
      console.log('Empty text after preprocessing, skipping summary generation');
      return text.slice(0, 200) + '...';
    }

    const response = await axios.post('https://api.deepseek.com/v1/chat/completions', {
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
      timeout: 20000, // タイムアウトを20秒に短縮
      maxBodyLength: 4000,
      maxContentLength: 4000
    });

    if (!response.data?.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format from DeepSeek API');
    }

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error in generateSummary:', error);
    // エラー時は元のテキストの最初の200文字を返す
    return text.slice(0, 200) + '...';
  }
}

// 並列処理を制御するユーティリティ関数
async function asyncPool(concurrency: number, iterable: any[], iteratorFn: (item: any) => Promise<any>) {
  const ret = [];
  const executing = new Set();
  for (const item of iterable) {
    const p = Promise.resolve().then(() => iteratorFn(item));
    ret.push(p);
    executing.add(p);
    const clean = () => executing.delete(p);
    p.then(clean).catch(clean);
    if (executing.size >= concurrency) {
      await Promise.race(executing);
    }
  }
  return Promise.all(ret);
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

// RSSフィードから記事を取得
export async function fetchArticlesFromRSS(): Promise<Article[]> {
  processedUrls.clear();
  const articles: Article[] = [];
  const startTime = Date.now();
  
  // 古いキャッシュをクリーンアップ
  cleanupCache();
  
  console.log('Starting to fetch RSS feeds...');
  const cachedArticlesCount = articleCache.size;
  
  try {
    const feedResults = await Promise.allSettled(RSS_FEEDS.map(async (feed) => {
      try {
        console.log(`Fetching from ${feed.name}...`);
        const response = await axios.get(feed.url, {
          headers: {
            'Accept-Charset': 'utf-8',
            'Accept': 'application/xml, application/rss+xml, text/xml',
            'User-Agent': 'Mozilla/5.0 (compatible; Tech News App/1.0;)'
          },
          timeout: 10000
        });

        if (!response.data) {
          throw new Error(`Empty response from ${feed.name}`);
        }

        const feedContent = await parser.parseString(response.data);
        if (!feedContent || !feedContent.items) {
          throw new Error(`Invalid feed content from ${feed.name}`);
        }

        const latestItems = feedContent.items
          .slice(0, 2)
          .filter(item => item && item.link && !processedUrls.has(item.link));

        const processedItems = await asyncPool(1, latestItems, async (item) => {
          if (!item.link || processedUrls.has(item.link)) {
            return null;
          }

          // キャッシュをチェック
          const cachedEntry = articleCache.get(item.link);
          if (cachedEntry && isValidCache(cachedEntry)) {
            processedUrls.add(item.link);
            console.log(`Cache hit for article: ${item.title?.slice(0, 30)}...`);
            return cachedEntry.data;
          }

          console.log(`Processing new article: ${item.title?.slice(0, 30)}...`);
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
            await new Promise(resolve => setTimeout(resolve, 2000));
          } else {
            articleData.summary = articleData.title;
          }

          // キャッシュに保存
          articleCache.set(item.link, {
            data: articleData,
            timestamp: Date.now()
          });

          return articleData;
        });

        return processedItems.filter(Boolean);
      } catch (error) {
        console.error(`Error processing feed ${feed.name}:`, error);
        return [];
      }
    }));

    feedResults.forEach(result => {
      if (result.status === 'fulfilled' && Array.isArray(result.value)) {
        articles.push(...result.value);
      }
    });

    // 重要度でソート
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
    console.error('Error in fetchArticlesFromRSS:', error);
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