import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // セッションの確認
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // 管理者権限の確認
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', session.user.id)
      .single();

    if (!profile?.is_admin) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const body = await request.json();
    const { action, articleIds } = body;

    if (!Array.isArray(articleIds) || articleIds.length === 0) {
      return NextResponse.json(
        { error: 'Invalid article IDs' },
        { status: 400 }
      );
    }

    let updateData = {};
    switch (action) {
      case 'publish':
        updateData = { status: 'published' };
        break;
      case 'unpublish':
        updateData = { status: 'draft' };
        break;
      case 'delete':
        updateData = { deleted_at: new Date().toISOString() };
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    // 記事の一括更新
    const { error } = await supabase
      .from('articles')
      .update(updateData)
      .in('id', articleIds);

    if (error) throw error;

    // アクティビティログの記録
    await supabase.from('activity_logs').insert({
      action: `bulk_${action}`,
      details: `${articleIds.length}件の記事を${
        action === 'publish' ? '公開' :
        action === 'unpublish' ? '非公開' : '削除'
      }`,
      user_id: session.user.id,
      metadata: {
        article_ids: articleIds,
        action,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error performing bulk action:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 