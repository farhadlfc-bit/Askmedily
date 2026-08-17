'use client';
import { useState } from 'react';
import { Pill, Loader2, Eye, EyeOff } from 'lucide-react';
import { createClient } from '@/lib/supabase';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleReset = async () => {
    if (!password) { setError('Please enter a new password'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (password !== confirm) { setError('Passwords do not match'); return; }
    setLoading(true);
    setError('');
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) { setError(error.message); }
    else { setDone(true); setTimeout(() => { window.location.href = '/dashboard'; }, 2000); }
    setLoading(false);
  };

  return (
    <main style={{ minHeight: '100vh', background: 'var(--background)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 52, height: 52, background: 'var(--brand)', borderRadius: 14, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <Pill size={26} color="white" />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>Set new password</h1>
          <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 4 }}>Choose a strong password for your account</p>
        </div>

        <div style={{ background: 'white', borderRadius: 20, padding: 32, border: '1px solid var(--border)', boxShadow: '0 4px 24px rgba(0,87,255,0.06)' }}>
          {done ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Password updated</h2>
              <p style={{ fontSize: 14, color: 'var(--muted)' }}>Redirecting you to your dashboard...</p>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>New password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    style={{ width: '100%', padding: '12px 44px 12px 14px', border: '1px solid var(--border)', borderRadius: 10, fontSize: 15, outline: 'none', background: 'var(--background)', boxSizing: 'border-box' }}
                  />
                  <button onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Confirm password</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleReset()}
                  placeholder="Repeat your password"
                  style={{ width: '100%', padding: '12px 14px', border: '1px solid var(--border)', borderRadius: 10, fontSize: 15, outline: 'none', background: 'var(--background)', boxSizing: 'border-box' }}
                />
              </div>
              {error && <div style={{ marginBottom: 14, padding: '10px 14px', background: '#FFF0F0', borderRadius: 8, fontSize: 13, color: 'var(--danger)' }}>{error}</div>}
              <button onClick={handleReset} disabled={loading} style={{ width: '100%', padding: '14px', background: 'var(--brand)', color: 'white', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: loading ? 0.7 : 1 }}>
                {loading ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Updating...</> : 'Update password'}
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
