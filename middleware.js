import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(request) {
  // 1️⃣ HTTP → HTTPS redirect (production only)
  if (process.env.NODE_ENV === 'production') {
    const protoHeader = request.headers.get('x-forwarded-proto') || '';
    const protocols = protoHeader.split(',').map(p => p.trim());
    const isHttps = protocols.includes('https');

    if (!isHttps) {
      const url = new URL(request.url);
      url.protocol = 'https:';
      url.hostname = request.headers.get('x-forwarded-host') || request.headers.get('host');
      url.port = '';
      return NextResponse.redirect(url.href, 301);
    }
  }

  const response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  await supabase.auth.getSession();
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|auth/callback).*)',
  ],
};
