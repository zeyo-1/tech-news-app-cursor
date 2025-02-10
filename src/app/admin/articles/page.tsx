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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import {
  MoreHorizontal,
  ArrowUpDown,
  ChevronDown,
  RefreshCw,
  Check,
  Loader2,
  Trash2,
  ChevronUp,
} from 'lucide-react';
import { Article } from '@/types/article';
import { ArticleDetailModal } from '@/components/admin/ArticleDetailModal';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

const ITEMS_PER_PAGE = 10;

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortField, setSortField] = useState<string>('published_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [categories, setCategories] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClientComponentClient();

  // 記事データの取得
  const fetchArticles = async () => {
    setIsLoading(true);
    try {
      // 総件数の取得
      let countQuery = supabase
        .from('articles')
        .select('*', { count: 'exact', head: true });

      if (searchQuery) {
        countQuery = countQuery.or(`title.ilike.%${searchQuery}%,summary.ilike.%${searchQuery}%`);
      }

      if (selectedCategory !== 'all') {
        countQuery = countQuery.eq('category', selectedCategory);
      }

      const { count, error: countError } = await countQuery;
      
      if (countError) throw countError;
      setTotalCount(count || 0);

      // 記事データの取得
      let query = supabase
        .from('articles')
        .select('*')
        .order(sortField, { ascending: sortOrder === 'asc' })
        .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1);

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,summary.ilike.%${searchQuery}%`);
      }

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
      setError('記事の取得に失敗しました');
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
  const handleTogglePublish = async (id: string, currentStatus: string) => {
    try {
      const { error } = await supabase
        .from('articles')
        .update({ status: currentStatus === 'published' ? 'draft' : 'published' })
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

  // ページ変更時の処理
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // 一括操作の処理
  const handleBulkAction = async (action: 'publish' | 'unpublish' | 'delete') => {
    if (selectedIds.length === 0) return;

    try {
      const response = await fetch('/api/admin/articles/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          articleIds: selectedIds,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to perform bulk action');
      }

      await fetchArticles();
      setSelectedIds([]);
    } catch (error) {
      console.error('Error performing bulk action:', error);
      setError('一括操作に失敗しました');
    }
  };

  // 全選択の処理
  const handleSelectAll = (checked: boolean | 'indeterminate') => {
    if (checked === true) {
      setSelectedIds(articles.map(article => article.id));
    } else {
      setSelectedIds([]);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [searchQuery, selectedCategory, sortField, sortOrder, currentPage]);

  // 総ページ数の計算
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  // ページネーションの表示範囲を計算
  const getPageRange = () => {
    const range: number[] = [];
    const maxVisiblePages = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let end = Math.min(totalPages, start + maxVisiblePages - 1);

    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }

    for (let i = start; i <= end; i++) {
      range.push(i);
    }

    return range;
  };

  if (isLoading) {
    return (
      <div className="flex h-[200px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[200px] items-center justify-center text-destructive">
        {error}
      </div>
    );
  }

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
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1); // 検索時はページを1に戻す
            }}
            className="max-w-sm"
          />
        </div>
        <Select
          value={selectedCategory}
          onValueChange={(value) => {
            setSelectedCategory(value);
            setCurrentPage(1); // カテゴリー変更時はページを1に戻す
          }}
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

      <div className="flex items-center justify-between">
        {selectedIds.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                一括操作
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleBulkAction('publish')}>
                公開する
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBulkAction('unpublish')}>
                非公開にする
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleBulkAction('delete')}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                削除する
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={selectedIds.length === articles.length}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
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
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(article.id)}
                      onCheckedChange={(checked: boolean | 'indeterminate') => {
                        if (checked === true) {
                          setSelectedIds([...selectedIds, article.id]);
                        } else {
                          setSelectedIds(selectedIds.filter(id => id !== article.id));
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="link"
                      className="h-auto p-0 font-medium"
                      onClick={() => setSelectedArticle(article)}
                    >
                      {article.title}
                    </Button>
                  </TableCell>
                  <TableCell>{article.category || '-'}</TableCell>
                  <TableCell>
                    {format(new Date(article.published_at), 'yyyy/MM/dd HH:mm', { locale: ja })}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        article.status === 'published'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}
                    >
                      {article.status === 'published' ? '公開中' : '下書き'}
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
                          onClick={() => handleTogglePublish(article.id!, article.status)}
                        >
                          {article.status === 'published' ? '下書きにする' : '公開する'}
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

      {/* ページネーション */}
      {!isLoading && articles.length > 0 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              />
            </PaginationItem>
            
            {getPageRange().map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => handlePageChange(page)}
                  isActive={page === currentPage}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* 総件数の表示 */}
      {!isLoading && (
        <div className="text-sm text-muted-foreground text-center">
          全{totalCount}件中 {(currentPage - 1) * ITEMS_PER_PAGE + 1}～
          {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)}件を表示
        </div>
      )}

      <ArticleDetailModal
        article={selectedArticle}
        isOpen={!!selectedArticle}
        onClose={() => setSelectedArticle(null)}
        onUpdate={fetchArticles}
      />
    </div>
  );
} 