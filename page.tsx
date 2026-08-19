'use client';
import { useState, useEffect } from 'react';
import { Search, Pill, Brain, ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<'drug' | 'condition'>('drug');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };
    getUser();
  }, []);

  const handleSearch = () => {
    if (!query.trim()) return;
    if (mode === 'drug') {
      window.location.href = `/drug?q=${encodeURIComponent(query)}`;
    } else {
      window.location.href = `/condition?q=${encodeURIComponent(query)}`;
    }
  };

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
        {user && (
          <span style={{ fontSize: 13, color: 'var(--muted)' }}>{user.email}</span>
        )}
      </nav>

      <div style={{ maxWidth: 660, margin: '0 auto', padding: '60px 24px' }}>
        <a href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--muted)', textDecoration: 'none', fontSize: 14, marginBottom: 32 }}>
          <ArrowLeft size={16} /> Back to dashboard
        </a>

        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>What are you looking for?</h1>
        <p style={{ color: 'var(--muted)', fontSize: 15, marginBottom: 32 }}>Search for a medication or condition in plain English.</p>

        {/* Mode Toggle */}
        <div style={{ display: 'flex', gap: 4, background: 'white', borderRadius: 12, padding: 4, marginBottom: 12, border: '1px solid var(--border)' }}>
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
        <div style={{ display: 'flex', gap: 8, background: 'white', borderRadius: 14, padding: 8, border: '1px solid var(--border)', boxShadow: '0 4px 24px rgba(0,87,255,0.08)', marginBottom: 24 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={mode === 'drug' ? 'e.g. Metformin, Atorvastatin, Amoxicillin...' : 'e.g. Type 2 Diabetes, Hypertension, Asthma...'}
              autoFocus
              style={{ width: '100%', padding: '13px 14px 13px 42px', border: '1px solid var(--border)', borderRadius: 10, fontSize: 15, outline: 'none', background: 'var(--background)', color: 'var(--foreground)' }}
            />
          </div>
          <button onClick={handleSearch} style={{ background: 'var(--brand)', color: 'white', border: 'none', borderRadius: 10, padding: '13px 24px', fontSize: 15, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            Search
          </button>
        </div>

        {/* Popular searches */}
        <div>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 10 }}>
            {mode === 'drug' ? 'Popular medications' : 'Common conditions'}
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {mode === 'drug'
              ? ['Metformin', 'Atorvastatin', 'Lisinopril', 'Omeprazole', 'Amoxicillin', 'Sertraline', 'Ramipril', 'Salbutamol']
              : ['Type 2 Diabetes', 'Hypertension', 'Asthma', 'Depression', 'Anxiety', 'High Cholesterol', 'COPD', 'Arthritis']
            }.map(item => (
              <button key={item} onClick={() => { setQuery(item); }} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 20, padding: '6px 14px', fontSize: 13, cursor: 'pointer', color: 'var(--foreground)' }}>
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
