'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Filter, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export type FilterOptions = {
  dateRange: 'all' | 'today' | 'week' | 'month' | 'year';
  minViews?: number;
  minLikes?: number;
  sortBy: 'relevance' | 'date' | 'views' | 'likes';
};

type SearchFiltersProps = {
  onFilterChange: (filters: Partial<FilterOptions>) => void;
  className?: string;
  totalResults?: number;
};

const defaultFilters: FilterOptions = {
  dateRange: 'all',
  sortBy: 'relevance',
};

export default function SearchFilters({ onFilterChange, className, totalResults }: SearchFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<FilterOptions>(() => {
    // URLパラメータから初期値を取得
    const dateRange = (searchParams.get('dateRange') as FilterOptions['dateRange']) || defaultFilters.dateRange;
    const minViews = searchParams.get('minViews') ? parseInt(searchParams.get('minViews')!) : undefined;
    const minLikes = searchParams.get('minLikes') ? parseInt(searchParams.get('minLikes')!) : undefined;
    const sortBy = (searchParams.get('sortBy') as FilterOptions['sortBy']) || defaultFilters.sortBy;

    return {
      dateRange,
      minViews,
      minLikes,
      sortBy,
    };
  });

  // フィルター変更時にURLを更新
  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);

    // URLパラメータを更新
    const params = new URLSearchParams(searchParams.toString());
    if (value === undefined || value === defaultFilters[key]) {
      params.delete(key);
    } else {
      params.set(key, value.toString());
    }
    router.push(`?${params.toString()}`);
  };

  // フィルターをリセット
  const handleReset = () => {
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
    router.push(window.location.pathname);
  };

  // フィルター状態をローカルストレージに保存
  useEffect(() => {
    localStorage.setItem('articleFilters', JSON.stringify(filters));
  }, [filters]);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className={className}>
          <Filter className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>検索フィルター</SheetTitle>
          <SheetDescription>
            記事の検索結果をフィルタリングします
            {totalResults !== undefined && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-sm font-medium"
              >
                検索結果: {totalResults.toLocaleString()}件
              </motion.p>
            )}
          </SheetDescription>
        </SheetHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>期間</Label>
            <Select
              value={filters.dateRange}
              onValueChange={(value: string) => handleFilterChange('dateRange', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="期間を選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                <SelectItem value="today">24時間以内</SelectItem>
                <SelectItem value="week">1週間以内</SelectItem>
                <SelectItem value="month">1ヶ月以内</SelectItem>
                <SelectItem value="year">1年以内</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>最小閲覧数</Label>
            <Input
              type="number"
              min="0"
              value={filters.minViews || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange('minViews', e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="例: 100"
            />
          </div>

          <div className="space-y-2">
            <Label>最小いいね数</Label>
            <Input
              type="number"
              min="0"
              value={filters.minLikes || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange('minLikes', e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="例: 10"
            />
          </div>

          <div className="space-y-2">
            <Label>並び替え</Label>
            <Select
              value={filters.sortBy}
              onValueChange={(value: FilterOptions['sortBy']) => handleFilterChange('sortBy', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="並び替え方法を選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">関連度順</SelectItem>
                <SelectItem value="date">新着順</SelectItem>
                <SelectItem value="views">閲覧数順</SelectItem>
                <SelectItem value="likes">いいね数順</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <SheetFooter>
          <Button
            variant="outline"
            onClick={handleReset}
            className="w-full sm:w-auto"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            リセット
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
} 