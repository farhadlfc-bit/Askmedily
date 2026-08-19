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
                <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0
