'use client';
import { useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export default function AuthConfirm() {
  useEffect(() => {
    const supabase = createClient();
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = '/login';
        return;
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('plan, trial_ends_at, created_at')
        .eq('id', session.user.id)
        .single();
      if (!profile) {
        window.location.href = '/pricing?new=true';
        return;
      }
      const isSubscribed = profile.plan === 'basic' || profile.plan === 'premium';
      const createdAt = new Date(profile.created_at);
      const isNewUser = (Date.now() - createdAt.getTime()) < 60000;
      if (isSubscribed) {
        window.location.href = '/dashboard';
      } else if (isNewUser) {
        window.location.href = '/pricing?new=true';
      } else {
        window.location.href = '/dashboard';
      }
    };
    setTimeout(check, 500);
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <Loader2 size={32} color="var(--brand)" style={{ animation: 'spin 1s linear infinite' }} />
      <p style={{ color: 'var(--muted)', fontSize: 15 }}>Setting up your account...</p>
    </div>
  );
}
