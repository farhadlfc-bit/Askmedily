'use client';
import { useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export default function AuthConfirm() {
  useEffect(() => {
    const supabase = createClient();
    
    // Listen for auth state change — fires when OAuth completes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        subscription.unsubscribe();
        window.location.href = '/dashboard';
      }
    });

    // Also check immediately in case session already exists
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        subscription.unsubscribe();
        window.location.href = '/dashboard';
      }
    });

    // Timeout fallback
    const timeout = setTimeout(() => {
      subscription.unsubscribe();
      window.location.href = '/login';
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <Loader2 size={32} color="var(--brand)" style={{ animation: 'spin 1s linear infinite' }} />
      <p style={{ color: 'var(--muted)', fontSize: 15 }}>Signing you in...</p>
    </div>
  );
}
