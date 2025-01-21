import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/';

  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    try {
      await supabase.auth.exchangeCodeForSession(code);
      return NextResponse.redirect(new URL(next, requestUrl.origin));
    } catch (error) {
      console.error('Error in auth callback:', error);
      return NextResponse.redirect(
        new URL(`/auth/login?error=${encodeURIComponent('認証エラーが発生しました')}`, requestUrl.origin)
      );
    }
  }

  return NextResponse.redirect(
    new URL('/auth/login?error=code_not_found', requestUrl.origin)
  );
}
