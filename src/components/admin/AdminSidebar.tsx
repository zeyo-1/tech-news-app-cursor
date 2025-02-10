'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FileText,
  Users,
  BarChart,
  Bell,
  Settings,
  Home,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigation = [
  { name: 'ホーム', href: '/', icon: Home, shortLabel: 'ホーム' },
  { name: 'ダッシュボード', href: '/admin', icon: LayoutDashboard, shortLabel: 'ダッシュ' },
  { name: '記事管理', href: '/admin/articles', icon: FileText, shortLabel: '記事' },
  { name: 'ユーザー管理', href: '/admin/users', icon: Users, shortLabel: 'ユーザー' },
  { name: '分析', href: '/admin/analytics', icon: BarChart, shortLabel: '分析' },
  { name: '通知設定', href: '/admin/notifications', icon: Bell, shortLabel: '通知' },
  { name: 'システム設定', href: '/admin/settings', icon: Settings, shortLabel: '設定' },
];

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* オーバーレイ（モバイル時のみ表示） */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      {/* サイドバー */}
      <aside
        className={cn(
          'fixed left-0 top-14 z-30 h-[calc(100vh-3.5rem)] border-r bg-background transition-all duration-300',
          isOpen ? 'w-64' : 'w-[70px]',
          'md:translate-x-0', // デスクトップでは常に表示
          'transform',
          !isOpen && 'md:w-[70px]', // 非展開時はアイコンのみ表示
          'max-md:-translate-x-full', // モバイルでは非表示
          isOpen && 'max-md:translate-x-0' // モバイルで展開時は表示
        )}
      >
        <ScrollArea className="h-full">
          <nav className="flex flex-col py-2">
            {navigation.map((item) => {
              const isActive = item.href === '/'
                ? pathname === item.href
                : pathname?.startsWith(item.href);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'group flex items-center rounded-lg transition-colors hover:bg-accent',
                    isActive && 'bg-accent',
                    isOpen
                      ? 'h-[48px] gap-4 px-3 mx-3'
                      : 'h-[48px] flex-col justify-center items-center mx-[11px]'
                  )}
                >
                  <item.icon className={cn(
                    'shrink-0',
                    isOpen ? 'h-5 w-5' : 'h-5 w-5'
                  )} />
                  {isOpen ? (
                    <span className="text-sm font-medium">
                      {item.name}
                    </span>
                  ) : (
                    <span className="text-[10px] text-center whitespace-nowrap">
                      {item.shortLabel}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </ScrollArea>
      </aside>
    </>
  );
} 