import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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
    const { title, summary, content, category, status } = body;

    // 記事の更新
    const { error } = await supabase
      .from('articles')
      .update({
        title,
        summary,
        content,
        category,
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id);

    if (error) throw error;

    // アクティビティログの記録
    await supabase.from('activity_logs').insert({
      action: 'article_update',
      details: `記事「${title}」を更新`,
      user_id: session.user.id,
      metadata: {
        article_id: params.id,
        changes: {
          title: true,
          summary: true,
          content: true,
          category: true,
          status: true,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating article:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // 記事の削除（ソフトデリート）
    const { error } = await supabase
      .from('articles')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', params.id);

    if (error) throw error;

    // アクティビティログの記録
    await supabase.from('activity_logs').insert({
      action: 'article_delete',
      details: `記事（ID: ${params.id}）を削除`,
      user_id: session.user.id,
      metadata: {
        article_id: params.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting article:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 