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
  const [googleLoading, setGoogleLoading] = useState(false);
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

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    if (error) {
      setError(error.message);
      setGoogleLoading(false);
    }
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
            <div style={{ background: 'var(--brand-light)', borderRadius: 10, padding: '10px 14px', marginBottom: 20, textAlign: 'center' }}>
              <p style={{ fontSize: 13, color: 'var(--brand)', fontWeight: 600 }}>🎉 2-day free trial — no card required</p>
            </div>
          )}

          {/* Google Button */}
          <button onClick={handleGoogleLogin} disabled={googleLoading} style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            background: 'white', border: '1px solid var(--border)', borderRadius: 10,
            padding: '12px', fontSize: 15, fontWeight: 600, cursor: 'pointer',
            marginBottom: 16, opacity: googleLoading ? 0.7 : 1, transition: 'all 0.2s'
          }}>
            {googleLoading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : (
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
                <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
                <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/>
                <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
              </svg>
            )}
            {googleLoading ? 'Connecting...' : 'Continue with Google'}
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: 13, color: 'var(--muted)' }}>or</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          {/* Toggle */}
          <div style={{ display: 'flex', background: 'var(--background)', borderRadius: 10, padding: 4, marginBottom: 20 }}>
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

          {error && <div style={{ marginTop: 14, padding: '10px 14px', background: '#FFF0F0', borderRadius: 8, fontSize: 13, color: 'var(--danger)' }}>{error}</div>}
          {message && <div style={{ marginTop: 14, padding: '10px 14px', background: '#E8FBF5', borderRadius: 8, fontSize: 13, color: '#00875A' }}>{message}</div>}

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
