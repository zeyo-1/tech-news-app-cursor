# Tech News App

## 概要
テクノロジー関連のニュースを自動収集し、AIによる要約を提供するWebアプリケーションです。

## 主な機能
- 複数のテックニュースサイトからのRSSフィード取得
- DeepSeek APIを使用した記事の自動要約
- キャッシュシステムによる高速なレスポンス
- 重複記事の自動検出と除外
- 記事の重要度に基づく自動ソート

## 技術スタック
- Next.js 15.1.5
- TypeScript
- Tailwind CSS
- DeepSeek API（要約生成）
- RSS Parser
- Axios
- Cheerio（スクレイピング）

## セットアップ
1. リポジトリのクローン
```bash
git clone [repository-url]
cd tech-news-app-cursor
```

2. 依存関係のインストール
```bash
npm install
```

3. 環境変数の設定
`.env.local`ファイルを作成し、以下の環境変数を設定：
```
DEEPSEEK_API_KEY=your_api_key_here
```

4. 開発サーバーの起動
```bash
npm run dev
```

## API エンドポイント
- `GET /api/test-rss`: 最新のニュース記事を取得

## 注意事項
- DeepSeek APIの利用には有効なAPIキーが必要です
- RSSフィードの取得間隔に制限があります
- キャッシュの有効期限は30分に設定されています

## 開発環境
- Node.js 18.x以上
- npm 9.x以上

## 今後の予定
- [ ] フロントエンドUIの実装
- [ ] 記事のカテゴリー分類機能
- [ ] ユーザー認証システム
- [ ] お気に入り機能
- [ ] 既読管理機能

## ライセンス
MIT License
