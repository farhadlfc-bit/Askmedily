import { NextResponse, type NextRequest } from 'next/server';

const protectedRoutes = ['/dashboard', '/drug', '/condition', '/pricing', '/settings'];
const subscriptionRequiredRoutes = ['/drug', '/condition'];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isProtected = protectedRoutes.some(route => path.startsWith(route));

  if (!isProtected) return NextResponse.next();

  // Check auth cookie
  const sessionCookie = request.cookies.get('sb-hjllgaodcutlaqqievtn-auth-token');
  if (!sessionCookie?.value) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', path);
    return NextResponse.redirect(loginUrl);
  }

  // For drug and condition pages, check subscription via API
  const needsSubscription = subscriptionRequiredRoutes.some(route => path.startsWith(route));
  if (needsSubscription) {
    try {
      // Parse the session cookie to get user ID
      const cookieValue = sessionCookie.value;
      let userId = null;

      if (cookieValue.startsWith('base64-')) {
        const decoded = atob(cookieValue.replace('base64-', ''));
        const parsed = JSON.parse(decoded);
        userId = parsed?.user?.id;
      }

      if (userId) {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        const profileRes = await fetch(
          `${supabaseUrl}/rest/v1/profiles?id=eq.${userId}&select=plan,trial_ends_at`,
          {
            headers: {
              'apikey': supabaseKey!,
              'Authorization': `Bearer ${supabaseKey}`
            }
          }
        );

        const profiles = await profileRes.json();
        const profile = profiles?.[0];

        if (profile) {
          const isSubscribed = profile.plan === 'basic' || profile.plan === 'premium';
          const trialActive = profile.trial_ends_at && new Date() < new Date(profile.trial_ends_at);

          if (!isSubscribed && !trialActive) {
            return NextResponse.redirect(new URL('/pricing?expired=true', request.url));
          }
        }
      }
    } catch {
      // If check fails, allow through — client side will catch it
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
