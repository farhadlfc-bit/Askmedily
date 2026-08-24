'use client';
import { CheckCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';

export default function Pricing() {
  const [loading, setLoading] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isExpired, setIsExpired] = useState(false);
  const [forceUpgrade, setForceUpgrade] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('expired') === 'true') setIsExpired(true);
    if (params.get('upgrade') === 'true') setForceUpgrade(true);

    const getUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user || null);
      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('plan, trial_ends_at, has_chosen_plan')
          .eq('id', user.id)
          .single();
        setProfile(profileData);
        if (!profileData?.has_chosen_plan) {
          await supabase.from('profiles').update({ has_chosen_plan: true }).eq('id', user.id);
        }
      }
      setCheckingAuth(false);
    };
    getUser();
  }, []);

  const handleSubscribe = async (plan: 'basic' | 'premium') => {
    if (!user) { window.location.href = '/login'; return; }
    setLoading(plan);
    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, userId: user.id, email: user.email })
      });
      const data = await res.json();
      if (data.url) { window.location.href = data.url; }
      else { alert('Something went wrong. Please try again.'); }
    } catch { alert('Something went wrong. Please try again.'); }
    setLoading(null);
  };

  const isBasic = profile?.plan === 'basic';
  const isPremium = profile?.plan === 'premium';
  const isTrialActive = profile?.trial_ends_at && new Date() < new Date(profile.trial_ends_at) && !isBasic && !isPremium;
  const isNewUser = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('new') === 'true';
const isUpgrade = (isBasic || forceUpgrade) && !isExpired && !isPremium && !isNewUser;

  if (checkingAuth && !forceUpgrade) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 40, height: 40, border: '3px solid var(--brand-light)', borderTopColor: 'var(--brand)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
    </div>
  );

  if (!checkingAuth && isPremium) return (
    <main style={{ minHeight: '100vh', background: 'var(--background)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', padding: 40 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>You're on Premium</h1>
        <p style={{ color: 'var(--muted)', marginBottom: 24 }}>You already have full access to all AskMedily features.</p>
        <a href="/dashboard" style={{ color: 'var(--brand)', fontWeight: 600, textDecoration: 'none' }}>← Back to dashboard</a>
      </div>
    </main>
  );

  return (
    <main style={{ minHeight: '100vh', background: 'var(--background)' }}>
      <nav style={{ background: 'white', borderBottom: '1px solid var(--border)', padding: '0px 32px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/icon.png" alt="AskMedily" style={{ height: 72, width: 72, borderRadius: 10 }} />
          <span style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1 }}>
            <span style={{ color: '#1a1a2e' }}>Ask</span><span style={{ color: '#0057FF' }}>Medily</span>
          </span>
        </a>
        {user && <span style={{ fontSize: 13, color: 'var(--muted)' }}>Signed in as {user.email}</span>}
      </nav>

      {isExpired && (
        <div style={{ background: '#FFF8F0', borderTop: '3px solid #FF9500', padding: '14px 32px', textAlign: 'center' }}>
          <p style={{ fontSize: 15, color: '#FF9500', fontWeight: 600 }}>⏰ Your free trial has ended — choose a plan below to continue using AskMedily.</p>
        </div>
      )}

      <div style={{ maxWidth: isUpgrade ? 480 : 760, margin: '0 auto', padding: '60px 24px', textAlign: 'center' }}>
        <a href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--muted)', textDecoration: 'none', fontSize: 14, marginBottom: 32 }}>
          <ArrowLeft size={16} /> Back
        </a>

        {isUpgrade ? (
          <>
            <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>Upgrade to Premium</h1>
            <p style={{ color: 'var(--muted)', marginBottom: 32 }}>Get full access to voice reading, AI guidance, and your personal medication history.</p>
            <div style={{ background: 'var(--brand)', borderRadius: 20, padding: 32, textAlign: 'left', color: 'white', position: 'relative' }}>
              <div style={{ position: 'absolute', top: -12, right: 20, background: 'var(--accent)', color: 'white', padding: '4px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>Most Popular</div>
              <p style={{ fontSize: 14, fontWeight: 600, opacity: 0.8, marginBottom: 8 }}>Premium</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
                <span style={{ fontSize: 40, fontWeight: 800 }}>£9.99</span>
                <span style={{ opacity: 0.7 }}>/month</span>
              </div>
              <p style={{ fontSize: 12, opacity: 0.7, marginBottom: 24 }}>billed monthly, cancel anytime</p>
              <ul style={{ listStyle: 'none', marginBottom: 28, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {['Everything in Basic', 'AI Condition Agent — personalised medication guidance', 'Voice agent — listen to drug info read aloud', 'My Med History — personal medication log', 'Priority support', 'Early access to new features'].map((f, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14 }}>
                    <CheckCircle size={16} style={{ marginTop: 2, flexShrink: 0, color: 'white' }} />{f}
                  </li>
                ))}
              </ul>
              <button onClick={() => handleSubscribe('premium')} disabled={loading === 'premium'}
                style={{ width: '100%', textAlign: 'center', background: 'white', color: 'var(--brand)', padding: '13px', borderRadius: 10, border: 'none', fontWeight: 700, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: loading ? 0.7 : 1 }}>
                {loading === 'premium' ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Processing...</> : 'Upgrade to Premium — £9.99/mo'}
              </button>
            </div>
          </>
        ) : (
          <>
            <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 8 }}>Simple, honest pricing</h1>
            <p style={{ color: 'var(--muted)', marginBottom: 12 }}>
              {isExpired ? 'Your trial has ended. Subscribe to keep access.' : 'Start with a 2-day free trial. No credit card required until trial ends.'}
            </p>
            {!isExpired && (
              <div style={{ display: 'inline-block', background: '#E8FBF5', color: '#00875A', padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600, marginBottom: 40 }}>
                🎉 2-day free trial on all plans
              </div>
            )}
            {!user && (
              <div style={{ background: 'var(--brand-light)', borderRadius: 12, padding: '14px 20px', marginBottom: 24, fontSize: 14, color: 'var(--brand)' }}>
                <a href="/login" style={{ color: 'var(--brand)', fontWeight: 700, textDecoration: 'none' }}>Sign in or create an account</a> to start your free trial
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              {[
                { plan: 'basic' as const, name: 'Basic', price: '£4.99', features: ['Drug search & plain English pages', 'Side effects ranked by frequency', 'Photo search — identify meds from a photo', 'Voice search — speak to search', 'NHS & FDA sourced data'], highlight: false },
                { plan: 'premium' as const, name: 'Premium', price: '£9.99', features: ['Everything in Basic', 'AI Condition Agent — personalised guidance', 'Voice agent — listen to drug info read aloud', 'My Med History — personal medication log', 'Priority support', 'Early access to new features'], highlight: true }
              ].map((item) => (
                <div key={item.plan} style={{ background: item.highlight ? 'var(--brand)' : 'white', color: item.highlight ? 'white' : 'var(--foreground)', borderRadius: 20, padding: 32, border: '1px solid var(--border)', textAlign: 'left', position: 'relative' }}>
                  {item.highlight && <div style={{ position: 'absolute', top: -12, right: 20, background: 'var(--accent)', color: 'white', padding: '4px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>Most Popular</div>}
                  <p style={{ fontSize: 14, fontWeight: 600, opacity: 0.8, marginBottom: 8 }}>{item.name}</p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
                    <span style={{ fontSize: 40, fontWeight: 800 }}>{item.price}</span>
                    <span style={{ opacity: 0.7 }}>/month</span>
                  </div>
                  {!isExpired && <p style={{ fontSize: 12, opacity: 0.7, marginBottom: 24 }}>after 2-day free trial</p>}
                  {isExpired && <p style={{ fontSize: 12, opacity: 0.7, marginBottom: 24 }}>billed monthly, cancel anytime</p>}
                  <ul style={{ listStyle: 'none', marginBottom: 28, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {item.features.map((f, j) => (
                      <li key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14 }}>
                        <CheckCircle size={16} style={{ marginTop: 2, flexShrink: 0, color: item.highlight ? 'white' : 'var(--accent)' }} />{f}
                      </li>
                    ))}
                  </ul>
                  <button onClick={() => handleSubscribe(item.plan)} disabled={loading === item.plan}
                    style={{ width: '100%', textAlign: 'center', background: item.highlight ? 'white' : 'var(--brand)', color: item.highlight ? 'var(--brand)' : 'white', padding: '13px', borderRadius: 10, border: 'none', fontWeight: 700, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: loading ? 0.7 : 1 }}>
                    {loading === item.plan ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Processing...</> : user ? (isExpired ? 'Subscribe now' : 'Start free trial') : 'Sign in to start'}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
        <p style={{ marginTop: 32, fontSize: 13, color: 'var(--muted)' }}>Cancel anytime. No hidden fees. Secure payments via Stripe.</p>
      </div>
    </main>
  );
}
