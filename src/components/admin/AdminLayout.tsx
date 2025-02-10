'use client';

import { useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-background">
      {/* ヘッダー */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2 md:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-semibold">管理者ダッシュボード</h2>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <div className="flex-1 items-start md:grid md:grid-cols-[220px_1fr] md:gap-6 lg:grid-cols-[240px_1fr] lg:gap-10">
        {/* サイドバー */}
        <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        {/* メインコンテンツエリア */}
        <main className="relative py-6 lg:gap-10 lg:py-8 xl:grid-cols-[1fr_300px]">
          <div className="mx-auto w-full min-w-0">
            <div className="pb-12 pt-4">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 