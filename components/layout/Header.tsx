'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, Search, Bell, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSupabase } from '@/providers/SupabaseProvider'

export function Header() {
  const { user } = useSupabase()
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 border-b bg-background">
      <div className="flex h-full items-center justify-between gap-4 px-4">
        {/* 左側: ロゴ */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          <Link href="/" className="text-lg font-bold">
            Buzz Tech Now
          </Link>
        </div>

        {/* 中央: 検索バー */}
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="記事を検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10"
            />
          </div>
        </div>

        {/* 右側: アクション */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/auth/login">ログイン</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/signup">無料会員登録</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
} 