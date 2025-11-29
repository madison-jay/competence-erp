import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request) {
  // === FORCE HTTPS ON HEROKU (RELIABLE CHECK) ===
  const host = request.headers.get('host') || '';
  const proto = request.headers.get('x-forwarded-proto');
  const isHttp = (!proto || proto === 'http') || host.includes(':80');

  if (isHttp && process.env.NODE_ENV === 'production') {
    const httpsUrl = new URL(request.url);
    httpsUrl.protocol = 'https:';
    // Remove :80 if present
    httpsUrl.port = '';
    return NextResponse.redirect(httpsUrl.toString(), 301);
  }

  // === SUPABASE AUTH LOGIC (UNCHANGED) ===
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  await supabase.auth.getSession();
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|auth).*)',
  ],
};