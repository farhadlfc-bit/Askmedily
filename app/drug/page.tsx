'use client';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { Pill, AlertTriangle, Info, ArrowLeft, Loader2, Volume2, Square, Lock } from 'lucide-react';
import { createClient } from '@/lib/supabase';

interface DrugInfo {
  name: string;
  genericName: string;
  drugClass: string;
  whatItDoes: string;
  howItWorks: string;
  commonUses: string[];
  sideEffects: { effect: string; frequency: string; severity: 'mild' | 'moderate' | 'severe' }[];
  warnings: string[];
  interactions: string[];
  dosageInfo: string;
  takeWith: string;
  missedDose: string;
}

function DrugPageContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [drugInfo, setDrugInfo] = useState<DrugInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [authChecked, setAuthChecked] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { window.location.href = '/login'; return; }
      const { data: profile } = await supabase
        .from('profiles')
        .select('plan, trial_ends_at')
        .eq('id', session.user.id)
        .single();
      if (profile) {
        const isSubscribed = profile.plan === 'basic' || profile.plan === 'premium';
        const trialActive = profile.trial_ends_at && new Date() < new Date(profile.trial_ends_at);
        if (!isSubscribed && !trialActive) { window.location.href = '/pricing?expired=true'; return; }
        setIsPremium(profile.plan === 'premium');
      }
      setAuthChecked(true);
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (authChecked && query) fetchDrugInfo(query);
  }, [authChecked, query]);

  const fetchDrugInfo = async (drugName: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/drug', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ drugName })
      });
      const data = await res.json();
      if (data.error) { setError(data.error); }
      else { setDrugInfo(data); }
    } catch {
      setError('Could not load drug information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleListen = async () => {
    if (!drugInfo) return;
    if (!isPremium) {
      if (confirm('Voice reading is a Premium feature — £9.99/month. Upgrade now?')) {
        window.location.href = '/pricing?upgrade=true';
      }
      return;
    }
    if (isPlaying && currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setIsPlaying(false);
      setCurrentAudio(null);
      return;
    }
    const voiceId = localStorage.getItem('askmedily_voice_id') || '21m00Tcm4TlvDq8ikWAM';
    const speed = parseFloat(localStorage.getItem('askmedily_reading_speed') || '1');
    const text = `
      ${drugInfo.name}. ${drugInfo.genericName ? `Also known as ${drugInfo.genericName}.` : ''}
      ${drugInfo.whatItDoes}
      Common uses: ${drugInfo.commonUses?.join(', ')}.
      Important warnings: ${drugInfo.warnings?.join('. ')}.
      How to take it: ${drugInfo.dosageInfo}. ${drugInfo.takeWith}.
      If you miss a dose: ${drugInfo.missedDose}.
      This information is for educational purposes only. Always consult your doctor or pharmacist.
    `.trim();
    setAudioLoading(true);
    try {
      const res = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voiceId })
      });
      const data = await res.json();
      if (data.audio) {
        const audio = new Audio(`data:audio/mpeg;base64,${data.audio}`);
        audio.playbackRate = speed;
        audio.onended = () => { setIsPlaying(false); setCurrentAudio(null); };
        audio.play();
        setCurrentAudio(audio);
        setIsPlaying(true);
      } else {
        alert('Voice reading is temporarily unavailable. Please try again later.');
      }
    } catch {
      alert('Voice reading is temporarily unavailable. Please try again later.');
    }
    setAudioLoading(false);
  };

  const severityDot = { mild: '#94A3B8', moderate: '#F59E0B', severe: '#EF4444' };

  if (!authChecked) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 40, height: 40, border: '3px solid var(--brand-light)', borderTopColor: 'var(--brand)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
    </div>
  );

  if (loading) return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <Loader2 size={28} color="var(--brand)" style={{ animation: 'spin 1s linear infinite' }} />
      <p style={{ color: 'var(--muted)' }}>Looking up <strong>{query}</strong>...</p>
    </div>
  );

  if (error) return (
    <div style={{ maxWidth: 600, margin: '80px auto', textAlign: 'center', padding: '0 24px' }}>
      <AlertTriangle size={40} color="var(--danger)" style={{ marginBottom: 16 }} />
      <h2 style={{ marginBottom: 8 }}>Couldn't find that medication</h2>
      <p style={{ color: 'var(--muted)', marginBottom: 24 }}>{error}</p>
      <a href="/dashboard" style={{ color: 'var(--brand)' }}>← Search again</a>
    </div>
  );

  if (!drugInfo) return null;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px' }}>
      <a href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--muted)', textDecoration: 'none', fontSize: 14, marginBottom: 24 }}>
        <ArrowLeft size={16} /> Back to search
      </a>

      {/* Header */}
      <div style={{ background: 'white', borderRadius: 16, padding: 28, marginBottom: 20, border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flex: 1 }}>
            <div style={{ width: 52, height: 52, background: 'var(--brand-light)', borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Pill size={26} color="var(--brand)" />
            </div>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>{drugInfo.name}</h1>
              <p style={{ color: 'var(--muted)', fontSize: 14 }}>{drugInfo.genericName} · {drugInfo.drugClass}</p>
            </div>
          </div>

          {/* Listen / Unlock button */}
          <button onClick={handleListen} disabled={audioLoading} style={{
            display: 'flex', alignItems: 'center', gap: 7,
            background: isPlaying ? '#EF4444' : isPremium ? 'var(--brand)' : 'white',
            color: isPremium || isPlaying ? 'white' : 'var(--muted)',
            border: isPremium ? 'none' : '1px solid var(--border)',
            borderRadius: 10, padding: '9px 16px', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', flexShrink: 0, opacity: audioLoading ? 0.7 : 1
          }}>
            {audioLoading ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Loading...</>
              : isPlaying ? <><Square size={15} /> Stop</>
              : isPremium ? <><Volume2 size={15} /> Listen</>
              : <><Lock size={15} /> Unlock Voice</>}
          </button>
        </div>

        <div style={{ marginTop: 18, padding: 16, background: 'var(--brand-light)', borderRadius: 10 }}>
          <p style={{ fontSize: 15, lineHeight: 1.75, color: 'var(--foreground)' }}>{drugInfo.whatItDoes}</p>
        </div>

        {/* Premium upsell — Basic only */}
        {!isPremium && (
          <div style={{ marginTop: 12, padding: '10px 14px', background: '#F8F9FF', borderRadius: 8, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Volume2 size={15} color="var(--brand)" />
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>Voice reading is a <strong style={{ color: 'var(--brand)' }}>Premium</strong> feature</span>
            </div>
            <a href="/pricing?upgrade=true" style={{ fontSize: 12, fontWeight: 700, color: 'var(--brand)', textDecoration: 'none', background: 'var(--brand-light)', padding: '4px 10px', borderRadius: 6 }}>
              Upgrade →
            </a>
          </div>
        )}
      </div>

      {/* Side Effects */}
      <div style={{ background: 'white', borderRadius: 16, padding: 28, marginBottom: 20, border: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>Side effects</h2>
        <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 16 }}>Ranked by how commonly they actually occur</p>

        {drugInfo.sideEffects?.map((se, i) => (
          <div key={i} style={{
            display: 'grid', gridTemplateColumns: '12px 1fr 180px',
            alignItems: 'center', gap: 12,
            padding: '12px 0',
            borderBottom: i < drugInfo.sideEffects.length - 1 ? '1px solid #EEF2F8' : 'none'
          }}>
            {/* Severity dot */}
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: severityDot[se.severity] || '#94A3B8', flexShrink: 0, display: 'inline-block' }} />
            {/* Effect name */}
            <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--foreground)' }}>{se.effect}</span>
            {/* Frequency — right aligned, same indentation */}
            <span style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'right' }}>{se.frequency}</span>
          </div>
        ))}

        {/* Legend */}
        <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid #EEF2F8', display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          {[['#94A3B8', 'Mild'], ['#F59E0B', 'Moderate'], ['#EF4444', 'Severe']].map(([color, label]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--muted)' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block' }} />{label}
            </div>
          ))}
        </div>
      </div>

      {/* Warnings */}
      {drugInfo.warnings?.length > 0 && (
        <div style={{ background: '#FFFBF0', borderRadius: 16, padding: 24, marginBottom: 20, border: '1px solid #FDE68A' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14 }}>
            <AlertTriangle size={18} color="#D97706" />
            <h2 style={{ fontSize: 16, fontWeight: 700 }}>Important warnings</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {drugInfo.warnings.map((w, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, fontSize: 14, lineHeight: 1.65 }}>
                <span style={{ color: '#D97706', fontWeight: 700, flexShrink: 0, marginTop: 1 }}>!</span>
                <span>{w}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* How to take it */}
      <div style={{ background: 'white', borderRadius: 16, padding: 28, marginBottom: 20, border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 18 }}>
          <Info size={18} color="var(--brand)" />
          <h2 style={{ fontSize: 17, fontWeight: 700 }}>How to take it</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { label: 'Dosage', value: drugInfo.dosageInfo },
            { label: 'Take with', value: drugInfo.takeWith },
            { label: 'If you miss a dose', value: drugInfo.missedDose }
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingBottom: i < 2 ? 14 : 0, borderBottom: i < 2 ? '1px solid #EEF2F8' : 'none' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--foreground)' }}>{item.label}</span>
              <span style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.65 }}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div style={{ padding: 16, background: 'var(--background)', borderRadius: 10, border: '1px solid var(--border)', textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>
          This information is for educational purposes only and does not replace advice from your doctor or pharmacist. Always consult a healthcare professional before making changes to your medication.
        </p>
      </div>
    </div>
  );
}

export default function DrugPage() {
  return <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader2 size={24} color="var(--brand)" style={{ animation: 'spin 1s linear infinite' }} /></div>}><DrugPageContent /></Suspense>;
}
