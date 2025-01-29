-- 既存のarticlesテーブルに新しい列を追加
ALTER TABLE articles
  ADD COLUMN IF NOT EXISTS source_name TEXT,
  ADD COLUMN IF NOT EXISTS importance_score FLOAT,
  ADD COLUMN IF NOT EXISTS last_scraped_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS scraping_frequency INTERVAL DEFAULT '1 hour',
  ADD COLUMN IF NOT EXISTS error_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_error TEXT;

-- インデックスの追加
CREATE INDEX IF NOT EXISTS idx_articles_importance_score ON articles(importance_score);
CREATE INDEX IF NOT EXISTS idx_articles_last_scraped_at ON articles(last_scraped_at);
CREATE INDEX IF NOT EXISTS idx_articles_source_name ON articles(source_name);

-- updated_at自動更新用のトリガー（既に存在しない場合のみ作成）
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_articles_updated_at') THEN
    CREATE TRIGGER update_articles_updated_at
      BEFORE UPDATE ON articles
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END
$$;

-- RLSポリシーの更新（既存のポリシーを削除して再作成）
DROP POLICY IF EXISTS "Articles are viewable by everyone" ON articles;
DROP POLICY IF EXISTS "Only admins can insert articles" ON articles;
DROP POLICY IF EXISTS "Only admins can update articles" ON articles;
DROP POLICY IF EXISTS "Only admins can delete articles" ON articles;

-- 新しいRLSポリシーの作成
CREATE POLICY "Articles are viewable by everyone"
  ON articles FOR SELECT
  USING (deleted_at IS NULL);

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