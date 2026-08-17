'use client';
import { CheckCircle, Pill, ArrowLeft, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';

export default function Pricing() {
  const [loading, setLoading] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setCheckingAuth(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setCheckingAuth(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubscribe = async (plan: 'basic' | 'premium') => {
    if (!user) {
      window.location.href = '/login';
      return;
    }
    setLoading(plan);
    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, userId: user.id, email: user.email })
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Something went wrong. Please try again.');
      }
    } catch {
      alert('Something went wrong. Please try again.');
    }
    setLoading(null);
  };

  return (
    <main style={{ minHeight: '100vh', background: 'var(--background)' }}>
      <nav style={{ background: 'white', borderBottom: '1px solid var(--border)', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, background: 'var(--brand)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Pill size={18} color="white" />
          </div>
          <span style={{ fontWeight: 700, fontSize: 18 }}>AskMedily</span>
        </div>
        {user && (
          <span style={{ fontSize: 13, color: 'var(--muted)' }}>Signed in as {user.email}</span>
        )}
      </nav>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '60px 24px', textAlign: 'center' }}>
        <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--muted)', textDecoration: 'none', fontSize: 14, marginBottom: 32 }}>
          <ArrowLeft size={16} /> Back
        </a>
        <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 8 }}>Simple, honest pricing</h1>
        <p style={{ color: 'var(--muted)', marginBottom: 12 }}>Start with a 2-day free trial. No credit card required until trial ends.</p>
        <div style={{ display: 'inline-block', background: '#E8FBF5', color: '#00875A', padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600, marginBottom: 40 }}>
          🎉 2-day free trial on all plans
        </div>

        {!checkingAuth && !user && (
          <div style={{ background: 'var(--brand-light)', borderRadius: 12, padding: '14px 20px', marginBottom: 24, fontSize: 14, color: 'var(--brand)' }}>
            <a href="/login" style={{ color: 'var(--brand)', fontWeight: 700, textDecoration: 'none' }}>Sign in or create an account</a> to start your free trial
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {[
            {
              plan: 'basic' as const,
              name: 'Basic', price: '£4.99', period: '/month',
              features: ['Drug search & plain English pages', 'Side effects ranked by frequency', 'Drug interaction information', 'NHS & FDA sourced data', 'Mobile friendly'],
              highlight: false
            },
            {
              plan: 'premium' as const,
              name: 'Premium', price: '£9.99', period: '/month',
              features: ['Everything in Basic', 'AI Condition Agent', 'Personalised medication history', 'Save & bookmark medications', 'Priority support', 'Early access to new features'],
              highlight: true
            }
          ].map((item) => (
            <div key={item.plan} style={{
              background: item.highlight ? 'var(--brand)' : 'white',
              color: item.highlight ? 'white' : 'var(--foreground)',
              borderRadius: 20, padding: 32, border: '1px solid var(--border)',
              textAlign: 'left', position: 'relative'
            }}>
              {item.highlight && (
                <div style={{ position: 'absolute', top: -12, right: 20, background: 'var(--accent)', color: 'white', padding: '4px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                  Most Popular
                </div>
              )}
              <p style={{ fontSize: 14, fontWeight: 600, opacity: 0.8, marginBottom: 8 }}>{item.name}</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
                <span style={{ fontSize: 40, fontWeight: 800 }}>{item.price}</span>
                <span style={{ opacity: 0.7 }}>{item.period}</span>
              </div>
              <p style={{ fontSize: 12, opacity: 0.7, marginBottom: 24 }}>after 2-day free trial</p>
              <ul style={{ listStyle: 'none', marginBottom: 28, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {item.features.map((f, j) => (
                  <li key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14 }}>
                    <CheckCircle size={16} style={{ marginTop: 2, flexShrink: 0, color: item.highlight ? 'white' : 'var(--accent)' }} />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleSubscribe(item.plan)}
                disabled={loading === item.plan || checkingAuth}
                style={{
                  width: '100%', textAlign: 'center',
                  background: item.highlight ? 'white' : 'var(--brand)',
                  color: item.highlight ? 'var(--brand)' : 'white',
                  padding: '13px', borderRadius: 10, border: 'none',
                  fontWeight: 700, fontSize: 15, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading === item.plan
                  ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Processing...</>
                  : checkingAuth ? 'Loading...'
                  : user ? 'Start free trial' : 'Sign in to start'
                }
              </button>
            </div>
          ))}
        </div>
        <p style={{ marginTop: 32, fontSize: 13, color: 'var(--muted)' }}>
          Cancel anytime. No hidden fees. Secure payments via Stripe.
        </p>
      </div>
    </main>
  );
}
