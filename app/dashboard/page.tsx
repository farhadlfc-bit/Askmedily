'use client';
import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase';
import { Pill, Search, LogOut, Loader2, X, Mic, MicOff, Camera, ClipboardList } from 'lucide-react';

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
  const [isListening, setIsListening] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
      setIsPremium(profileData?.plan === 'premium');
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
      if (data.exactMatch) {
        window.location.href = mode === 'drug'
          ? `/drug?q=${encodeURIComponent(data.exactMatch.name)}`
          : `/condition?q=${encodeURIComponent(data.exactMatch.name)}`;
      } else if (data.suggestion) {
        setSuggestion(data.suggestion);
        setSearching(false);
      } else {
        window.location.href = mode === 'drug'
          ? `/drug?q=${encodeURIComponent(query)}`
          : `/condition?q=${encodeURIComponent(query)}`;
      }
    } catch {
      window.location.href = mode === 'drug'
        ? `/drug?q=${encodeURIComponent(query)}`
        : `/condition?q=${encodeURIComponent(query)}`;
    }
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice input is not supported in your browser. Please try Chrome.');
      return;
    }
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = 'en-GB';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      setSuggestion(null);
      setTimeout(() => {
        setSearching(true);
        fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: transcript, type: mode })
        }).then(r => r.json()).then(data => {
          if (data.exactMatch) {
            window.location.href = mode === 'drug'
              ? `/drug?q=${encodeURIComponent(data.exactMatch.name)}`
              : `/condition?q=${encodeURIComponent(data.exactMatch.name)}`;
          } else if (data.suggestion) {
            setSuggestion(data.suggestion);
            setSearching(false);
          } else {
            window.location.href = mode === 'drug'
              ? `/drug?q=${encodeURIComponent(transcript)}`
              : `/condition?q=${encodeURIComponent(transcript)}`;
          }
        }).catch(() => setSearching(false));
      }, 500);
    };
    recognition.onerror = () => { setIsListening(false); };
    recognition.start();
  };

  const handlePhotoSearch = () => {
    setPhotoError('');
    fileInputRef.current?.click();
  };

  const handlePhotoSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoLoading(true);
    setPhotoError('');
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const res = await fetch('/api/identify-medication', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64 })
      });
      const data = await res.json();
      if (data.found) {
        window.location.href = `/drug?q=${encodeURIComponent(data.name)}`;
      } else {
        setPhotoError(data.message || 'Could not identify medication. Please try a clearer photo.');
      }
    } catch {
      setPhotoError('Something went wrong. Please try again.');
    }
    setPhotoLoading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
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
    return new Date() < new Date(profile.trial_ends_at);
  };

  const isSubscribed = () => profile?.plan === 'basic' || profile?.plan === 'premium';

  const isExpired = () => {
    if (!profile || isSubscribed()) return false;
    return new Date() > new Date(profile.trial_ends_at);
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 40, height: 40, border: '3px solid var(--brand-light)', borderTopColor: 'var(--brand)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
    </div>
  );

  return (
    <main style={{ minHeight: '100vh', background: 'var(--background)' }}>
      <nav style={{ background: 'white', borderBottom: '1px solid var(--border)', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, background: 'var(--brand)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Pill size={20} color="white" />
          </div>
          <span style={{ fontWeight: 700, fontSize: 20 }}>AskMedily</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 13, color: 'var(--muted)' }}>{user?.email}</span>
          <a href="/settings" style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '7px 12px', fontSize: 13, color: 'var(--muted)', textDecoration: 'none' }}>
            ⚙️ Settings
          </a>
          <button onClick={handleSignOut} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '7px 12px', cursor: 'pointer', fontSize: 13, color: 'var(--muted)' }}>
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '50px 24px' }}>

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

        <h1 style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 12 }}>
          What are you<br />
          <span style={{ color: 'var(--brand)' }}>looking for?</span>
        </h1>
        <p style={{ fontSize: 17, color: 'var(--muted)', marginBottom: 28, lineHeight: 1.6 }}>
          Search for a medication or a condition.
        </p>

        <div style={{ display: 'flex', gap: 4, background: 'white', borderRadius: 12, padding: 4, marginBottom: 10, border: '1px solid var(--border)' }}>
          {(['drug', 'condition'] as const).map((m) => (
            <button key={m} onClick={() => { setMode(m); setSuggestion(null); }} style={{
              flex: 1, padding: '10px', borderRadius: 9, border: 'none', cursor: 'pointer',
              fontSize: 14, fontWeight: 600, transition: 'all 0.2s',
              background: mode === m ? 'var(--brand)' : 'transparent',
              color: mode === m ? 'white' : 'var(--muted)'
            }}>
              {m === 'drug' ? '💊 Search a Medication' : '🔍 Search a Condition'}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'stretch', marginBottom: 12 }}>
          <div style={{ position: 'relative', flex: 1, background: 'white', borderRadius: 14, border: '1px solid var(--border)', boxShadow: '0 4px 24px rgba(0,87,255,0.08)', display: 'flex', alignItems: 'center' }}>
            <Search size={18} style={{ position: 'absolute', left: 16, color: 'var(--muted)', flexShrink: 0 }} />
            <input
              value={query}
              onChange={(e) => { setQuery(e.target.value); setSuggestion(null); }}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={mode === 'drug' ? 'e.g. Metformin, Atorvastatin...' : 'e.g. Diabetes, Hypertension...'}
              autoFocus
              style={{ width: '100%', padding: '14px 14px 14px 44px', border: 'none', borderRadius: 14, fontSize: 15, outline: 'none', background: 'transparent', color: 'var(--foreground)' }}
            />
          </div>

          <button onClick={handleSearch} disabled={searching} style={{
            background: 'var(--brand)', color: 'white', border: 'none', borderRadius: 14,
            padding: '0 24px', fontSize: 15, fontWeight: 700, cursor: 'pointer',
            whiteSpace: 'nowrap', opacity: searching ? 0.7 : 1,
            display: 'flex', alignItems: 'center', gap: 8
          }}>
            {searching ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Searching...</> : 'Search'}
          </button>

          <button onClick={handleVoiceInput} style={{
            background: isListening ? '#EF4444' : 'white',
            border: '1px solid var(--border)', borderRadius: 14,
            padding: '0 16px', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3,
            minWidth: 80, transition: 'all 0.2s'
          }}>
            {isListening ? <MicOff size={18} color="white" /> : <Mic size={18} color="var(--brand)" />}
            <span style={{ fontSize: 10, color: isListening ? 'white' : 'var(--muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>
              {isListening ? 'Listening...' : 'Voice Search'}
            </span>
          </button>

          <button onClick={handlePhotoSearch} disabled={photoLoading} style={{
            background: photoLoading ? 'var(--brand-light)' : 'white',
            border: '1px solid var(--border)', borderRadius: 14,
            padding: '0 16px', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3,
            minWidth: 80, transition: 'all 0.2s', opacity: photoLoading ? 0.7 : 1
          }}>
            {photoLoading ? <Loader2 size={18} color="var(--brand)" style={{ animation: 'spin 1s linear infinite' }} /> : <Camera size={18} color="var(--brand)" />}
            <span style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>
              {photoLoading ? 'Scanning...' : 'Photo Search'}
            </span>
          </button>

          <input ref={fileInputRef} type="file" accept="image/*"
            onChange={handlePhotoSelected} style={{ display: 'none' }} />
        </div>

        {isListening && (
          <div style={{ background: '#FFF0F0', borderRadius: 10, padding: '10px 16px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444', animation: 'pulse-dot 1s infinite' }} />
            <span style={{ fontSize: 14, color: '#EF4444', fontWeight: 600 }}>Listening... speak now</span>
          </div>
        )}

        {photoError && (
          <div style={{ background: '#FFF0F0', borderRadius: 10, padding: '10px 16px', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <span style={{ fontSize: 14, color: 'var(--danger)' }}>{photoError}</span>
            <button onClick={() => setPhotoError('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}>
              <X size={14} />
            </button>
          </div>
        )}

        {suggestion && (
          <div style={{ background: 'var(--brand-light)', borderRadius: 10, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <span style={{ fontSize: 14, color: 'var(--brand)' }}>
              Did you mean <strong>{suggestion.name}</strong>?
            </span>
            <button onClick={() => {
              window.location.href = mode === 'drug'
                ? `/drug?q=${encodeURIComponent(suggestion.name)}`
                : `/condition?q=${encodeURIComponent(suggestion.name)}`;
            }} style={{ background: 'var(--brand)', color: 'white', border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              Yes, search for {suggestion.name}
            </button>
          </div>
        )}

        <div style={{ marginBottom: isPremium ? 20 : 0 }}>
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

        {isPremium && (
          <a href="/med-history" style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'white', borderRadius: 14, padding: 20, border: '1px solid var(--border)', textDecoration: 'none', color: 'var(--foreground)', marginTop: 20 }}>
            <div style={{ width: 44, height: 44, background: 'var(--brand-light)', borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <ClipboardList size={22} color="var(--brand)" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>My Med History</p>
              <p style={{ fontSize: 13, color: 'var(--muted)' }}>Track your personal medication record</p>
            </div>
            <span style={{ fontSize: 13, color: 'var(--muted)' }}>→</span>
          </a>
        )}
      </div>
    </main>
  );
}
