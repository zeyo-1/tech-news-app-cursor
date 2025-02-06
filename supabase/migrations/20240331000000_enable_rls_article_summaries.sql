-- RLSを有効化
ALTER TABLE public.article_summaries ENABLE ROW LEVEL SECURITY;

-- 誰でも記事サマリーを閲覧できるポリシーを作成
CREATE POLICY "Article summaries are viewable by everyone"
  ON public.article_summaries
  FOR SELECT
  USING (true);

-- 管理者のみが記事サマリーを作成・更新・削除できるポリシー
CREATE POLICY "Only admins can insert article summaries"
  ON public.article_summaries
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only admins can update article summaries"
  ON public.article_summaries
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only admins can delete article summaries"
  ON public.article_summaries
  FOR DELETE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin'); 