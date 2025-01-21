'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/components/ui/use-toast';

type Report = {
  id: string;
  comment_id: string;
  user_id: string;
  reason: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'rejected';
  created_at: string;
  comment: {
    id: string;
    content: string;
    user: {
      name: string;
    };
  };
  user: {
    name: string;
  };
};

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const supabase = createClientComponentClient();
  const { toast } = useToast();

  useEffect(() => {
    const checkAdminStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        window.location.href = '/auth/login';
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('user_id', session.user.id)
        .single();

      if (!profile?.is_admin) {
        window.location.href = '/';
        return;
      }

      setIsAdmin(true);
      fetchReports();
    };

    checkAdminStatus();
  }, [supabase]);

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from('comment_reports')
        .select(`
          *,
          comment:comments(
            id,
            content,
            user:profiles(name)
          ),
          user:profiles(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast({
        title: 'エラー',
        description: '通報の取得に失敗しました。',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateReportStatus = async (reportId: string, newStatus: Report['status']) => {
    try {
      const { error } = await supabase
        .from('comment_reports')
        .update({ status: newStatus })
        .eq('id', reportId);

      if (error) throw error;

      setReports(reports.map(report =>
        report.id === reportId ? { ...report, status: newStatus } : report
      ));

      toast({
        title: '更新完了',
        description: 'ステータスを更新しました。',
      });
    } catch (error) {
      console.error('Error updating report status:', error);
      toast({
        title: 'エラー',
        description: 'ステータスの更新に失敗しました。',
        variant: 'destructive',
      });
    }
  };

  if (!isAdmin) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">通報管理</h1>
      <div className="space-y-6">
        {reports.map((report) => (
          <div
            key={report.id}
            className="border rounded-lg p-6 bg-white shadow-sm"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm text-gray-500">
                  通報者: {report.user.name}
                </p>
                <p className="text-sm text-gray-500">
                  通報日時: {formatDistanceToNow(new Date(report.created_at), {
                    addSuffix: true,
                    locale: ja,
                  })}
                </p>
                <p className="text-sm text-gray-500">
                  理由: {report.reason}
                </p>
              </div>
              <Select
                value={report.status}
                onValueChange={(value: Report['status']) => updateReportStatus(report.id, value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">対応待ち</SelectItem>
                  <SelectItem value="reviewed">確認済み</SelectItem>
                  <SelectItem value="resolved">対応済み</SelectItem>
                  <SelectItem value="rejected">却下</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500 mb-2">
                コメント投稿者: {report.comment.user.name}
              </p>
              <p className="whitespace-pre-wrap">{report.comment.content}</p>
            </div>
          </div>
        ))}
        {reports.length === 0 && (
          <p className="text-center text-gray-500">通報はありません。</p>
        )}
      </div>
    </div>
  );
} 