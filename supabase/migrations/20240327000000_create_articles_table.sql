-- 記事管理用のテーブルを作成
CREATE TABLE articles (
  -- 基本情報
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  url TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  summary TEXT,
  source_name TEXT NOT NULL,
  image_url TEXT,
  
  -- メタデータ
  published_at TIMESTAMP WITH TIME ZONE,
  importance_score FLOAT,
  category TEXT,
  language TEXT DEFAULT 'ja',
  
  -- スクレイピング管理
  last_scraped_at TIMESTAMP WITH TIME ZONE,
  scraping_frequency INTERVAL DEFAULT '1 hour',
  error_count INTEGER DEFAULT 0,
  last_error TEXT,
  
  -- 監査情報
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- インデックス
CREATE INDEX idx_articles_published_at ON articles(published_at);
CREATE INDEX idx_articles_importance_score ON articles(importance_score);
CREATE INDEX idx_articles_category ON articles(category);
CREATE INDEX idx_articles_language ON articles(language);
CREATE INDEX idx_articles_last_scraped_at ON articles(last_scraped_at);
CREATE INDEX idx_articles_source_name ON articles(source_name);

-- 論理削除用のインデックス
CREATE INDEX idx_articles_deleted_at ON articles(deleted_at);

-- updated_at自動更新用のトリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLSポリシーの設定
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- 誰でも記事を閲覧できるポリシー
CREATE POLICY "Articles are viewable by everyone"
  ON articles FOR SELECT
  USING (deleted_at IS NULL);

-- 管理者のみが記事を作成・更新・削除できるポリシー
CREATE POLICY "Only admins can insert articles"
  ON articles FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only admins can update articles"
  ON articles FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only admins can delete articles"
  ON articles FOR DELETE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin'); 