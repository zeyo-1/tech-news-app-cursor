INSERT INTO articles (
  title,
  summary,
  content,
  category,
  status,
  source_url,
  source_name,
  published_at,
  created_at,
  updated_at,
  slug,
  language
) VALUES (
  'テスト記事1',
  'これはテスト記事の要約です。',
  'これはテスト記事の本文です。',
  'Technology',
  'published',
  'https://example.com',
  'テストソース',
  '2024-03-21T00:00:00Z',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP,
  'test-article-1',
  'ja'
); 