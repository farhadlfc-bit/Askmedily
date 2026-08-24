'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { ArrowLeft, Loader2, Play, Check } from 'lucide-react';

const VOICE_OPTIONS = [
  { id: 'Xb7hH8MSUJpSbSDYk0k2', name: 'Alice', description: 'Clear, engaging British female' },
  { id: 'onwK4e9ZLuTAKqWW03F9', name: 'Daniel', description: 'Steady British broadcaster male' },
  { id: 'r3cuLnjnQ2BjA06ZloeU', name: 'Becky', description: 'Warm, approachable British female' },
  { id: '2styzLg7OSeuhPP6uQ26', name: 'Philip', description: 'Clear, measured British male' },
  { id: 'wjZJDZGwI2sD6seofPVe', name: 'Nina', description: 'Refined British RP female' },
  { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', description: 'Calm, clear American female' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', description: 'Soft, warm female' },
  { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh', description: 'Deep, male' },
  { id: 'yoZ06aMxZJJ28mfd3POQ', name: 'Sam', description: 'Raspy, young male' },
];

export default function Settings() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [activeTab, setActiveTab] = useState<'voice' | 'account' | 'subscription'>('account');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [selectedVoice, setSelectedVoice] = useState('21m00Tcm4TlvDq8ikWAM');
  const [readingSpeed, setReadingSpeed] = useState(1);
  const [previewLoading, setPreviewLoading] = useState<string | null>(null);
  const [voiceSaved, setVoiceSaved] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [accountMessage, setAccountMessage] = useState('');
  const [accountLoading, setAccountLoading] = useState(false);

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
      const premium = profileData?.plan === 'premium';
      setIsPremium(premium);
      if (premium) setActiveTab('voice');
      const savedVoice = localStorage.getItem('askmedily_voice_id');
      const savedVoiceEnabled = localStorage.getItem('askmedily_voice_enabled');
      const savedSpeed = localStorage.getItem('askmedily_reading_speed');
      if (savedVoice) setSelectedVoice(savedVoice);
      if (savedVoiceEnabled !== null) setVoiceEnabled(savedVoiceEnabled === 'true');
      if (savedSpeed) setReadingSpeed(parseFloat(savedSpeed));
      setLoading(false);
    };
    init();
  }, []);

  const previewVoice = async (voiceId: string) => {
    setPreviewLoading(voiceId);
    try {
      const res = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: 'Hello, I am your AskMedily voice assistant. I will read medication information to you clearly and accurately.',
          voiceId
        })
      });
      const data = await res.json();
      if (data.audio) {
        const audio = new Audio(`data:audio/mpeg;base64,${data.audio}`);
        audio.playbackRate = readingSpeed;
        audio.play();
      }
    } catch {}
    setPreviewLoading(null);
  };

  const saveVoiceSettings = () => {
    localStorage.setItem('askmedily_voice_id', selectedVoice);
    localStorage.setItem('askmedily_voice_enabled', voiceEnabled.toString());
    localStorage.setItem('askmedily_reading_speed', readingSpeed.toString());
    setVoiceSaved(true);
    setTimeout(() => setVoiceSaved(false), 2000);
  };

  const updatePassword = async () => {
    if (!newPassword) { setAccountMessage('Please enter a new password'); return; }
    setAccountLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) { setAccountMessage(error.message); }
    else { setAccountMessage('Password updated successfully'); setNewPassword(''); }
    setAccountLoading(false);
  };

  const deleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This cannot be undone.')) return;
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const isSubscribed = () => profile?.plan === 'basic' || profile?.plan === 'premium';

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 40, height: 40, border: '3px solid var(--brand-light)', borderTopColor: 'var(--brand)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
    </div>
  );

  const tabs = [
    ...(isPremium ? [{ key: 'voice', label: '🔊 Voice' }] : []),
    { key: 'account', label: '👤 Account' },
    { key: 'subscription', label: '💳 Subscription' },
  ];

  return (
    <main style={{ minHeight: '100vh', background: 'var(--background)' }}>
      <nav style={{ background: 'white', borderBottom: '1px solid var(--border)', padding: '0px 32px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/icon.png" alt="AskMedily" style={{ height: 72, width: 72, borderRadius: 10 }} />
          <span style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1 }}>
            <span style={{ color: '#1a1a2e' }}>Ask</span><span style={{ color: '#0057FF' }}>Medily</span>
          </span>
        </a>
        <span style={{ fontSize: 13, color: 'var(--muted)' }}>{user?.email}</span>
      </nav>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px' }}>
        <a href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--muted)', textDecoration: 'none', fontSize: 14, marginBottom: 28 }}>
          <ArrowLeft size={16} /> Back to dashboard
        </a>

        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 24 }}>Settings</h1>

        <div style={{ display: 'flex', gap: 4, background: 'white', borderRadius: 12, padding: 4, marginBottom: 24, border: '1px solid var(--border)' }}>
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as any)} style={{
              flex: 1, padding: '10px', borderRadius: 9, border: 'none', cursor: 'pointer',
              fontSize: 14, fontWeight: 600, transition: 'all 0.2s',
              background: activeTab === tab.key ? 'var(--brand)' : 'transparent',
              color: activeTab === tab.key ? 'white' : 'var(--muted)'
            }}>
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'voice' && isPremium && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Voice agent</h2>
                  <p style={{ fontSize: 13, color: 'var(--muted)' }}>Read medication information aloud on drug pages</p>
                </div>
                <button onClick={() => setVoiceEnabled(!voiceEnabled)} style={{
                  width: 48, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer',
                  background: voiceEnabled ? 'var(--brand)' : 'var(--border)', position: 'relative', transition: 'background 0.2s'
                }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'white', position: 'absolute', top: 3, left: voiceEnabled ? 25 : 3, transition: 'left 0.2s' }} />
                </button>
              </div>
            </div>

            {voiceEnabled && (
              <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid var(--border)' }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Choose a voice</h2>
                <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>Click play to preview before selecting</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {VOICE_OPTIONS.map(voice => (
                    <div key={voice.id} onClick={() => setSelectedVoice(voice.id)} style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                      borderRadius: 10, border: `2px solid ${selectedVoice === voice.id ? 'var(--brand)' : 'var(--border)'}`,
                      background: selectedVoice === voice.id ? 'var(--brand-light)' : 'var(--background)',
                      cursor: 'pointer', transition: 'all 0.2s'
                    }}>
                      <button onClick={(e) => { e.stopPropagation(); previewVoice(voice.id); }} style={{
                        width: 32, height: 32, borderRadius: '50%', border: 'none',
                        background: 'var(--brand)', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                      }}>
                        {previewLoading === voice.id
                          ? <Loader2 size={14} color="white" style={{ animation: 'spin 1s linear infinite' }} />
                          : <Play size={14} color="white" />}
                      </button>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 600, fontSize: 14 }}>{voice.name}</p>
                        <p style={{ fontSize: 12, color: 'var(--muted)' }}>{voice.description}</p>
                      </div>
                      {selectedVoice === voice.id && <Check size={16} color="var(--brand)" />}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {voiceEnabled && (
              <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid var(--border)' }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Reading speed</h2>
                <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>Current: {readingSpeed}x</p>
                <input type="range" min="0.5" max="2" step="0.25" value={readingSpeed}
                  onChange={(e) => setReadingSpeed(parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--brand)' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>
                  <span>0.5x (Slow)</span><span>1x (Normal)</span><span>2x (Fast)</span>
                </div>
              </div>
            )}

            <button onClick={saveVoiceSettings} style={{
              background: 'var(--brand)', color: 'white', border: 'none', borderRadius: 12,
              padding: '14px', fontSize: 15, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
            }}>
              {voiceSaved ? <><Check size={16} /> Saved!</> : 'Save voice settings'}
            </button>
          </div>
        )}

        {activeTab === 'account' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid var(--border)' }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Account details</h2>
              <div style={{ padding: '12px 16px', background: 'var(--background)', borderRadius: 10 }}>
                <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>EMAIL ADDRESS</p>
                <p style={{ fontSize: 15, fontWeight: 600 }}>{user?.email}</p>
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid var(--border)' }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Change password</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                  placeholder="New password (min. 8 characters)"
                  style={{ width: '100%', padding: '12px 14px', border: '1px solid var(--border)', borderRadius: 10, fontSize: 15, outline: 'none', background: 'var(--background)', boxSizing: 'border-box' }}
                />
                {accountMessage && (
                  <p style={{ fontSize: 13, color: accountMessage.includes('success') ? 'var(--accent)' : 'var(--danger)' }}>{accountMessage}</p>
                )}
                <button onClick={updatePassword} disabled={accountLoading} style={{
                  background: 'var(--brand)', color: 'white', border: 'none', borderRadius: 10,
                  padding: '12px', fontSize: 14, fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: accountLoading ? 0.7 : 1
                }}>
                  {accountLoading ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Updating...</> : 'Update password'}
                </button>
              </div>
            </div>

            <div style={{ background: '#FFF0F0', borderRadius: 16, padding: 24, border: '1px solid #FFD4D4' }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, color: 'var(--danger)' }}>Delete account</h2>
              <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>This will permanently delete your account and all your data. This cannot be undone.</p>
              <button onClick={deleteAccount} style={{
                background: 'var(--danger)', color: 'white', border: 'none', borderRadius: 10,
                padding: '12px 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer'
              }}>
                Delete my account
              </button>
            </div>
          </div>
        )}

        {activeTab === 'subscription' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid var(--border)' }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Current plan</h2>
              <div style={{ padding: '16px', background: isSubscribed() ? 'var(--brand-light)' : 'var(--background)', borderRadius: 10, marginBottom: 16, border: `1px solid ${isSubscribed() ? 'var(--brand)' : 'var(--border)'}` }}>
                <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>PLAN</p>
                <p style={{ fontSize: 18, fontWeight: 800, color: isSubscribed() ? 'var(--brand)' : 'var(--foreground)' }}>
                  {profile?.plan === 'premium' ? 'Premium — £9.99/month'
                    : profile?.plan === 'basic' ? 'Basic — £4.99/month'
                    : 'Free Trial'}
                </p>
              </div>
              {profile?.plan === 'basic' && (
                <a href="/pricing?upgrade=true" style={{ display: 'block', textAlign: 'center', background: 'var(--brand)', color: 'white', padding: '13px', borderRadius: 10, textDecoration: 'none', fontWeight: 700, fontSize: 15, marginBottom: 12 }}>
                  Upgrade to Premium — £9.99/month
                </a>
              )}
              {!isSubscribed() && (
                <a href="/pricing" style={{ display: 'block', textAlign: 'center', background: 'var(--brand)', color: 'white', padding: '13px', borderRadius: 10, textDecoration: 'none', fontWeight: 700, fontSize: 15 }}>
                  Choose a plan
                </a>
              )}
            </div>
            {isSubscribed() && (
              <div style={{ background: 'var(--background)', borderRadius: 16, padding: 24, border: '1px solid var(--border)' }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>Manage subscription</h2>
                <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12 }}>To cancel or change your subscription, please contact us.</p>
                <a href="mailto:support@askmedily.com" style={{ color: 'var(--brand)', fontSize: 14, fontWeight: 600 }}>Contact support →</a>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
