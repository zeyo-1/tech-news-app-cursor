import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 認証が不要なパブリックルート
const publicRoutes = ['/', '/auth', '/auth/callback', '/api/test-rss', '/api/cron'];

// 認証済みユーザーがアクセスできないルート（認証ページなど）
const authRoutes = ['/auth'];

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });

  try {
    // セッションの取得
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const pathname = request.nextUrl.pathname;

    // 認証済みユーザーが認証ページにアクセスしようとした場合、ホームにリダイレクト
    if (session && authRoutes.includes(pathname)) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // 管理者ページへのアクセスをチェック
    if (pathname.startsWith('/admin')) {
      if (!session) {
        console.log('No session found, redirecting to auth');
        return NextResponse.redirect(new URL('/auth', request.url));
      }

      // プロフィールの取得
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return NextResponse.redirect(new URL('/', request.url));
      }

      if (!profile?.is_admin) {
        console.log('User is not admin, redirecting to home');
        return NextResponse.redirect(new URL('/', request.url));
      }

      console.log('Admin access granted');
    }

    // プロフィールページへのアクセスをチェック
    if (pathname.startsWith('/profile')) {
      if (!session) {
        const redirectUrl = new URL('/auth', request.url);
        redirectUrl.searchParams.set('redirectTo', pathname);
        return NextResponse.redirect(redirectUrl);
      }
    }

    return res;
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.redirect(new URL('/', request.url));
  }
}

// ミドルウェアを適用するパスを指定
export const config = {
  matcher: [
    '/profile/:path*',
    '/admin/:path*',
    '/auth/:path*',
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api/cron (Cron Job endpoints)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/cron|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
