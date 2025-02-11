'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RefreshCw, Loader2, AlertTriangle } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Badge } from '@/components/ui/badge';

interface ErrorLog {
  id: string;
  error_type: string;
  message: string;
  stack_trace: string;
  metadata: any;
  created_at: string;
  resolved_at: string | null;
  resolved_by: string | null;
  severity: 'error' | 'warning' | 'critical';
  resolver?: {
    email: string;
  };
}

const ITEMS_PER_PAGE = 20;

const severityColors = {
  error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  critical: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
};

export default function ErrorLogsPage() {
  const [logs, setLogs] = useState<ErrorLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClientComponentClient();

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      // 総件数の取得
      let countQuery = supabase
        .from('error_logs')
        .select('*', { count: 'exact', head: true });

      if (searchQuery) {
        countQuery = countQuery.or(`message.ilike.%${searchQuery}%,error_type.ilike.%${searchQuery}%`);
      }

      if (selectedSeverity !== 'all') {
        countQuery = countQuery.eq('severity', selectedSeverity);
      }

      if (selectedStatus === 'resolved') {
        countQuery = countQuery.not('resolved_at', 'is', null);
      } else if (selectedStatus === 'unresolved') {
        countQuery = countQuery.is('resolved_at', null);
      }

      const { count, error: countError } = await countQuery;
      
      if (countError) throw countError;
      setTotalCount(count || 0);

      // ログデータの取得
      let query = supabase
        .from('error_logs')
        .select(`
          *,
          resolver:profiles(email)
        `)
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1);

      if (searchQuery) {
        query = query.or(`message.ilike.%${searchQuery}%,error_type.ilike.%${searchQuery}%`);
      }

      if (selectedSeverity !== 'all') {
        query = query.eq('severity', selectedSeverity);
      }

      if (selectedStatus === 'resolved') {
        query = query.not('resolved_at', 'is', null);
      } else if (selectedStatus === 'unresolved') {
        query = query.is('resolved_at', null);
      }

      const { data, error } = await query;

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching error logs:', error);
      setError('エラーログの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResolve = async (id: string) => {
    try {
      const { error } = await supabase
        .from('error_logs')
        .update({
          resolved_at: new Date().toISOString(),
          resolved_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .eq('id', id);

      if (error) throw error;
      
      // ログ一覧を更新
      fetchLogs();
    } catch (error) {
      console.error('Error resolving error log:', error);
      setError('エラーログの解決に失敗しました');
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [searchQuery, selectedSeverity, selectedStatus, currentPage]);

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
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold">エラーログ</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertTriangle className="h-4 w-4" />
            <span>未解決のエラー: {logs.filter(log => !log.resolved_at).length}件</span>
          </div>
        </div>
        <Button onClick={() => fetchLogs()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          更新
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <Input
            placeholder="エラーを検索..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="max-w-sm"
          />
        </div>
        <Select
          value={selectedSeverity}
          onValueChange={(value) => {
            setSelectedSeverity(value);
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="重要度" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべて</SelectItem>
            <SelectItem value="error">エラー</SelectItem>
            <SelectItem value="warning">警告</SelectItem>
            <SelectItem value="critical">重大</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={selectedStatus}
          onValueChange={(value) => {
            setSelectedStatus(value);
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="ステータス" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべて</SelectItem>
            <SelectItem value="resolved">解決済み</SelectItem>
            <SelectItem value="unresolved">未解決</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>日時</TableHead>
              <TableHead>種類</TableHead>
              <TableHead>重要度</TableHead>
              <TableHead>メッセージ</TableHead>
              <TableHead>ステータス</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  エラーログが見つかりません
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="whitespace-nowrap">
                    {format(new Date(log.created_at), 'yyyy/MM/dd HH:mm:ss', { locale: ja })}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {log.error_type}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${severityColors[log.severity]}`}>
                      {log.severity}
                    </span>
                  </TableCell>
                  <TableCell>{log.message}</TableCell>
                  <TableCell>
                    {log.resolved_at ? (
                      <div className="text-sm">
                        <Badge variant="secondary">解決済み</Badge>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {format(new Date(log.resolved_at), 'yyyy/MM/dd HH:mm', { locale: ja })}
                          <br />
                          {log.resolver?.email}
                        </div>
                      </div>
                    ) : (
                      <Badge>未解決</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {!log.resolved_at && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResolve(log.id)}
                      >
                        解決済みにする
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* ページネーション */}
      {!isLoading && logs.length > 0 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              />
            </PaginationItem>
            
            {getPageRange().map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => setCurrentPage(page)}
                  isActive={page === currentPage}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                onClick={() => setCurrentPage(currentPage + 1)}
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
    </div>
  );
} 