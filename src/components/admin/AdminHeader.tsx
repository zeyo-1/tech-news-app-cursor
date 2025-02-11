'use client';

import { Button } from '@/components/ui/button';
import { Menu, ExternalLink, User, LogOut, Settings } from 'lucide-react';
import Link from 'next/link';
import { ModeToggle } from '@/components/mode-toggle';
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
import { useRouter } from 'next/navigation';

interface AdminHeaderProps {
  onMenuClick: () => void;
  isSidebarOpen: boolean;
}

export default function AdminHeader({ onMenuClick, isSidebarOpen }: AdminHeaderProps) {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/auth');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <TooltipProvider delayDuration={50}>
      <header className="fixed top-0 left-0 right-0 z-50 h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-full items-center gap-4">
          <div className="shrink-0 w-[70px] h-full flex items-center justify-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              className="h-[48px] w-[48px] flex items-center justify-center rounded-lg hover:bg-accent"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">サイドバーを{isSidebarOpen ? '閉じる' : '開く'}</span>
            </Button>
          </div>

          <Link href="/admin" className="flex items-center gap-2 shrink-0">
            <span className="text-xl font-bold">
              <span className="hidden md:inline">Buzz Tech Now（管理画面）</span>
              <span className="md:hidden">BTN（Admin）</span>
            </span>
          </Link>

          <div className="flex flex-1 items-center justify-end gap-4 pr-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  className="h-8 w-8 hidden sm:inline-flex"
                >
                  <Link href="/" target="_blank">
                    <ExternalLink className="h-4 w-4" />
                    <span className="sr-only">サイトを表示</span>
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>サイトを表示</p>
              </TooltipContent>
            </Tooltip>

            <ModeToggle />

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
                  <Link href="/admin/settings" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>管理者設定</span>
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
          </div>
        </div>
      </header>
    </TooltipProvider>
  );
} 