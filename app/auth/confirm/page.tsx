'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export default function AuthConfirm() {
  const [showDob, setShowDob] = useState(false);
  const [dob, setDob] = useState('');
  const [dobError, setDobError] = useState('');
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    const check = async () => {
      // Wait a moment for session to establish
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { window.location.href = '/login'; return; }
      
      setUserId(session.user.id);

      const { data: profile } = await supabase
        .from('profiles')
        .select('plan, has_chosen_plan, date_of_birth')
        .eq('id', session.user.id)
        .single();

      if (!profile?.date_of_birth) {
        setShowDob(true);
        return;
      }

      const isSubscribed = profile?.plan === 'basic' || profile?.plan === 'premium';
      const hasChosenPlan = profile?.has_chosen_plan;

      if (isSubscribed || hasChosenPlan) {
        window.location.href = '/dashboard';
      } else {
        window.location.href = '/pricing?new=true';
      }
    };
    check();
  }, []);

  const handleDobSubmit = async () => {
    if (!dob) { setDobError('Please enter your date of birth'); return; }

    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;

    if (age < 18) {
      setDobError('Sorry, AskMedily is only available to users aged 18 and over.');
      return;
    }

    if (!userId) { setDobError('Session error. Please try signing in again.'); return; }

    setSaving(true);
    const supabase = createClient();
    
    const { error } = await supabase
      .from('profiles')
      .update({ date_of_birth: dob })
      .eq('id', userId);

    if (error) {
      setDobError('Could not save. Please try again.');
      setSaving(false);
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('plan, has_chosen_plan')
      .eq('id', userId)
      .single();

    const isSubscribed = profile?.plan === 'basic' || profile?.plan === 'premium';
    const hasChosenPlan = profile?.has_chosen_plan;

    if (isSubscribed || hasChosenPlan) {
      window.location.href = '/dashboard';
    } else {
      window.location.href = '/pricing?new=true';
    }
    setSaving(false);
  };

  if (showDob) return (
    <main style={{ minHeight: '100vh', background: 'var(--background)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <img src="/icon.png" alt="AskMedily" style={{ height: 72, width: 72, borderRadius: 14, marginBottom: 12 }} />
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>One more thing</h1>
          <p style={{ color: 'var(--muted)', fontSize: 15, lineHeight: 1.6 }}>Please confirm your date of birth to continue. AskMedily is for users aged 18 and over.</p>
        </div>
        <div style={{ background: 'white', borderRadius: 20, padding: 28, border: '1px solid var(--border)' }}>
          <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 8 }}>Date of birth</label>
          <input type="date" value={dob} onChange={e => { setDob(e.target.value); setDobError(''); }}
            max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
            style={{ width: '100%', padding: '12px 14px', border: '1px solid var(--border)', borderRadius: 10, fontSize: 15, outline: 'none', background: 'var(--background)', boxSizing: 'border-box', marginBottom: 12 }} />
          {dobError && (
            <div style={{ padding: '10px 14px', background: '#FFF0F0', borderRadius: 8, fontSize: 13, color: 'var(--danger)', marginBottom: 12 }}>
              {dobError}
            </div>
          )}
          <button onClick={handleDobSubmit} disabled={saving} style={{
            width: '100%', padding: '14px', background: 'var(--brand)', color: 'white',
            border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            opacity: saving ? 0.7 : 1
          }}>
            {saving ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Saving...</> : 'Continue'}
          </button>
        </div>
      </div>
    </main>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <Loader2 size={32} color="var(--brand)" style={{ animation: 'spin 1s linear infinite' }} />
      <p style={{ color: 'var(--muted)', fontSize: 15 }}>Setting up your account...</p>
    </div>
  );
}
