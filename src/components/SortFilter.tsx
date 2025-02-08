'use client';

import { Button } from "@/components/ui/button";
import { Clock, TrendingUp, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export type SortOption = 'latest' | 'popular' | 'trending';

const SORT_OPTIONS = [
  { id: 'latest', name: '最新順', icon: Clock },
  { id: 'popular', name: '人気順', icon: Star },
  { id: 'trending', name: '注目順', icon: TrendingUp }
] as const;

interface SortFilterProps {
  value: SortOption;
  onValueChange: (value: SortOption) => void;
  className?: string;
}

export function SortFilter({ value, onValueChange, className }: SortFilterProps) {
  return (
    <div className={cn('flex gap-2', className)}>
      {SORT_OPTIONS.map((option) => {
        const Icon = option.icon;
        return (
          <Button
            key={option.id}
            variant={value === option.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => onValueChange(option.id as SortOption)}
            className="flex items-center gap-2"
          >
            <Icon className="h-4 w-4" />
            {option.name}
          </Button>
        );
      })}
    </div>
  );
} 