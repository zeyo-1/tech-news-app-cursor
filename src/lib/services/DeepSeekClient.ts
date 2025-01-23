import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import { DisplayLanguage } from './NewsService';

interface SummarizeOptions {
  maxLength?: number;
  language?: 'ja' | 'en';
  format?: 'bullet' | 'paragraph';
}

interface SummaryCache {
  url: string;
  summary: string;
  created_at: Date;
}

export class DeepSeekClient {
  private apiKey: string;
  private apiEndpoint = 'https://api.deepseek.ai/v1/chat/completions';
  private supabase;
  private maxRetries = 3;
  private retryDelay = 1000; // 1秒

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.DEEPSEEK_API_KEY || '';
    
    if (!this.apiKey) {
      throw new Error('DeepSeek APIキーが設定されていません。環境変数 DEEPSEEK_API_KEY を設定してください。');
    }
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabaseの環境変数が設定されていません');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  private async getCachedSummary(url: string): Promise<string | null> {
    try {
      const { data, error } = await this.supabase
        .from('article_summaries')
        .select('summary')
        .eq('url', url)
        .gt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // 24時間以内のキャッシュのみ
        .single();

      if (error) {
        console.error('キャッシュの取得に失敗しました:', error);
        return null;
      }

      return data?.summary || null;
    } catch (error) {
      console.error('キャッシュの取得中にエラーが発生しました:', error);
      return null;
    }
  }

  private async cacheSummary(url: string, summary: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('article_summaries')
        .upsert({
          url,
          summary,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('キャッシュの保存に失敗しました:', error);
      }
    } catch (error) {
      console.error('キャッシュの保存中にエラーが発生しました:', error);
    }
  }

  private async retryWithDelay<T>(
    operation: () => Promise<T>,
    retries: number = this.maxRetries
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (retries > 0) {
        console.log(`リトライ残り ${retries} 回...`);
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        return this.retryWithDelay(operation, retries - 1);
      }
      throw error;
    }
  }

  private createPrompt(content: string, options: SummarizeOptions = {}): string {
    const { language = 'ja', format = 'paragraph', maxLength = 300 } = options;
    return `
以下の記事を${language === 'ja' ? '日本語' : '英語'}で要約してください。
形式: ${format === 'bullet' ? '箇条書き' : '段落'}
最大文字数: ${maxLength}文字

記事:
${content}
`;
  }

  async summarizeArticle(content: string, url: string, options: SummarizeOptions = {}): Promise<string> {
    try {
      if (!content) throw new Error('コンテンツが空です');

      // キャッシュをチェック
      const cachedSummary = await this.getCachedSummary(url);
      if (cachedSummary) {
        console.log(`キャッシュから要約を取得: ${url}`);
        return cachedSummary;
      }

      console.log(`新しい要約を生成: ${url}`);
      const summary = await this.retryWithDelay(async () => {
        const response = await axios.post(
          this.apiEndpoint,
          {
            model: 'deepseek-chat',
            messages: [{ role: 'user', content: this.createPrompt(content, options) }],
            temperature: 0.7,
            max_tokens: 500,
          },
          {
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
            },
          }
        );

        return response.data.choices[0].message.content.trim();
      });

      // 要約をキャッシュに保存
      await this.cacheSummary(url, summary);
      return summary;
    } catch (error) {
      console.error('要約生成中にエラーが発生しました:', error);
      throw new Error('要約の生成に失敗しました');
    }
  }

  async translateAndSummarize(content: string, url: string, fromLang: 'en' | 'ja'): Promise<string> {
    if (!content) throw new Error('コンテンツが空です');
    
    const options: SummarizeOptions = {
      language: 'ja',
      format: 'paragraph',
      maxLength: 300,
    };
    return this.summarizeArticle(content, url, options);
  }

  private async getCompletion(prompt: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('DeepSeek APIキーが設定されていません');
    }

    try {
      console.log('DeepSeek APIリクエスト開始:', {
        endpoint: this.apiEndpoint,
        hasApiKey: !!this.apiKey,
        promptLength: prompt.length
      });

      const response = await axios.post(
        this.apiEndpoint,
        {
          model: 'deepseek-chat',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 1000,
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 30000 // 30秒タイムアウト
        }
      );

      console.log('DeepSeek APIレスポンス:', {
        status: response.status,
        hasData: !!response.data,
        hasChoices: !!response.data?.choices
      });

      if (!response.data?.choices?.[0]?.message?.content) {
        throw new Error('APIレスポンスが不正です');
      }

      return response.data.choices[0].message.content;
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        console.error('DeepSeek APIエラー詳細:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          headers: error.response?.headers
        });

        if (error.response?.status === 401) {
          throw new Error('DeepSeek API認証エラー: APIキーが無効です。環境変数 DEEPSEEK_API_KEY を確認してください。');
        }
        if (error.response?.status === 404) {
          throw new Error('DeepSeek APIエンドポイントが見つかりません。APIエンドポイントを確認してください。');
        }
      }
      throw new Error(`DeepSeek API呼び出しエラー: ${error.message}`);
    }
  }

  async translate(text: string, from: DisplayLanguage, to: DisplayLanguage): Promise<string> {
    const prompt = `
Translate the following text from ${from === 'ja' ? 'Japanese' : 'English'} to ${to === 'ja' ? 'Japanese' : 'English'}.
Keep the translation natural and maintain the original meaning.

Text: ${text}

Translation:`

    try {
      const translation = await this.getCompletion(prompt)
      return translation.trim()
    } catch (error) {
      console.error('Error translating text:', error)
      throw error
    }
  }
} 