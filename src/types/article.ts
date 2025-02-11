export interface Article {
  id: string;
  title: string;
  summary: string;
  content: string;
  source_url: string;
  category: string;
  published_at: string;
  status: 'published' | 'draft';
  created_at: string;
  updated_at: string;
  source_name: string;
  slug: string;
  language: string;
  thumbnail_url?: string;
  image_url?: string;
  tags?: string[];
  reading_time?: number;
  featured?: boolean;
  pinned?: boolean;
  view_count?: number;
  like_count?: number;
  related_article_ids?: string[];
  deleted_at?: string;
  importance_score?: number;
  last_scraped_at?: string;
  engagement_score?: number;
}

export interface Tag {
  id: string;
  name: string;
} 