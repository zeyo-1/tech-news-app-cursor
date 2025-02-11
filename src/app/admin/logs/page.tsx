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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface ActivityLog {
  id: string;
  action: string;
  details: string;
  user_id: string;
  created_at: string;
  metadata: any;
  profiles?: {
    id: string;
    name: string | null;
    avatar_url: string | null;
  };
}

interface ActionData {
  action: string;
}

const ITEMS_PER_PAGE = 20;

export default function LogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [actions, setActions] = useState<string[]>([]);
  const supabase = createClientComponentClient();

  // ログの取得
  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('activity_logs')
        .select(`
          *,
          profiles (
            id,
            name,
            avatar_url
          )
        `, { count: 'exact' });

      // 検索フィルター
      if (searchQuery) {
        query = query.or(`details.ilike.%${searchQuery}%,action.ilike.%${searchQuery}%`);
      }

      // アクションフィルター
      if (selectedAction && selectedAction !== 'all') {
        query = query.eq('action', selectedAction);
      }

      // ページネーション
      const start = (currentPage - 1) * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE - 1;

      const { data: logsData, error: logsError, count } = await query
        .order('created_at', { ascending: false })
        .range(start, end);

      if (logsError) {
        throw new Error(`ログの取得に失敗しました: ${logsError.message}`);
      }

      setLogs(logsData || []);
      if (count !== null) setTotalCount(count);

      // アクションの種類を取得
      const { data: actionsData, error: actionsError } = await supabase
        .from('activity_logs')
        .select('action')
        .order('action');

      if (actionsError) {
        throw new Error(`アクションの取得に失敗しました: ${actionsError.message}`);
      }

      if (actionsData) {
        const uniqueActions = Array.from(new Set(actionsData.map(item => item.action))).filter(Boolean);
        setActions(uniqueActions);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'ログの取得中にエラーが発生しました';
      console.error('Error fetching logs:', error);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [searchQuery, selectedAction, currentPage]);

  // ページ範囲の計算
  const getPageRange = () => {
    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, start + 4);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>アクティビティログ</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-md bg-destructive/15 p-3 text-destructive">
              <p>{error}</p>
            </div>
          )}

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 gap-4">
              <Input
                placeholder="検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-xs"
              />
              <Select
                value={selectedAction || undefined}
                onValueChange={setSelectedAction}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="アクション" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  {actions.map((action) => (
                    <SelectItem key={action} value={action}>
                      {action}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-6 rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>日時</TableHead>
                  <TableHead>アクション</TableHead>
                  <TableHead>詳細</TableHead>
                  <TableHead>ユーザー</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                    </TableCell>
                  </TableRow>
                ) : logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      ログが見つかりません
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap">
                        {format(new Date(log.created_at), 'yyyy/MM/dd HH:mm:ss', { locale: ja })}
                      </TableCell>
                      <TableCell>{log.action}</TableCell>
                      <TableCell>{log.details}</TableCell>
                      <TableCell>
                        {log.profiles ? (
                          <div className="flex items-center gap-2">
                            {log.profiles.avatar_url && (
                              <img
                                src={log.profiles.avatar_url}
                                alt=""
                                className="h-6 w-6 rounded-full"
                              />
                            )}
                            <span>{log.profiles.name || log.user_id}</span>
                          </div>
                        ) : (
                          '不明なユーザー'
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {totalCount > ITEMS_PER_PAGE && (
            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    />
                  </PaginationItem>
                  {getPageRange().map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
                        isActive={currentPage === page}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage(p => Math.min(Math.ceil(totalCount / ITEMS_PER_PAGE), p + 1))}
                      disabled={currentPage === Math.ceil(totalCount / ITEMS_PER_PAGE)}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 