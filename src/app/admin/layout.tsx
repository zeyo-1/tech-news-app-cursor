'use client';

import { useState } from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-background">
      {/* ヘッダー */}
      <AdminHeader
        onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
      />

      {/* サイドバー */}
      <AdminSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      {/* メインコンテンツエリア */}
      <main className={cn(
        "pt-14 min-h-[calc(100vh-3.5rem)] transition-all duration-300",
        isSidebarOpen ? "md:pl-64" : "md:pl-[70px]"
      )}>
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
} 