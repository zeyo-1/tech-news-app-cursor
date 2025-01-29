import { useEffect } from 'react';
import type { AppProps } from 'next/app';
import { BackgroundService } from '../services/BackgroundService';
import '@/app/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // バックグラウンドジョブの開始
    BackgroundService.startBackgroundJobs();

    // クリーンアップ
    return () => {
      BackgroundService.stopBackgroundJobs();
    };
  }, []);

  return <Component {...pageProps} />;
} 