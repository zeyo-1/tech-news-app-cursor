import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim() || '';
    const limit = parseInt(searchParams.get('limit') || '5');

    if (!query) {
      return NextResponse.json({ suggestions: [] });
    }

    const supabase = createRouteHandlerClient({ cookies });

    // タイトルベースの候補を取得
    const { data: titleSuggestions, error: titleError } = await supabase
      .from('articles')
      .select('title, category')
      .eq('status', 'published')
      .is('deleted_at', null)
      .ilike('title', `%${query}%`)
      .limit(limit);

    if (titleError) throw titleError;

    // カテゴリーベースの候補を取得
    const { data: categorySuggestions, error: categoryError } = await supabase
      .from('articles')
      .select('category')
      .eq('status', 'published')
      .is('deleted_at', null)
      .ilike('category', `%${query}%`)
      .not('category', 'is', null)
      .limit(limit);

    if (categoryError) throw categoryError;

    // カテゴリーの重複を除去
    const uniqueCategories = Array.from(
      new Set(categorySuggestions.map(item => item.category))
    );

    return NextResponse.json({
      suggestions: {
        titles: titleSuggestions,
        categories: uniqueCategories
      }
    });
  } catch (error) {
    console.error('Suggestions fetch error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 