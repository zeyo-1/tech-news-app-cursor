export interface Article {
  id: string;
  title: string;
  summary: string;
  content: string;
  source_url: string;
  category: string;
  published_at: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  name: string;
} 