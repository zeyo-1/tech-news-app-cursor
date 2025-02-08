'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { ThemeProvider } from 'next-themes';
import { cn } from '@/lib/utils';

interface RootLayoutClientProps {
  children: React.ReactNode;
}

export function RootLayoutClient({ children }: RootLayoutClientProps) {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  const handleMenuToggle = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <div className="relative min-h-screen">
        <Header onMenuClick={handleMenuToggle} />
        <Sidebar
          isExpanded={isSidebarExpanded}
          onToggle={handleMenuToggle}
        />
        <main className={cn(
          'pt-14 transition-all duration-300',
          isSidebarExpanded ? 'md:pl-64' : 'md:pl-[70px]'
        )}>
          <div className="container py-8">
            {children}
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
} 