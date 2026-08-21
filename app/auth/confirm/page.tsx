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
        .select('plan, has_chosen_plan')
        .eq('id', session.user.id)
        .single();

      const isSubscribed = profile?.plan === 'basic' || profile?.plan === 'premium';
      const hasChosenPlan = profile?.has_chosen_plan;

      if (isSubscribed || hasChosenPlan) {
        window.location.href = '/dashboard';
      } else {
        window.location.href = '/pricing?new=true';
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
