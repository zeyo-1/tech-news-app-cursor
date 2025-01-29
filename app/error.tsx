'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold">エラーが発生しました</h2>
        <p className="text-muted-foreground">
          記事の取得中にエラーが発生しました。時間をおいて再度お試しください。
        </p>
      </div>
      <Button
        variant="outline"
        onClick={reset}
        className="flex items-center gap-2"
      >
        <RefreshCw className="h-4 w-4" />
        再読み込み
      </Button>
    </div>
  )
} 