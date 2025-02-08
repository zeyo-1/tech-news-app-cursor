'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, Search, Sun, Moon, Bell, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useTheme } from 'next-themes'
import { useSupabase } from '@/providers/SupabaseProvider'

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const { theme, setTheme } = useTheme()
  const { user } = useSupabase()
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <header className="fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 max-w-screen-2xl mx-auto">
        <div className="shrink-0 w-[70px] h-full">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="h-full w-full flex items-center justify-center rounded-none hover:bg-accent"
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">メニューを開く</span>
          </Button>
        </div>

        <div className="flex-1 flex items-center px-4 min-w-0">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="text-xl font-bold">Buzz Tech</span>
          </Link>

          <div className="flex flex-1 items-center justify-end gap-4 min-w-0">
            <div className="w-full max-w-[600px]">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="記事を検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-muted pl-8 focus-visible:ring-1"
                />
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">テーマを切り替え</span>
            </Button>

            {user ? (
              <>
                <Button variant="ghost" size="icon">
                  <Bell className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <User className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" asChild>
                  <Link href="/auth/login">ログイン</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/signup">無料会員登録</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
} 