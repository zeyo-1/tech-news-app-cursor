'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { Menu, Search, Sun, Moon, Bell, User, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useTheme } from 'next-themes'
import { useSupabase } from '@/providers/SupabaseProvider'
import { useRouter } from 'next/navigation'
import { useSearchHistory } from '@/hooks/useSearchHistory'
import { SearchSuggestions } from '@/components/SearchSuggestions'
import { useClickAway } from '@/hooks/useClickAway'
import { cn } from '@/lib/utils'

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const { theme, setTheme } = useTheme()
  const { user, loading } = useSupabase()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isSearchMode, setIsSearchMode] = useState(false)
  const { searchHistory, addToHistory } = useSearchHistory()
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

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
    setIsSearchMode(false)
    router.push(`/search?q=${encodeURIComponent(query)}`)
  }

  const handleSearchIconClick = () => {
    setIsSearchMode(true)
    setTimeout(() => {
      inputRef.current?.focus()
    }, 100)
  }

  return (
    <header className="fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14">
        <div className="flex w-full">
          {isSearchMode ? (
            // 検索モード時のレイアウト
            <div className="flex w-full items-center gap-2 px-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSearchMode(false)}
                className="shrink-0"
              >
                <ArrowLeft className="h-6 w-6" />
                <span className="sr-only">検索を閉じる</span>
              </Button>
              <div className="flex-1" ref={searchRef}>
                <div className="relative">
                  <Input
                    ref={inputRef}
                    type="search"
                    placeholder="記事を検索..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setShowSuggestions(true)}
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement> & { isComposing: boolean }) => {
                      if (e.isComposing || e.keyCode === 229) return
                      if (e.key === 'Enter') handleSearch(searchQuery)
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
            </div>
          ) : (
            // 通常モード時のレイアウト
            <>
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
                  <span className="text-xl font-bold">
                    <span className="hidden md:inline">Buzz Tech Now</span>
                    <span className="md:hidden">BTN</span>
                  </span>
                </Link>

                <div className="flex flex-1 items-center gap-4 min-w-0 ml-8">
                  <div className={cn(
                    "w-full max-w-[580px] mx-auto",
                    "hidden sm:block", // sm以上で表示
                  )} ref={searchRef}>
                    <div className="relative">
                      <Input
                        ref={inputRef}
                        type="search"
                        placeholder="記事を検索..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setShowSuggestions(true)}
                        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement> & { isComposing: boolean }) => {
                          if (e.isComposing || e.keyCode === 229) return
                          if (e.key === 'Enter') handleSearch(searchQuery)
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

                  {/* モバイル用検索アイコン */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleSearchIconClick}
                    className="sm:hidden"
                  >
                    <Search className="h-5 w-5" />
                    <span className="sr-only">検索</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                  >
                    <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">テーマを切り替え</span>
                  </Button>

                  {!loading && (
                    <>
                      {user ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="shrink-0"
                        >
                          <User className="h-4 w-4" />
                          <span className="sr-only">ユーザーメニュー</span>
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          asChild
                          className="shrink-0"
                        >
                          <Link href="/auth">
                            ログイン
                          </Link>
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
} 