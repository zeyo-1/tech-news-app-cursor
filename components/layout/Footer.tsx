'use client'

import Link from 'next/link'
import { Github, Twitter } from 'lucide-react'

const navigation = {
  main: [
    { name: 'ホーム', href: '/' },
    { name: '人気記事', href: '/popular' },
    { name: 'カテゴリー', href: '/categories' },
    { name: 'お気に入り', href: '/favorites' },
  ],
  social: [
    {
      name: 'GitHub',
      href: 'https://github.com/yourusername/tech-news-app',
      icon: Github,
    },
    {
      name: 'Twitter',
      href: 'https://twitter.com/yourusername',
      icon: Twitter,
    },
  ],
}

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-8 md:py-12">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8">
            <Link href="/" className="text-lg font-bold">
              Buzz Tech Now
            </Link>
            <p className="text-sm text-muted-foreground">
              最新のテクノロジーニュースをAIが要約してお届けします。
              常に最新の技術トレンドをキャッチアップし、
              効率的な情報収集をサポートします。
            </p>
          </div>
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div>
              <h3 className="text-sm font-semibold">ナビゲーション</h3>
              <ul role="list" className="mt-4 space-y-4">
                {navigation.main.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="md:grid md:grid-cols-1 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold">ソーシャル</h3>
                <ul role="list" className="mt-4 space-y-4">
                  {navigation.social.map((item) => {
                    const Icon = item.icon
                    return (
                      <li key={item.name}>
                        <a
                          href={item.href}
                          className="flex items-center text-sm text-muted-foreground hover:text-foreground"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Icon className="mr-2 h-4 w-4" />
                          <span>{item.name}</span>
                        </a>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Buzz Tech Now. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
} 