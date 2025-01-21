export type Article = {
  // 基本情報
  id: string;
  title: string;
  slug: string;
  content: string;
  summary?: string;
  author?: string;
  
  // メディア関連
  thumbnailUrl?: string;
  imageUrl?: string;
  
  // 分類・管理
  category?: string;
  tags?: string[];
  language: string;
  status: 'draft' | 'published' | 'archived';
  version: number;
  readingTime?: number;
  
  // 表示制御
  featured: boolean;
  pinned: boolean;
  
  // SEO・メタデータ
  metaTitle?: string;
  metaDescription?: string;
  
  // ソース情報
  sourceName?: string;
  sourceUrl?: string;
  sourceLogoUrl?: string;
  
  // エンゲージメント
  viewCount: number;
  likeCount: number;
  commentCount: number;
  
  // 関連記事
  relatedArticleIds?: string[];
  
  // タイムスタンプ
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}; 