'use client';
import { useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export default function AuthConfirm() {
  useEffect(() => {
    const check = async () => {
      const supabase = createClient();
      // Wait for session to be available
      let attempts = 0;
      const interval = setInterval(async () => {
        attempts++;
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          clearInterval(interval);
          window.location.href = '/dashboard';
        } else if (attempts > 10) {
          clearInterval(interval);
          window.location.href = '/login?error=session_failed';
        }
      }, 300);
    };
    check();
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <Loader2 size={32} color="var(--brand)" style={{ animation: 'spin 1s linear infinite' }} />
      <p style={{ color: 'var(--muted)', fontSize: 15 }}>Signing you in...</p>
    </div>
  );
}
