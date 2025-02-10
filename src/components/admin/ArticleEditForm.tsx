'use client';

import { useState, useEffect } from 'react';
import { Article } from '@/types/article';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Loader2 } from 'lucide-react';

interface ArticleEditFormProps {
  article: Article;
  onSave: () => void;
  onCancel: () => void;
}

export function ArticleEditForm({
  article,
  onSave,
  onCancel,
}: ArticleEditFormProps) {
  const [title, setTitle] = useState(article.title);
  const [summary, setSummary] = useState(article.summary);
  const [content, setContent] = useState(article.content);
  const [category, setCategory] = useState(article.category);
  const [status, setStatus] = useState(article.status);
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);

  const supabase = createClientComponentClient();

  // カテゴリー一覧の取得
  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from('articles')
        .select('category')
        .not('category', 'is', null);

      if (data) {
        const uniqueCategories = Array.from(
          new Set(data.map(item => item.category).filter(Boolean))
        );
        setCategories(uniqueCategories as string[]);
      }
    };

    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch(`/api/admin/articles/${article.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          summary,
          content,
          category,
          status,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update article');
      }

      onSave();
    } catch (error) {
      console.error('Error updating article:', error);
      // TODO: エラー表示の実装
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">タイトル</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="summary">要約</Label>
        <Textarea
          id="summary"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          required
          className="min-h-[100px]"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">本文</Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          className="min-h-[200px]"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">カテゴリー</Label>
          <Select
            value={category}
            onValueChange={setCategory}
          >
            <SelectTrigger>
              <SelectValue placeholder="カテゴリーを選択" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">公開状態</Label>
          <Select
            value={status}
            onValueChange={(value: 'published' | 'draft') => setStatus(value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="published">公開</SelectItem>
              <SelectItem value="draft">下書き</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSaving}
        >
          キャンセル
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          保存
        </Button>
      </div>
    </form>
  );
} 