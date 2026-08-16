'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { Pill, Search, Brain, Star, LogOut, ChevronRight } from 'lucide-react';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = '/login'; return; }
      setUser(user);
      setLoading(false);
    };
    getUser();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
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
          <span style={{ fontSize: 14, color: 'var(--muted)' }}>{user?.email}</span>
          <button onClick={handleSignOut} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '7px 12px', cursor: 'pointer', fontSize: 13, color: 'var(--muted)' }}>
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>
        {/* Welcome */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>Welcome back 👋</h1>
          <p style={{ color: 'var(--muted)' }}>What would you like to look up today?</p>
        </div>

        {/* Trial Banner */}
        <div style={{ background: 'linear-gradient(135deg, var(--brand), #0040CC)', borderRadius: 16, padding: 24, marginBottom: 28, color: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Star size={18} color="#FFD700" fill="#FFD700" />
            <span style={{ fontWeight: 700, fontSize: 16 }}>Free Trial Active</span>
          </div>
          <p style={{ fontSize: 14, opacity: 0.9, marginBottom: 16 }}>You have full access to all features for 2 days. Upgrade to keep access after your trial ends.</p>
          <a href="/pricing" style={{ display: 'inline-block', background: 'white', color: 'var(--brand)', padding: '9px 20px', borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
            View plans →
          </a>
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 }}>
          {[
            { icon: <Search size={22} color="var(--brand)" />, title: 'Search a medication', desc: 'Plain English drug information', href: '/', bg: 'var(--brand-light)' },
            { icon: <Brain size={22} color="var(--accent)" />, title: 'Ask about a condition', desc: 'AI guides you to the right medication', href: '/condition', bg: '#E8FBF5' }
          ].map((item, i) => (
            <a key={i} href={item.href} style={{ background: 'white', borderRadius: 14, padding: 20, border: '1px solid var(--border)', textDecoration: 'none', color: 'var(--foreground)', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ width: 44, height: 44, background: item.bg, borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {item.icon}
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 3 }}>{item.title}</p>
                <p style={{ fontSize: 13, color: 'var(--muted)' }}>{item.desc}</p>
              </div>
              <ChevronRight size={16} color="var(--muted)" style={{ marginTop: 'auto' }} />
            </a>
          ))}
        </div>

        {/* Popular Medications */}
        <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Popular medications</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {['Metformin', 'Atorvastatin', 'Lisinopril', 'Omeprazole', 'Amoxicillin', 'Amlodipine', 'Ramipril', 'Levothyroxine', 'Salbutamol', 'Sertraline'].map(drug => (
              <a key={drug} href={`/drug?q=${drug}`} style={{ background: 'var(--background)', border: '1px solid var(--border)', borderRadius: 20, padding: '6px 14px', fontSize: 13, textDecoration: 'none', color: 'var(--foreground)', fontWeight: 500 }}>
                {drug}
              </a>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
