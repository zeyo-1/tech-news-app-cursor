export interface Article {
  id?: string;
  title: string;
  url?: string;
  source_url: string;
  content?: string;
  summary: string;
  source_name: string;
  image_url?: string | null;
  published_at: string;
  importance?: {
    score: number;
  };
  category?: string;
  language: string;
  view_count?: number;
  engagement_score?: number;
  tags?: string[];
  thumbnail?: string;
  
  // メタデータ
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface Tag {
  id: string;
  name: string;
} 