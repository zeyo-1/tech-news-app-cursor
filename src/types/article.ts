export interface Article {
  id?: string;
  title: string;
  url: string;
  content?: string;
  summary: string;
  source_name: string;
  image_url?: string;
  published_at: string;
  importance?: {
    score: number;
  };
  category?: string;
  language: string;
  view_count?: number;
  engagement_score?: number;
  tags?: string[];
  thumbnail: string;
  
  // メタデータ
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
} 