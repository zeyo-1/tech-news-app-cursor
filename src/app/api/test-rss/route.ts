import { NextResponse } from 'next/server';
import { fetchArticlesFromRSS } from '@/services/scraper';

export const maxDuration = 300; // 5分のタイムアウト

export async function GET() {
  try {
    console.log('Starting RSS feed fetch test...');
    
    // 環境変数のチェック
    const envCheck = {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasDeepseekKey: !!process.env.DEEPSEEK_API_KEY,
    };
    console.log('Environment variables:', envCheck);

    const articles = await fetchArticlesFromRSS();
    
    if (!articles || articles.length === 0) {
      console.log('No articles fetched');
      return new NextResponse(JSON.stringify({ 
        success: false, 
        error: 'No articles fetched',
        envCheck
      }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'no-store'
        }
      });
    }

    console.log(`Successfully fetched ${articles.length} articles`);

    return new NextResponse(JSON.stringify({ 
      success: true, 
      articles,
      envCheck
    }, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store'
      }
    });
  } catch (error) {
    console.error('Error in test-rss route:', error);
    return new NextResponse(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      envCheck: {
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        hasDeepseekKey: !!process.env.DEEPSEEK_API_KEY,
      }
    }, null, 2), { 
      status: 500,
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    });
  }
} 