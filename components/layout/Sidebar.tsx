'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Menu,
  Home,
  Star,
  User,
  History,
  Clock,
  ThumbsUp,
  Settings,
  HelpCircle,
  MessageSquare
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SidebarProps {
  isExpanded: boolean;
  onToggle: () => void;
}

export function Sidebar({ isExpanded, onToggle }: SidebarProps) {
  const pathname = usePathname()

  const mainNavItems = [
    { name: 'ホーム', href: '/', icon: Home },
    { name: 'お気に入り', href: '/favorites', icon: Star },
    { name: 'マイページ', href: '/profile', icon: User },
  ]

  const secondaryNavItems = [
    { name: '履歴', href: '/history', icon: History },
    { name: '後で見る', href: '/watch-later', icon: Clock },
    { name: '高評価', href: '/liked', icon: ThumbsUp },
  ]

  const footerNavItems = [
    { name: '設定', href: '/settings', icon: Settings },
    { name: 'ヘルプ', href: '/help', icon: HelpCircle },
    { name: '意見箱', href: '/feedback', icon: MessageSquare },
  ]

  return (
    <div
      className={cn(
        'fixed left-0 top-14 z-40 h-[calc(100vh-3.5rem)] w-[70px] border-r bg-background transition-all duration-300 md:block',
        isExpanded && 'w-64'
      )}
    >
      <div className="flex h-full flex-col gap-2 p-3">
        <Button
          variant="ghost"
          size="icon"
          className="mb-4"
          onClick={onToggle}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">サイドバーを開く</span>
        </Button>

        <nav className="flex flex-col gap-2">
          {mainNavItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group relative flex items-center gap-3 rounded-lg p-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
                  !isExpanded && 'flex-col gap-1'
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className={cn(
                  'truncate text-xs',
                  isExpanded && 'text-sm'
                )}>
                  {item.name}
                </span>
                {!isExpanded && (
                  <div className="absolute left-full top-1/2 z-50 ml-1 -translate-y-1/2 rounded-md bg-accent px-2 py-1 text-xs opacity-0 transition-opacity group-hover:opacity-100">
                    {item.name}
                  </div>
                )}
              </Link>
            )
          })}
        </nav>

        {isExpanded && (
          <>
            <div className="my-2 border-t" />
            <nav className="flex flex-col gap-2">
              {secondaryNavItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center gap-3 rounded-lg p-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </Link>
                )
              })}
            </nav>

            <div className="my-2 border-t" />
            <nav className="flex flex-col gap-2">
              {footerNavItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center gap-3 rounded-lg p-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </Link>
                )
              })}
            </nav>
          </>
        )}
      </div>
    </div>
  )
} 