'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import {
  MoreHorizontal,
  ArrowUpDown,
  ChevronDown,
  RefreshCw,
} from 'lucide-react';
import { Article } from '@/types/article';

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortField, setSortField] = useState<string>('published_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [categories, setCategories] = useState<string[]>([]);

  const supabase = createClientComponentClient();

  // 記事データの取得
  const fetchArticles = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('articles')
        .select('*')
        .order(sortField, { ascending: sortOrder === 'asc' });

      // 検索クエリがある場合
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,summary.ilike.%${searchQuery}%`);
      }

      // カテゴリーが選択されている場合
      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      const { data, error } = await query;

      if (error) throw error;
      setArticles(data || []);

      // カテゴリー一覧の取得
      const uniqueCategories = Array.from(
        new Set(data?.map(article => article.category).filter(Boolean))
      );
      setCategories(uniqueCategories as string[]);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 記事の削除
  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // 記事一覧を更新
      fetchArticles();
    } catch (error) {
      console.error('Error deleting article:', error);
    }
  };

  // 記事の公開/非公開切り替え
  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('articles')
        .update({ is_published: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      
      // 記事一覧を更新
      fetchArticles();
    } catch (error) {
      console.error('Error toggling article status:', error);
    }
  };

  // ソート順の切り替え
  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [searchQuery, selectedCategory, sortField, sortOrder]);

  return (
    <div className="space-y-4 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">記事管理</h1>
        <Button onClick={() => fetchArticles()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          更新
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <Input
            placeholder="記事を検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Select
          value={selectedCategory}
          onValueChange={setSelectedCategory}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="カテゴリー" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべて</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[400px]">
                <Button
                  variant="ghost"
                  onClick={() => toggleSort('title')}
                >
                  タイトル
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => toggleSort('category')}
                >
                  カテゴリー
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => toggleSort('published_at')}
                >
                  公開日
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>ステータス</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  読み込み中...
                </TableCell>
              </TableRow>
            ) : articles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  記事が見つかりません
                </TableCell>
              </TableRow>
            ) : (
              articles.map((article) => (
                <TableRow key={article.id}>
                  <TableCell className="font-medium">{article.title}</TableCell>
                  <TableCell>{article.category || '-'}</TableCell>
                  <TableCell>
                    {format(new Date(article.published_at), 'yyyy/MM/dd HH:mm', { locale: ja })}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        article.is_published
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {article.is_published ? '公開中' : '非公開'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">メニューを開く</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>操作</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => window.location.href = article.source_url}
                        >
                          元記事を表示
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleTogglePublish(article.id!, article.is_published!)}
                        >
                          {article.is_published ? '非公開にする' : '公開する'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete(article.id!)}
                        >
                          削除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 