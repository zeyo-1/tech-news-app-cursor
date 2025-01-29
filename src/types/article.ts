export interface Article {
  id: string;
  url: string;
  title: string;
  content?: string;
  summary?: string;
  source_name: string;
  image_url?: string;
  
  // メタデータ
  published_at?: string;
  importance_score?: number;
  category?: string;
  language: string;
  
  // スクレイピング管理
  last_scraped_at: string;
  scraping_frequency?: string;
  error_count: number;
  last_error?: string;
  
  // 監査情報
  created_at: string;
  updated_at: string;
  deleted_at?: string;
} 