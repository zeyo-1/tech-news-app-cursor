import type { Category } from '@/components/CategoryFilter'
import type { Tag } from '@/components/TagFilter'

export interface Article {
  title: string;
  url: string;
  source: string;
  published_at: string;
  summary: string;
  thumbnail: string;
  content?: string;
  image_url?: string | null;
  category?: Category;
  tags?: Tag[];
  view_count?: number;
  engagement_score?: number;
} 