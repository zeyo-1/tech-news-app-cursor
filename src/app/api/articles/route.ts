import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { SortOption } from '@/components/SortFilter';
import type { FilterOptions } from '@/components/SearchFilters';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    const cookieStore = cookies();
    const authToken = cookieStore.get('sb-rjdrkcsfbppaiepfkkxm-auth-token')?.value;
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    let dbQuery = supabase
      .from('articles')
      .select('*, author:profiles(name, avatar_url)', { count: 'exact' });

    if (query) {
      dbQuery = dbQuery.or(`title.ilike.%${query}%,content.ilike.%${query}%,summary.ilike.%${query}%`);
    }

    if (category) {
      dbQuery = dbQuery.eq('category', category);
    }

    if (featured === 'true') {
      dbQuery = dbQuery.eq('featured', true);
    }

    dbQuery = dbQuery.order(sortBy, { ascending: sortOrder === 'asc' });
    dbQuery = dbQuery.range(offset, offset + limit - 1);

    const { data, error, count } = await dbQuery;

    if (error) {
      console.error('Database query error:', error);
      throw error;
    }

    return NextResponse.json({
      articles: data,
      total: count,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 