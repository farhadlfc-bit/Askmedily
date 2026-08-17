'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { Pill, Search, Brain, LogOut, ChevronRight, Loader2 } from 'lucide-react';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { window.location.href = '/login'; return; }
      
      setUser(session.user);

      // Get profile to check subscription status
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      setProfile(profileData);
      setLoading(false);
    };
    init();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const handleSubscribe = async (plan: 'basic' | 'premium') => {
    if (!user) return;
    setCheckoutLoading(plan);
    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, userId: user.id, email: user.email })
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert('Something went wrong. Please try again.');
    } catch {
      alert('Something went wrong. Please try again.');
    }
    setCheckoutLoading(null);
  };

  const isTrialActive = () => {
    if (!profile) return false;
    if (profile.plan === 'basic' || profile.plan === 'premium') return false;
    const trialEnd = new Date(profile.trial_ends_at);
    return new Date() < trialEnd;
  };

  const isSubscribed = () => {
    return profile?.plan === 'basic' || profile?.plan === 'premium';
  };

  const isExpired = () => {
    if (!profile) return false;
    if (isSubscribed()) return false;
    const trialEnd = new Date(profile.trial_ends_at);
    return new Date() > trialEnd;
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 40, height: 40, border: '3px solid var(--brand-light)', borderTopColor: 'var(--brand)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
    </div>
  );

  return (
    <main style={{ minHeight: '100vh', background: 'var(--background)' }}>
      {/* Nav */}
      <nav style={{ background: 'white', borderBottom: '1px solid var(--border)', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, background: 'var(--brand)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Pill size={18} color="white" />
          </div>
          <span style={{ fontWeight: 700, fontSize: 18 }}>AskMedily</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 13, color: 'var(--muted)' }}>{user?.email}</span>
          <button onClick={handleSignOut} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '7px 12px', cursor: 'pointer', fontSize: 13, color: 'var(--muted)' }}>
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>Welcome back 👋</h1>
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>What would you like to look up today?</p>
        </div>

        {/* Trial active — clean, no upgrade pressure */}
        {isTrialActive() && (
          <div style={{ background: '#E8FBF5', borderRadius: 12, padding: '14px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 18 }}>✅</span>
            <p style={{ fontSize: 14, color: '#00875A', fontWeight: 600 }}>Your free trial is active — enjoy full access to AskMedily.</p>
          </div>
        )}

        {/* Subscribed — clean, nothing shown */}

        {/* Expired — show upgrade */}
        {isExpired() && (
          <div style={{ background: 'white', borderRadius: 16, padding: 24, marginBottom: 24, border: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Your trial has ended</h2>
            <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 20 }}>Choose a plan to continue using AskMedily.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { plan: 'basic' as const, label: 'Basic', price: '£4.99/month', desc: 'Drug search + side effects' },
                { plan: 'premium' as const, label: 'Premium', price: '£9.99/month', desc: 'Everything + AI Agent' }
              ].map(item => (
                <button key={item.plan} onClick={() => handleSubscribe(item.plan)} disabled={!!checkoutLoading} style={{
                  background: item.plan === 'premium' ? 'var(--brand)' : 'white',
                  color: item.plan === 'premium' ? 'white' : 'var(--foreground)',
                  border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px',
                  cursor: 'pointer', textAlign: 'left', opacity: checkoutLoading ? 0.7 : 1
                }}>
                  <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{item.label} — {item.price}</p>
                  <p style={{ fontSize: 12, opacity: 0.7 }}>{item.desc}</p>
                  {checkoutLoading === item.plan && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite', marginTop: 4 }} />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
          {[
            { icon: <Search size={22} color="var(--brand)" />, title: 'Search a medication', desc: 'Plain English drug information', href: '/?search=true', bg: 'var(--brand-light)' },
            { icon: <Brain size={22} color="var(--accent)" />, title: 'Ask about a condition', desc: 'AI guides you to the right medication', href: '/condition?q=', bg: '#E8FBF5' }
          ].map((item, i) => (
            <a key={i} href={item.href} style={{ background: 'white', borderRadius: 14, padding: 20, border: '1px solid var(--border)', textDecoration: 'none', color: 'var(--foreground)', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ width: 44, height: 44, background: item.bg, borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {item.icon}
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 3 }}>{item.title}</p>
