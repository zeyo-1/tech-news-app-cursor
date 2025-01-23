import axios from 'axios';
import Parser from 'rss-parser';
import { subDays } from 'date-fns';
import { DeepSeekClient } from './DeepSeekClient';
import { ScrapingService } from './ScrapingService';
import { NotificationService } from './NotificationService';

export interface NewsItem {
  id: string;
  title: string;
  url: string;
  content?: string;
  summary?: string;
  publishedAt: Date;
  source: {
    type: 'hackernews' | 'rss';
    name: string;
    url: string;
  };
  visibility: 'public' | 'private';
  language: 'ja' | 'en';
  importance?: {
    score: number;
    factors: {
      sourceWeight: number;
      keywordWeight: number;
      freshnessWeight: number;
      contentLengthWeight: number;
    };
  };
}

interface ImportanceScore {
  score: number;
  factors: {
    sourceWeight: number;
    keywordWeight: number;
    freshnessWeight: number;
    contentLengthWeight: number;
  };
}

export type Category = 
  | 'AI/ML' 
  | 'Development' 
  | 'Security' 
  | 'Cloud' 
  | 'Mobile' 
  | 'Web' 
  | 'Blockchain'
  | 'Other'

export type DisplayLanguage = 'ja' | 'en'

export interface Article {
  title: string
  url: string
  content?: string
  summary?: string
  translatedTitle?: string
  translatedSummary?: string
  sourceName: string
  imageUrl?: string
  publishedAt?: Date
  importance?: {
    score: number
  }
  category?: Category
  originalLanguage: 'ja' | 'en'
}

export class NewsService {
  private parser: Parser;
  private scrapingService: ScrapingService;
  private deepseekClient: DeepSeekClient;
  private notificationService: NotificationService;
  private readonly HN_API_BASE = 'https://hacker-news.firebaseio.com/v0';
  private readonly RSS_FEEDS = {
    gigazine: {
      url: 'https://gigazine.net/news/rss_2.0/',
      name: 'GIGAZINE',
      language: 'ja' as const,
      maxItems: 30
    },
    publickey: {
      url: 'https://www.publickey1.jp/atom.xml',
      name: 'Publickey',
      language: 'ja' as const,
      maxItems: 30
    },
    gihyo: {
      url: 'https://gihyo.jp/dev/feed/rss2',
      name: 'gihyo.jp',
      language: 'ja' as const,
      maxItems: 30
    }
  };

  private readonly TECH_KEYWORDS = [
    // プログラミング言語
    'typescript', 'javascript', 'python', 'java', 'go', 'rust', 'c++', 'php', 'ruby',
    // フレームワーク
    'react', 'next.js', 'vue', 'angular', 'svelte', 'laravel', 'django', 'spring',
    // クラウド・インフラ
    'aws', 'azure', 'gcp', 'kubernetes', 'docker', 'terraform', 'cloudflare',
    // AI・機械学習
    'ai', '人工知能', 'machine learning', 'deep learning', 'llm', 'gpt', 'stable diffusion',
    'openai', 'deepseek', 'gemini', 'claude', 'anthropic',
    // トレンド技術
    'web3', 'blockchain', 'crypto', 'nft', 'metaverse', '量子コンピュータ',
    // セキュリティ
    'security', 'vulnerability', 'exploit', 'cyber', 'hack',
    // 企業・プロダクト
    'google', 'microsoft', 'amazon', 'apple', 'meta', 'oracle', 'softbank',
    // 一般的な技術用語
    'api', 'sdk', 'database', 'cloud', 'server', 'frontend', 'backend', 'fullstack',
    'open source', 'オープンソース', '開発', 'プログラミング', 'コーディング',
    'デプロイ', 'インフラ', 'サーバー', 'クラウド'
  ];

  private readonly SOURCE_WEIGHTS = {
    'Hacker News': 1.0,
    'GIGAZINE': 0.8,
    'Publickey': 0.9,
    'gihyo.jp': 0.7
  };

  private articles: Article[] = [];
  private displayLanguage: DisplayLanguage = 'ja';

  constructor(deepseekApiKey: string) {
    this.parser = new Parser({
      customFields: {
        item: ['content:encoded', 'description', 'content'],
        feed: ['subtitle']
      },
      requestOptions: {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; TechNewsBot/1.0;)',
          'Accept': 'application/rss+xml, application/xml, application/atom+xml, text/xml;q=0.9, */*;q=0.8'
        }
      }
    });

    this.scrapingService = new ScrapingService();
    this.deepseekClient = new DeepSeekClient(deepseekApiKey);
    this.notificationService = new NotificationService(process.env.SLACK_WEBHOOK_URL!);
  }

  private calculateImportanceScore(item: NewsItem): ImportanceScore {
    // ソースの重要度を計算
    const sourceWeight = this.SOURCE_WEIGHTS[item.source.name as keyof typeof this.SOURCE_WEIGHTS] || 0.5;

    // キーワードの重要度を計算
    const text = `${item.title} ${item.content || ''}`.toLowerCase();
    const matchedKeywords = this.TECH_KEYWORDS.filter(keyword => 
      text.includes(keyword.toLowerCase())
    );
    // キーワードの重みを調整（0.15 -> 0.25）
    const keywordWeight = Math.min(matchedKeywords.length * 0.25, 1.0);

    // 新鮮度の重要度を計算
    const now = new Date();
    const hoursSincePublished = (now.getTime() - item.publishedAt.getTime()) / (1000 * 60 * 60);
    let freshnessWeight = 1.0;
    if (hoursSincePublished > 72) freshnessWeight = 0.3;      // 0.2 -> 0.3
    else if (hoursSincePublished > 48) freshnessWeight = 0.5; // 0.4 -> 0.5
    else if (hoursSincePublished > 24) freshnessWeight = 0.8; // 0.7 -> 0.8

    // コンテンツの長さの重要度を計算
    let contentLengthWeight = 0.6; // 0.5 -> 0.6
    if (item.content) {
      const length = item.content.length;
      if (length > 5000) contentLengthWeight = 1.0;
      else if (length > 2000) contentLengthWeight = 0.9;      // 0.8 -> 0.9
      else if (length > 1000) contentLengthWeight = 0.7;      // 0.6 -> 0.7
      else contentLengthWeight = 0.5;                         // 0.4 -> 0.5
    }

    // 総合スコアの計算（重みの調整）
    const score = (
      sourceWeight * 0.25 +          // ソースの信頼性: 30% -> 25%
      keywordWeight * 0.35 +         // キーワードの関連性: 30% -> 35%
      freshnessWeight * 0.25 +       // 新鮮さ: 25% -> 25%
      contentLengthWeight * 0.15     // コンテンツの充実度: 15% -> 15%
    );

    return {
      score,
      factors: {
        sourceWeight,
        keywordWeight,
        freshnessWeight,
        contentLengthWeight
      }
    };
  }

  private isRecentArticle(publishedAt: Date, daysThreshold: number = 7): boolean {
    const threshold = subDays(new Date(), daysThreshold);
    return publishedAt >= threshold;
  }

  private removeDuplicates(items: NewsItem[]): NewsItem[] {
    const seen = new Set<string>();
    return items.filter(item => {
      const key = `${item.url}|${item.title}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  async fetchHackerNewsStories(limit: number = 30): Promise<NewsItem[]> {
    try {
      const topStoriesRes = await axios.get(`${this.HN_API_BASE}/topstories.json`);
      const storyIds = topStoriesRes.data.slice(0, limit);
      
      const stories = await Promise.all(
        storyIds.map(async (id: number) => {
          const storyRes = await axios.get(`${this.HN_API_BASE}/item/${id}.json`);
          const story = storyRes.data;
          
          const item: NewsItem = {
            id: `hn-${story.id}`,
            title: story.title,
            url: story.url,
            publishedAt: new Date(story.time * 1000),
            source: {
              type: 'hackernews' as const,
              name: 'Hacker News',
              url: 'https://news.ycombinator.com'
            },
            visibility: 'public' as const,
            language: 'en' as const
          };

          // 重要度スコアを計算
          item.importance = this.calculateImportanceScore(item);
          
          return item;
        })
      );

      const validStories = stories.filter(story => 
        story.url != null && this.isRecentArticle(story.publishedAt)
      );

      return this.removeDuplicates(validStories);
    } catch (error) {
      console.error('Hacker Newsの取得に失敗しました:', error);
      throw error;
    }
  }

  async fetchRSSFeeds(): Promise<NewsItem[]> {
    const allItems: NewsItem[] = [];

    for (const [key, feed] of Object.entries(this.RSS_FEEDS)) {
      try {
        console.log(`${feed.name}のフィードを取得中...`);
        const response = await axios.get(feed.url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; TechNewsBot/1.0;)',
            'Accept': 'application/rss+xml, application/xml, application/atom+xml, text/xml;q=0.9, */*;q=0.8'
          },
          timeout: 10000
        });
        
        const feedContent = response.data;
        console.log(`${feed.name}のフィード取得成功`);
        
        const parsedFeed = await this.parser.parseString(feedContent);
        const recentItems = parsedFeed.items
          .slice(0, feed.maxItems)
          .map(item => {
            const newsItem: NewsItem = {
              id: `rss-${key}-${item.guid || item.link}`,
              title: item.title || '無題',
              url: item.link || '',
              content: item['content:encoded'] || item.content || item.description || '',
              publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
              source: {
                type: 'rss' as const,
                name: feed.name,
                url: feed.url
              },
              visibility: 'public' as const,
              language: feed.language
            };

            // 重要度スコアを計算
            newsItem.importance = this.calculateImportanceScore(newsItem);

            return newsItem;
          })
          .filter(item => this.isRecentArticle(item.publishedAt));

        console.log(`${feed.name}から${recentItems.length}件の最新記事を取得`);
        allItems.push(...recentItems);
      } catch (error) {
        console.error(`${feed.name}のRSSフィードの取得に失敗しました:`, error);
        continue;
      }
    }

    return this.removeDuplicates(allItems);
  }

  private async summarizeIfImportant(item: NewsItem): Promise<NewsItem> {
    if (!item.content || (item.importance?.score || 0) < 0.8) return item;

    try {
      console.log(`重要な記事を要約中: ${item.title}`);
      
      const content = item.content;
      if (!content) return item;

      if (item.language === 'en') {
        // 英語記事は翻訳も含めて要約
        item.summary = await this.deepseekClient.translateAndSummarize(
          content,
          item.url,
          'en'
        );
      } else {
        // 日本語記事は要約のみ
        item.summary = await this.deepseekClient.summarizeArticle(
          content,
          item.url,
          {
            language: 'ja',
            format: 'paragraph',
            maxLength: 300
          }
        );
      }
      
      console.log(`要約完了: ${item.title}`);
    } catch (error) {
      console.error(`要約生成中にエラーが発生しました: ${item.title}`, error);
    }

    return item;
  }

  async fetchAllNews(): Promise<Article[]> {
    try {
      const articles = await this.scrapingService.fetchAllArticles()
      this.articles = articles.map(article => ({
        title: article.title,
        url: article.url,
        summary: article.summary,
        sourceName: article.sourceName,
        imageUrl: article.imageUrl,
        publishedAt: article.publishedAt ? new Date(article.publishedAt) : undefined,
        importance: article.importance,
        language: article.language,
        originalLanguage: article.language
      }))

      // 各記事にカテゴリーを追加
      for (const article of this.articles) {
        if (!article.category) {
          article.category = await this.classifyCategory(article.title, article.content)
        }
        await this.translateIfNeeded(article)
      }

      return this.articles
    } catch (error) {
      console.error('記事の取得に失敗しました:', error)
      return []
    }
  }

  async getArticleDetails(url: string): Promise<Article | null> {
    try {
      const article = this.articles.find(a => a.url === url)
      if (!article) {
        const scrapedArticle = await this.scrapingService.scrapeArticle(url)
        if (!scrapedArticle) return null
        
        return {
          title: scrapedArticle.title,
          url: scrapedArticle.url,
          summary: scrapedArticle.summary,
          sourceName: scrapedArticle.sourceName,
          imageUrl: scrapedArticle.imageUrl,
          publishedAt: scrapedArticle.publishedAt ? new Date(scrapedArticle.publishedAt) : undefined,
          importance: scrapedArticle.importance,
          language: scrapedArticle.language,
          originalLanguage: scrapedArticle.language
        }
      }
      return article
    } catch (error) {
      console.error('記事の詳細取得に失敗しました:', error)
      return null
    }
  }

  getStats() {
    const totalItems = this.articles.length
    const hackerNewsCount = this.articles.filter(item => item.sourceName === 'Hacker News').length
    const rssCount = this.articles.filter(item => item.sourceName !== 'Hacker News').length
    const japaneseCount = this.articles.filter(item => item.language === 'ja').length
    const englishCount = this.articles.filter(item => item.language === 'en').length
    const importantCount = this.articles.filter(item => (item.importance?.score || 0) >= 0.8).length
    const mediumCount = this.articles.filter(item => {
      const score = item.importance?.score || 0
      return score >= 0.5 && score < 0.8
    }).length
    const lowCount = this.articles.filter(item => (item.importance?.score || 0) < 0.5).length
    const summarizedCount = this.articles.filter(item => item.summary).length

    return {
      totalItems,
      hackerNewsCount,
      rssCount,
      japaneseCount,
      englishCount,
      importanceDistribution: {
        high: importantCount,
        medium: mediumCount,
        low: lowCount
      },
      summarizedCount
    }
  }

  private detectLanguage(text: string): 'ja' | 'en' {
    // 日本語の文字が含まれているかチェック
    const hasJapanese = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/.test(text);
    return hasJapanese ? 'ja' : 'en';
  }

  setDisplayLanguage(language: DisplayLanguage) {
    this.displayLanguage = language
  }

  getDisplayLanguage(): DisplayLanguage {
    return this.displayLanguage
  }

  private async classifyCategory(title: string, content?: string): Promise<Category> {
    const prompt = `
記事のカテゴリーを以下から1つ選んでください：
- AI/ML: AI、機械学習、データサイエンス関連
- Development: プログラミング、開発ツール、開発手法
- Security: セキュリティ、プライバシー、暗号化
- Cloud: クラウドサービス、インフラ、サーバー
- Mobile: モバイルアプリ、スマートフォン、タブレット
- Web: Webサービス、ブラウザ、フロントエンド
- Blockchain: ブロックチェーン、暗号通貨、NFT
- Other: 上記に当てはまらないもの

タイトル: ${title}
${content ? `内容: ${content}\n` : ''}

カテゴリー（英語で回答）: `

    const response = await this.deepseekClient.getCompletion(prompt)
    return response.trim() as Category
  }

  private async translateIfNeeded(article: Article): Promise<void> {
    const needsTranslation = 
      (this.displayLanguage === 'en' && article.originalLanguage === 'ja') ||
      (this.displayLanguage === 'ja' && article.originalLanguage === 'en')

    if (needsTranslation) {
      if (!article.translatedTitle) {
        article.translatedTitle = await this.deepseekClient.translate(
          article.title,
          article.originalLanguage,
          this.displayLanguage
        )
      }

      if (article.summary && !article.translatedSummary) {
        article.translatedSummary = await this.deepseekClient.translate(
          article.summary,
          article.originalLanguage,
          this.displayLanguage
        )
      }
    }
  }

  getArticlesByCategory(category?: Category): Article[] {
    if (!category) return this.articles
    return this.articles.filter(article => article.category === category)
  }
} 