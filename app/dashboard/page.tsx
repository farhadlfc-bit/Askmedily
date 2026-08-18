'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { Pill, Search, LogOut, Loader2, X } from 'lucide-react';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<'drug' | 'condition'>('drug');
  const [suggestion, setSuggestion] = useState<{name: string, slug: string} | null>(null);
  const [searching, setSearching] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [showTrialBanner, setShowTrialBanner] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { window.location.href = '/login'; return; }
      setUser(session.user);
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      setProfile(profileData);
      const dismissed = localStorage.getItem('trialBannerDismissed');
      if (!dismissed) setShowTrialBanner(true);
      setLoading(false);
    };
    init();
  }, []);

  const dismissTrialBanner = () => {
    localStorage.setItem('trialBannerDismissed', 'true');
    setShowTrialBanner(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    setSuggestion(null);

    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, type: mode })
      });
      const data = await res.json();

      if (data.results.length > 0 && data.results[0].score === 0) {
        if (mode === 'drug') {
          window.location.href = `/drug?q=${encodeURIComponent(data.results[0].name)}`;
        } else {
          window.location.href = `/condition?q=${encodeURIComponent(data.results[0].name)}`;
        }
      } else if (data.suggestion) {
        setSuggestion(data.suggestion);
        setSearching(false);
      } else {
        if (mode === 'drug') {
          window.location.href = `/drug?q=${encodeURIComponent(query)}`;
        } else {
          window.location.href = `/condition?q=${encodeURIComponent(query)}`;
        }
      }
    } catch {
      if (mode === 'drug') {
        window.location.href = `/drug?q=${encodeURIComponent(query)}`;
      } else {
        window.location.href = `/condition?q=${encodeURIComponent(query)}`;
      }
    }
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

  const isSubscribed = () => profile?.plan === 'basic' || profile?.plan === 'premium';

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
          <div style={{ width: 36, height: 36, background: 'var(--brand)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Pill size={20} color="white" />
          </div>
          <span style={{ fontWeight: 700, fontSize: 20 }}>AskMedily</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 13, color: 'var(--muted)' }}>{user?.email}</span>
          <button onClick={handleSignOut} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '7px 12px', cursor: 'pointer', fontSize: 13, color: 'var(--muted)' }}>
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '50px 24px' }}>

        {/* Trial banner — shown once only */}
        {isTrialActive() && showTrialBanner && (
          <div style={{ background: '#E8FBF5', borderRadius: 12, padding: '12px 18px', marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span>✅</span>
              <p style={{ fontSize: 14, color: '#00875A', fontWeight: 600 }}>Your free trial is active — enjoy full access to
