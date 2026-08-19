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

      // Check if user has a plan already
      const { data: profile } = await supabase
        .from('profiles')
        .select('plan, trial_ends_at, created_at')
        .eq('id', session.user.id)
        .single();

      if (!profile) {
        // No profile yet — send to pricing
        window.location.href = '/pricing';
        return;
      }

      const isSubscribed = profile.plan === 'basic' || profile.plan === 'premium';
      const trialActive = profile.trial_ends_at && new Date() < new Date(profile.trial_ends_at);
      const isNewUser = !isSubscribed && !trialActive;

      if (isNewUser) {
        // New user — send to pricing
        window.location.href = '/pricing';
      } else {
        // Existing subscriber — send to dashboard
        window.location.href = '/dashboard';
      }
    };

    // Small delay to ensure session is established
    setTimeout(check, 500);
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <Loader2 size={32} color="var(--brand)" style={{ animation: 'spin 1s linear infinite' }} />
      <p style={{ color: 'var(--muted)', fontSize: 15 }}>Setting up your account...</p>
    </div>
  );
}
