import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 認証が不要なパブリックルート
const publicRoutes = ['/auth/login', '/auth/signup', '/auth/callback'];

// 認証済みユーザーがアクセスできないルート（認証ページなど）
const authRoutes = ['/auth/login', '/auth/signup'];

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });

  try {
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
        return NextResponse.redirect(new URL('/auth/login', request.url));
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', session.user.id)
        .single();

      if (!profile?.is_admin) {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }

    // プロフィールページへのアクセスをチェック
    if (pathname.startsWith('/profile')) {
      if (!session) {
        const redirectUrl = new URL('/auth/login', request.url);
        redirectUrl.searchParams.set('redirectTo', pathname);
        return NextResponse.redirect(redirectUrl);
      }
    }

    // 保護されたルートへのアクセスをチェック
    if (!session && !publicRoutes.includes(pathname)) {
      const redirectUrl = new URL('/auth/login', request.url);
      redirectUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(redirectUrl);
    }

    return res;
  } catch (error) {
    console.error('Middleware error:', error);
    return res;
  }
}

// ミドルウェアを適用するパスを指定
export const config = {
  matcher: [
    '/profile/:path*',
    '/admin/:path*',
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
