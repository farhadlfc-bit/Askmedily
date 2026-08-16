'use client';
import { useState } from 'react';
import { Pill, Eye, EyeOff, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase';

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const supabase = createClient();

  const handleAuth = async () => {
    if (!email || !password) { setError('Please fill in all fields'); return; }
    setLoading(true);
    setError('');
    setMessage('');

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` }
      });
      if (error) { setError(error.message); }
      else { setMessage('Check your email to confirm your account, then come back to sign in.'); }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setError(error.message); }
      else { window.location.href = '/dashboard'; }
    }
    setLoading(false);
  };

  return (
    <main style={{ minHeight: '100vh', background: 'var(--background)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 52, height: 52, background: 'var(--brand)', borderRadius: 14, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <Pill size={26} color="white" />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>AskMedily</h1>
          <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 4 }}>Understand your medication, finally.</p>
        </div>

        {/* Card */}
        <div style={{ background: 'white', borderRadius: 20, padding: 32, border: '1px solid var(--border)', boxShadow: '0 4px 24px rgba(0,87,255,0.06)' }}>
          {/* Trial Banner */}
          {mode === 'signup' && (
            <div style={{ background: 'var(--brand-light)', borderRadius: 10, padding: '10px 14px', marginBottom: 24, textAlign: 'center' }}>
              <p style={{ fontSize: 13, color: 'var(--brand)', fontWeight: 600 }}>🎉 2-day free trial — no card required</p>
            </div>
          )}

          {/* Toggle */}
          <div style={{ display: 'flex', background: 'var(--background)', borderRadius: 10, padding: 4, marginBottom: 24 }}>
            {(['signup', 'login'] as const).map(m => (
              <button key={m} onClick={() => setMode(m)} style={{
                flex: 1, padding: '8px', borderRadius: 8, border: 'none', cursor: 'pointer',
                fontSize: 14, fontWeight: 600, transition: 'all 0.2s',
                background: mode === m ? 'white' : 'transparent',
                color: mode === m ? 'var(--brand)' : 'var(--muted)',
                boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,0.08)' : 'none'
              }}>
                {m === 'signup' ? 'Create account' : 'Sign in'}
              </button>
            ))}
          </div>

          {/* Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)', display: 'block', marginBottom: 6 }}>Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={{ width: '100%', padding: '12px 14px', border: '1px solid var(--border)', borderRadius: 10, fontSize: 15, outline: 'none', background: 'var(--background)', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)', display: 'block', marginBottom: 6 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAuth()}
                  placeholder="Min. 8 characters"
                  style={{ width: '100%', padding: '12px 44px 12px 14px', border: '1px solid var(--border)', borderRadius: 10, fontSize: 15, outline: 'none', background: 'var(--background)', boxSizing: 'border-box' }}
                />
                <button onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          {/* Error / Message */}
          {error && <div style={{ marginTop: 14, padding: '10px 14px', background: '#FFF0F0', borderRadius: 8, fontSize: 13, color: 'var(--danger)' }}>{error}</div>}
          {message && <div style={{ marginTop: 14, padding: '10px 14px', background: '#E8FBF5', borderRadius: 8, fontSize: 13, color: '#00875A' }}>{message}</div>}

          {/* Submit */}
          <button onClick={handleAuth} disabled={loading} style={{
            width: '100%', marginTop: 20, padding: '14px', background: 'var(--brand)',
            color: 'white', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            opacity: loading ? 0.7 : 1
          }}>
            {loading ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Please wait...</> : mode === 'signup' ? 'Start free trial' : 'Sign in'}
          </button>

          {mode === 'login' && (
            <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--muted)' }}>
              <a href="/forgot-password" style={{ color: 'var(--brand)', textDecoration: 'none' }}>Forgot password?</a>
            </p>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>
          By signing up you agree to our <a href="/terms" style={{ color: 'var(--brand)', textDecoration: 'none' }}>Terms</a> and <a href="/privacy" style={{ color: 'var(--brand)', textDecoration: 'none' }}>Privacy Policy</a>
        </p>
      </div>
    </main>
  );
}
