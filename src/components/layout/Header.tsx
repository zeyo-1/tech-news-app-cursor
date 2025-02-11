'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Menu, Search, Sun, Moon, Bell, User, LogOut, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useTheme } from 'next-themes'
import { useSupabase } from '@/providers/SupabaseProvider'
import { useRouter } from 'next/navigation'
import { useSearchHistory } from '@/hooks/useSearchHistory'
import { SearchSuggestions } from '@/components/SearchSuggestions'
import { useClickAway } from '@/hooks/useClickAway'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const [query, setQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const { theme, setTheme } = useTheme()
  const { searchHistory, addToHistory } = useSearchHistory()
  const router = useRouter()
  const supabase = createClientComponentClient();

  // セッション状態の確認
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    };

    checkSession();

    // セッション状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/auth');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleSearch = (query: string) => {
    if (!query.trim()) return
    addToHistory(query)
    setShowSuggestions(false)
    router.push(`/search?q=${encodeURIComponent(query)}`)
  }

  const handleSearchIconClick = () => {
    if (query.trim()) {
      handleSearch(query)
    }
  }

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  useClickAway(searchRef, () => {
    setShowSuggestions(false)
  })

  return (
    <TooltipProvider delayDuration={50}>
      <header className="fixed top-0 left-0 right-0 z-50 h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-full items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="h-[48px] w-[48px] flex items-center justify-center rounded-lg hover:bg-accent"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">メニューを開く</span>
          </Button>

          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold">Buzz Tech Now</span>
          </Link>

          <div className="relative flex-1" ref={searchRef}>
            <div className="relative max-w-lg">
              <Input
                type="search"
                placeholder="検索..."
                className="pr-10"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch(query)
                  }
                }}
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={handleSearchIconClick}
              >
                <Search className="h-4 w-4" />
                <span className="sr-only">検索</span>
              </Button>
            </div>

            <SearchSuggestions
              query={query}
              recentSearches={searchHistory}
              trendingSearches={[]}
              onSelect={handleSearch}
              visible={showSuggestions}
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-8 w-8"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">テーマを切り替える</span>
            </Button>

            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                  >
                    <User className="h-4 w-4" />
                    <span className="sr-only">ユーザーメニュー</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>プロフィール</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>設定</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>ログアウト</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="ghost"
                asChild
                className="gap-2"
              >
                <Link href="/auth">
                  <User className="h-4 w-4" />
                  <span>ログイン</span>
                </Link>
              </Button>
            )}
          </div>
        </div>
      </header>
    </TooltipProvider>
  )
} 