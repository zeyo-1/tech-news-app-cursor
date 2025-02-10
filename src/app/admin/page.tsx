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
}

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalArticles: 0,
    todayArticles: 0,
    lastUpdated: null,
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

      setStats({
        totalArticles: totalArticles || 0,
        todayArticles: todayArticles || 0,
        lastUpdated: lastArticle?.created_at || null,
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setIsFetching(false);
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
    </div>
  );
} 