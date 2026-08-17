'use client';
import { useState } from 'react';
import { Pill, ArrowLeft, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleReset = async () => {
    if (!email) { setError('Please enter your email'); return; }
    setLoading(true);
    setError('');
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://askmedily.com/reset-password',
    });
    if (error) { setError(error.message); }
    else { setSent(true); }
    setLoading(false);
  };

  return (
    <main style={{ minHeight: '100vh', background: 'var(--background)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 52, height: 52, background: 'var(--brand)', borderRadius: 14, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <Pill size={26} color="white" />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>Reset your password</h1>
          <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 4 }}>We'll send you a link to reset it</p>
        </div>

        <div style={{ background: 'white', borderRadius: 20, padding: 32, border: '1px solid var(--border)', boxShadow: '0 4px 24px rgba(0,87,255,0.06)' }}>
          {sent ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📧</div>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Check your email</h2>
              <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6 }}>We've sent a password reset link to <strong>{email}</strong>. Click the link in the email to reset your password.</p>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Email address</label>
                <input
                  type="email" value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleReset()}
                  placeholder="you@example.com"
                  style={{ width: '100%', padding: '12px 14px', border: '1px solid var(--border)', borderRadius: 10, fontSize: 15, outline: 'none', background: 'var(--background)', boxSizing: 'border-box' }}
                />
              </div>
              {error && <div style={{ marginBottom: 14, padding: '10px 14px', background: '#FFF0F0', borderRadius: 8, fontSize: 13, color: 'var(--danger)' }}>{error}</div>}
              <button onClick={handleReset} disabled={loading} style={{ width: '100%', padding: '14px', background: 'var(--brand)', color: 'white', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: loading ? 0.7 : 1 }}>
                {loading ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Sending...</> : 'Send reset link'}
              </button>
            </>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <a href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--muted)', textDecoration: 'none', fontSize: 14 }}>
            <ArrowLeft size={14} /> Back to sign in
          </a>
        </div>
      </div>
    </main>
  );
}
