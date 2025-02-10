import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // キャッシュの状態をチェック
    // 実際のキャッシュシステムに応じて実装を変更する必要があります
    const cacheStatus = true;

    if (cacheStatus) {
      return NextResponse.json({ status: 'ok' });
    } else {
      throw new Error('Cache check failed');
    }
  } catch (error) {
    console.error('Cache health check failed:', error);
    return NextResponse.json({ status: 'error' }, { status: 500 });
  }
} 