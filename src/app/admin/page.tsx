'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

interface DashboardStats {
  totalArticles: number;
  todayArticles: number;
  lastUpdated: string | null;
  errorCount: number;
  systemStatus: {
    api: boolean;
    database: boolean;
    cache: boolean;
  };
  activityLogs: Array<{
    id: string;
    action: string;
    details: string;
    timestamp: string;
  }>;
}

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalArticles: 0,
    todayArticles: 0,
    lastUpdated: null,
    errorCount: 0,
    systemStatus: {
      api: true,
      database: true,
      cache: true,
    },
    activityLogs: [],
  });

  const supabase = createClientComponentClient();

  const fetchStats = async () => {
    setIsFetching(true);
    try {
      // 総記事数を取得
      const { count: totalArticles } = await supabase
        .from('articles')
        .select('*', { count: 'exact', head: true });

      // 本日の記事数を取得
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { count: todayArticles } = await supabase
        .from('articles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());

      // 最終更新日時を取得
      const { data: lastArticle } = await supabase
        .from('articles')
        .select('created_at')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      // エラー数を取得（過去24時間）
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const { count: errorCount } = await supabase
        .from('error_logs')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', yesterday.toISOString());

      // アクティビティログを取得（最新10件）
      const { data: activityLogs } = await supabase
        .from('activity_logs')
        .select('id, action, details, created_at')
        .order('created_at', { ascending: false })
        .limit(10);

      // システムステータスをチェック
      const systemStatus = {
        api: await checkApiStatus(),
        database: await checkDatabaseStatus(),
        cache: await checkCacheStatus(),
      };

      setStats({
        totalArticles: totalArticles || 0,
        todayArticles: todayArticles || 0,
        lastUpdated: lastArticle?.created_at || null,
        errorCount: errorCount || 0,
        systemStatus,
        activityLogs: activityLogs?.map(log => ({
          id: log.id,
          action: log.action,
          details: log.details,
          timestamp: log.created_at
        })) || [],
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setIsFetching(false);
    }
  };

  // APIステータスのチェック
  const checkApiStatus = async () => {
    try {
      const response = await fetch('/api/health/deepseek');
      return response.ok;
    } catch {
      return false;
    }
  };

  // データベースステータスのチェック
  const checkDatabaseStatus = async () => {
    try {
      const { data } = await supabase.from('health').select('*').limit(1);
      return true;
    } catch {
      return false;
    }
  };

  // キャッシュステータスのチェック
  const checkCacheStatus = async () => {
    try {
      const response = await fetch('/api/health/cache');
      return response.ok;
    } catch {
      return false;
    }
  };

  const handleManualFetch = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/cron', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET}`
        }
      });
      
      if (!response.ok) {
        throw new Error('記事の取得に失敗しました');
      }
      
      const data = await response.json();
      console.log('Manual fetch result:', data);
      
      // 統計を更新
      await fetchStats();
    } catch (error) {
      console.error('Manual fetch failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // 1分ごとに統計情報を更新
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">ダッシュボード</h1>
        <Button
          onClick={handleManualFetch}
          disabled={isLoading}
        >
          <RefreshCw className={cn(
            "mr-2 h-4 w-4",
            isLoading && "animate-spin"
          )} />
          記事を取得
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              総記事数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isFetching ? (
                <div className="h-8 w-16 animate-pulse rounded bg-muted" />
              ) : (
                stats.totalArticles.toLocaleString()
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              本日の新規記事
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isFetching ? (
                <div className="h-8 w-16 animate-pulse rounded bg-muted" />
              ) : (
                stats.todayArticles.toLocaleString()
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              エラー発生数（24時間）
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {isFetching ? (
                <div className="h-8 w-16 animate-pulse rounded bg-muted" />
              ) : (
                stats.errorCount.toLocaleString()
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              最終更新
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isFetching ? (
                <div className="h-8 w-32 animate-pulse rounded bg-muted" />
              ) : (
                stats.lastUpdated ? (
                  format(new Date(stats.lastUpdated), 'M/d HH:mm', { locale: ja })
                ) : '-'
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>アクティビティログ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isFetching ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
                    <div className="space-y-2">
                      <div className="h-4 w-[250px] animate-pulse rounded bg-muted" />
                      <div className="h-3 w-[200px] animate-pulse rounded bg-muted" />
                    </div>
                  </div>
                ))
              ) : stats.activityLogs.length > 0 ? (
                <div className="space-y-4">
                  {stats.activityLogs.map((log) => (
                    <div key={log.id} className="border-b pb-4 last:border-0 last:pb-0">
                      <p className="text-sm text-muted-foreground">{log.details}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(log.timestamp), 'M/d HH:mm:ss', { locale: ja })}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">アクティビティログはありません</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>システムステータス</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">DeepSeek API</span>
                <StatusBadge status={stats.systemStatus.api} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">データベース</span>
                <StatusBadge status={stats.systemStatus.database} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">キャッシュ</span>
                <StatusBadge status={stats.systemStatus.cache} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ステータスバッジコンポーネント
function StatusBadge({ status }: { status: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        status
          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      )}
    >
      {status ? "正常" : "異常"}
    </span>
  );
}

// アクティビティアイコンコンポーネント
function ActivityIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
} 