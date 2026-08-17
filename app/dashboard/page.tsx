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

      // Only show trial banner if not dismissed before
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

  const handleSearch = () => {
    if (!query.trim()) return;
    if (mode === 'drug') {
      window.location.href = `/drug?q=${encodeURIComponent(query)}`;
    } else {
      window.location.href = `/condition?q=${encodeURIComponent(query)}`;
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
              <p style={{ fontSize: 14, color: '#00875A', fontWeight: 600 }}>Your free trial is active — enjoy full access to AskMedily.</p>
            </div>
            <button onClick={dismissTrialBanner} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#00875A', padding: 4 }}>
              <X size={16} />
            </button>
          </div>
        )}

        {/* Expired */}
        {isExpired() && (
          <div style={{ background: 'white', borderRadius: 16, padding: 24, marginBottom: 28, border: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>Your trial has ended</h2>
            <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 16 }}>Choose a plan to continue using AskMedily.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { plan: 'basic' as const, label: 'Basic — £4.99/mo' },
                { plan: 'premium' as const, label: 'Premium — £9.99/mo' }
              ].map(item => (
                <button key={item.plan} onClick={() => handleSubscribe(item.plan)} disabled={!!checkoutLoading} style={{
                  background: item.plan === 'premium' ? 'var(--brand)' : 'white',
                  color: item.plan === 'premium' ? 'white' : 'var(--foreground)',
                  border: '1px solid var(--border)', borderRadius: 10, padding: '12px',
                  cursor: 'pointer', fontWeight: 600, fontSize: 14, opacity: checkoutLoading ? 0.7 : 1
                }}>
                  {checkoutLoading === item.plan ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : item.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Hero */}
        <h1 style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 12 }}>
          What are you<br />
          <span style={{ color: 'var(--brand)' }}>looking for?</span>
        </h1>
        <p style={{ fontSize: 17, color: 'var(--muted)', marginBottom: 28, lineHeight: 1.6 }}>
          Search for a medication or a condition.
        </p>

        {/* Mode Toggle */}
        <div style={{ display: 'flex', gap: 4, background: 'white', borderRadius: 12, padding: 4, marginBottom: 10, border: '1px solid var(--border)' }}>
          {(['drug', 'condition'] as const).map((m) => (
            <button key={m} onClick={() => setMode(m)} style={{
              flex: 1, padding: '10px', borderRadius: 9, border: 'none', cursor: 'pointer',
              fontSize: 14, fontWeight: 600, transition: 'all 0.2s',
              background: mode === m ? 'var(--brand)' : 'transparent',
              color: mode === m ? 'white' : 'var(--muted)'
            }}>
              {m === 'drug' ? '💊 Search a Medication' : '🔍 Search a Condition'}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div style={{ display: 'flex', gap: 8, background: 'white', borderRadius: 16, padding: 8, border: '1px solid var(--border)', boxShadow: '0 4px 24px rgba(0,87,255,0.08)', marginBottom: 20 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={mode === 'drug' ? 'e.g. Metformin, Atorvastatin, Amoxicillin...' : 'e.g. Type 2 Diabetes, Hypertension, Asthma...'}
              autoFocus
              style={{ width: '100%', padding: '14px 14px 14px 42px', border: '1px solid var(--border)', borderRadius: 10, fontSize: 16, outline: 'none', background: 'var(--background)', color: 'var(--foreground)' }}
            />
          </div>
          <button onClick={handleSearch} style={{ background: 'var(--brand)', color: 'white', border: 'none', borderRadius: 10, padding: '14px 28px', fontSize: 16, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            Search
          </button>
        </div>

        {/* Popular */}
        <div>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 10 }}>
            {mode === 'drug' ? 'Popular medications' : 'Common conditions'}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {(mode === 'drug'
              ? ['Metformin', 'Atorvastatin', 'Lisinopril', 'Omeprazole', 'Amoxicillin', 'Sertraline', 'Ramipril', 'Salbutamol', 'Amlodipine', 'Levothyroxine']
              : ['Type 2 Diabetes', 'Hypertension', 'Asthma', 'Depression', 'Anxiety', 'High Cholesterol', 'COPD', 'Arthritis']
            ).map(item => (
              <button key={item} onClick={() => setQuery(item)} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 20, padding: '6px 14px', fontSize: 13, cursor: 'pointer', color: 'var(--foreground)' }}>
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
