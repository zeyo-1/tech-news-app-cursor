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
  ScrollText,
  PlaySquare,
  AlertCircle,
  Activity,
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
  {
    name: 'ログ管理',
    href: '/admin/logs',
    icon: ScrollText,
    shortLabel: 'ログ',
    subItems: [
      { name: 'アクティビティログ', href: '/admin/logs', icon: Activity },
      { name: 'エラーログ', href: '/admin/logs/error', icon: AlertCircle },
    ]
  },
  { name: 'バッチ管理', href: '/admin/batch', icon: PlaySquare, shortLabel: 'バッチ' },
];

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* オーバーレイ（モバイル時のみ表示） */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 md:hidden"
          onClick={onClose}
        />
      )}

      {/* サイドバー */}
      <aside
        className={cn(
          'fixed left-0 top-14 z-50 h-[calc(100vh-3.5rem)] w-[70px] border-r bg-background transition-all duration-300',
          isOpen && 'w-64',
          'md:z-30 md:translate-x-0', // デスクトップでは常に表示
          'max-md:z-50', // モバイルでは最前面に表示
          !isOpen && 'max-md:-translate-x-full', // モバイルかつ非表示時は左に隠す
        )}
      >
        <ScrollArea className="h-full">
          <nav className="flex flex-col py-2">
            {navigation.map((item) => {
              const isActive = item.href === '/'
                ? pathname === item.href
                : pathname?.startsWith(item.href);

              return (
                <div key={item.name}>
                  <Link
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
                  {isOpen && item.subItems && (
                    <div className="ml-12 mt-1 space-y-1">
                      {item.subItems.map((subItem) => (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          className={cn(
                            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent',
                            pathname === subItem.href && 'bg-accent'
                          )}
                        >
                          <subItem.icon className="h-4 w-4" />
                          <span>{subItem.name}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </ScrollArea>
      </aside>
    </>
  );
} 