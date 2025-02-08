'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  User,
  Star,
  Clock,
  MessageSquare,
  Code,
  Cpu,
  Cloud,
  Palette,
  Briefcase,
  ChevronRight,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface SidebarProps {
  isExpanded: boolean
  onToggle: () => void
  className?: string
}

interface NavItem {
  href: string
  icon: React.ElementType
  label: string
  shortLabel?: string
  hideWhenExpanded?: boolean
}

const mainNavItems: NavItem[] = [
  { href: '/', icon: Home, label: 'ホーム', shortLabel: 'ホーム' },
  { href: '/profile', icon: User, label: 'マイページ', shortLabel: 'マイページ', hideWhenExpanded: true },
]

const myPageItems: NavItem[] = [
  { href: '/favorites', icon: Star, label: 'お気に入り' },
  { href: '/history', icon: Clock, label: '閲覧履歴' },
  { href: '/comments', icon: MessageSquare, label: 'コメント' },
]

const categoryItems: NavItem[] = [
  { href: '/categories/programming', icon: Code, label: '開発・プログラミング' },
  { href: '/categories/ai', icon: Cpu, label: 'AI・機械学習' },
  { href: '/categories/cloud', icon: Cloud, label: 'クラウド・インフラ' },
  { href: '/categories/design', icon: Palette, label: 'デザイン・UX' },
  { href: '/categories/business', icon: Briefcase, label: 'ビジネス' },
]

const footerItems: NavItem[] = [
  { href: '/settings', icon: Settings, label: '設定' },
  { href: '/feedback', icon: MessageSquare, label: 'フィードバックを送信' },
]

const legalItems = [
  { href: '/about', label: '概要' },
  { href: '/contact', label: 'お問い合わせ' },
  { href: '/terms', label: '利用規約' },
  { href: '/privacy', label: 'プライバシー' },
  { href: '/security', label: 'ポリシーとセキュリティ' },
]

export function Sidebar({ isExpanded, onToggle, className }: SidebarProps) {
  const pathname = usePathname()
  const [isMobile, setIsMobile] = useState(false)

  // レスポンシブ対応のためのウィンドウサイズ監視
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // 初期チェック
    checkMobile()

    // リサイズイベントの監視を開始
    window.addEventListener('resize', checkMobile)

    // クリーンアップ関数
    return () => {
      window.removeEventListener('resize', checkMobile)
    }
  }, [])

  const isActivePath = (href: string) => {
    return pathname === href
  }

  return (
    <>
      {/* オーバーレイ */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={onToggle}
        />
      )}

      {/* サイドバー */}
      <aside
        className={cn(
          'fixed left-0 top-14 z-30 h-[calc(100vh-3.5rem)] border-r bg-background transition-all duration-300',
          isExpanded ? 'w-64' : 'w-[70px]',
          isMobile && 'transform -translate-x-full',
          isExpanded && isMobile && 'transform translate-x-0',
          className
        )}
      >
        <div className="flex h-full flex-col gap-2 p-2">
          <nav className="space-y-1">
            {mainNavItems.map((item) => {
              const Icon = item.icon
              if (isExpanded && item.hideWhenExpanded) {
                return null
              }
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'group flex items-center rounded-lg px-1 py-2 transition-colors hover:bg-accent',
                    isActivePath(item.href) && 'bg-accent',
                    isExpanded ? 'h-[48px] gap-4 px-3' : 'h-[70px] flex-col justify-center items-center'
                  )}
                >
                  <Icon className={cn(
                    'shrink-0',
                    isExpanded ? 'h-5 w-5' : 'h-6 w-6 mb-1'
                  )} />
                  {isExpanded ? (
                    <span className="text-sm font-medium">
                      {item.label}
                    </span>
                  ) : (
                    <span className="text-[10px] text-center whitespace-nowrap">
                      {item.shortLabel}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>

          {isExpanded && (
            <>
              <div className="space-y-2">
                <Link
                  href="/profile"
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent"
                >
                  <span className="text-sm font-medium">マイページ</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
                <nav className="space-y-1">
                  {myPageItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          'flex h-10 items-center gap-4 rounded-lg px-3 text-sm transition-colors hover:bg-accent',
                          isActivePath(item.href) && 'bg-accent'
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="whitespace-nowrap">{item.label}</span>
                      </Link>
                    )
                  })}
                </nav>
              </div>

              <div className="space-y-2">
                <h3 className="px-3 text-xs font-semibold text-muted-foreground">
                  カテゴリー
                </h3>
                <nav className="space-y-1">
                  {categoryItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          'flex h-10 items-center gap-4 rounded-lg px-3 text-sm transition-colors hover:bg-accent',
                          isActivePath(item.href) && 'bg-accent'
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="whitespace-nowrap">{item.label}</span>
                      </Link>
                    )
                  })}
                </nav>
              </div>

              {/* フッター項目 */}
              <div className="space-y-1">
                {footerItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex h-10 items-center gap-4 rounded-lg px-3 text-sm transition-colors hover:bg-accent',
                        isActivePath(item.href) && 'bg-accent'
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="whitespace-nowrap">{item.label}</span>
                    </Link>
                  )
                })}
              </div>

              {/* 法的情報 */}
              <div className="mt-4 space-y-1">
                {legalItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block px-3 py-2 text-xs text-muted-foreground hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </aside>
    </>
  )
}