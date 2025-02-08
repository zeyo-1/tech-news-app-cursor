'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { Menu, Search, Sun, Moon, Bell, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useTheme } from 'next-themes'
import { useSupabase } from '@/providers/SupabaseProvider'
import { useRouter } from 'next/navigation'
import { useSearchHistory } from '@/hooks/useSearchHistory'
import { SearchSuggestions } from '@/components/SearchSuggestions'
import { useClickAway } from '@/hooks/useClickAway'

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const { theme, setTheme } = useTheme()
  const { user } = useSupabase()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const { searchHistory, addToHistory } = useSearchHistory()
  const searchRef = useRef<HTMLDivElement>(null)

  // トレンドキーワードの例（実際にはAPIから取得するなど）
  const trendingSearches = [
    'ChatGPT-5',
    'Next.js 14',
    'React Server Components',
    'AI開発',
    'TypeScript 5.4'
  ]

  useClickAway(searchRef, () => {
    setShowSuggestions(false)
  })

  const handleSearch = (query: string) => {
    if (!query.trim()) return
    addToHistory(query)
    setSearchQuery(query)
    setShowSuggestions(false)
    router.push(`/search?q=${encodeURIComponent(query)}`)
  }

  return (
    <header className="fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14">
        <div className="flex w-full">
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

          <div className="flex-1 flex items-center px-4 min-w-0 max-w-[1720px] mx-auto">
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <span className="text-xl font-bold">Buzz Tech Now</span>
            </Link>

            <div className="flex flex-1 items-center gap-4 min-w-0 ml-8">
              <div className="w-full max-w-[580px] mx-auto" ref={searchRef}>
                <div className="relative">
                  <Input
                    type="search"
                    placeholder="記事を検索..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setShowSuggestions(true)}
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement> & { isComposing: boolean }) => {
                      // IME入力中（変換中）のEnterキーは無視
                      if (e.isComposing || e.keyCode === 229) {
                        return
                      }
                      if (e.key === 'Enter') {
                        handleSearch(searchQuery)
                      }
                    }}
                    className="w-full bg-muted pr-12 focus-visible:ring-1"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    variant="ghost"
                    className="absolute right-1 top-1 h-7 w-8 hover:bg-accent/50"
                    onClick={() => handleSearch(searchQuery)}
                  >
                    <Search className="h-4 w-4" />
                    <span className="sr-only">検索</span>
                  </Button>
                  <SearchSuggestions
                    query={searchQuery}
                    recentSearches={searchHistory}
                    trendingSearches={trendingSearches}
                    onSelect={handleSearch}
                    visible={showSuggestions}
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
      </div>
    </header>
  )
} 