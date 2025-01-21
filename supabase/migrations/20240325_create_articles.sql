-- articlesテーブルの作成
create table articles (
  -- 基本情報
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  slug text unique not null,
  content text not null,
  summary text,
  author text,
  
  -- メディア関連
  thumbnail_url text,
  image_url text,
  
  -- 分類・管理
  category text,
  tags text[],
  language text default 'ja',
  status text default 'draft',
  version integer default 1,
  reading_time integer,
  
  -- 表示制御
  featured boolean default false,
  pinned boolean default false,
  
  -- SEO・メタデータ
  meta_title text,
  meta_description text,
  
  -- ソース情報
  source_name text,
  source_url text,
  source_logo_url text,
  
  -- エンゲージメント
  view_count integer default 0,
  like_count integer default 0,
  comment_count integer default 0,
  
  -- 関連記事
  related_article_ids uuid[],
  
  -- タイムスタンプ
  published_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  deleted_at timestamp with time zone
);

-- インデックスの作成
create index articles_slug_idx on articles (slug);
create index articles_category_idx on articles (category);
create index articles_language_idx on articles (language);
create index articles_status_idx on articles (status);
create index articles_published_at_idx on articles (published_at);

-- RLSポリシーの設定
alter table articles enable row level security;

-- 誰でも記事を閲覧できるポリシー
create policy "Articles are viewable by everyone"
  on articles for select
  using (
    status = 'published' 
    and deleted_at is null
  );

-- 管理者のみが記事を作成・更新・削除できるポリシー
create policy "Only admins can insert articles"
  on articles for insert
  to authenticated
  with check (auth.jwt() ->> 'role' = 'admin');

create policy "Only admins can update articles"
  on articles for update
  to authenticated
  using (auth.jwt() ->> 'role' = 'admin')
  with check (auth.jwt() ->> 'role' = 'admin');

create policy "Only admins can delete articles"
  on articles for delete
  to authenticated
  using (auth.jwt() ->> 'role' = 'admin'); 