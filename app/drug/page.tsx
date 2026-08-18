'use client';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { Pill, AlertTriangle, CheckCircle, Info, ArrowLeft, Loader2, Volume2, Square } from 'lucide-react';
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
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = '/login';
        return;
      }
      setAuthChecked(true);
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (authChecked && query) {
      fetchDrugInfo(query);
    }
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

    // Stop if already playing
    if (isPlaying && currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setIsPlaying(false);
      setCurrentAudio(null);
      return;
    }

    // Check voice settings
    const voiceEnabled = localStorage.getItem('askmedily_voice_enabled');
    if (voiceEnabled === 'false') {
      alert('Voice is disabled. Go to Settings to enable it.');
      return;
    }

    const voiceId = localStorage.getItem('askmedily_voice_id') || '21m00Tcm4TlvDq8ikWAM';
    const speed = parseFloat(localStorage.getItem('askmedily_reading_speed') || '1');

    // Build the text to read
    const text = `
      ${drugInfo.name}. ${drugInfo.genericName ? `Also known as ${drugInfo.genericName}.` : ''}
      ${drugInfo.whatItDoes}
      How it works: ${drugInfo.howItWorks}
      Common uses: ${drugInfo.commonUses?.join(', ')}.
      Important warnings: ${drugInfo.warnings?.join('. ')}.
      How to take it: ${drugInfo.dosageInfo}. ${drugInfo.takeWith}.
      If you miss a dose: ${drugInfo.missedDose}.
      This information is for educational purposes only. Always consult your doctor or pharmacist before making any changes to your medication.
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

  const severityColor = { mild: '#00C48C', moderate: '#FF9500', severe: '#FF4444' };
  const frequencyWidth = (freq: string) => {
    if (freq.includes('Very common') || freq.includes('>10%') || freq.includes('1 in 10')) return '80%';
    if (freq.includes('Common') || freq.includes('1-10%')) return '50%';
    if (freq.includes('Uncommon') || freq.includes('0.1-1%')) return '25%';
    return '10%';
  };

  if (!authChecked) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 40, height: 40, border: '3px solid var(--brand-light)', borderTopColor: 'var(--brand)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
    </div>
  );

  if (loading) return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <div style={{ width: 48, height: 48, background: 'var(--brand-light)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={24} color="var(--brand)" style={{ animation: 'spin 1s linear infinite' }} />
      </div>
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
            <div style={{ width: 56, height: 56, background: 'var(--brand-light)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Pill size={28} color="var(--brand)" />
            </div>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>{drugInfo.name}</h1>
              <p style={{ color: 'var(--muted)', fontSize: 14 }}>{drugInfo.genericName} · {drugInfo.drugClass}</p>
            </div>
          </div>

          {/* Listen Button */}
          <button
            onClick={handleListen}
            disabled={audioLoading}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: isPlaying ? '#FF4444' : 'var(--brand)',
              color: 'white', border: 'none', borderRadius: 10,
              padding: '10px 16px', fontSize: 14, fontWeight: 600,
              cursor: 'pointer', flexShrink: 0,
              opacity: audioLoading ? 0.7 : 1
            }}
          >
            {audioLoading
              ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Loading...</>
              : isPlaying
              ? <><Square size={16} /> Stop</>
              : <><Volume2 size={16} /> Listen</>
            }
          </button>
        </div>

        <div style={{ marginTop: 20, padding: 18, background: 'var(--brand-light)', borderRadius: 10 }}>
          <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--foreground)' }}>{drugInfo.whatItDoes}</p>
        </div>
      </div>

      {/* Side Effects */}
      <div style={{ background: 'white', borderRadius: 16, padding: 28, marginBottom: 20, border: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Side effects</h2>
        <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 20 }}>Ranked by how commonly they actually occur</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {drugInfo.sideEffects?.map((se, i) => (
            <div key={i}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: severityColor[se.severity] || '#00C48C', flexShrink: 0 }} />
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{se.effect}</span>
                </div>
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>{se.frequency}</span>
              </div>
              <div style={{ height: 6, background: 'var(--background)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: frequencyWidth(se.frequency), background: severityColor[se.severity] || '#00C48C', borderRadius: 3 }} />
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {[['#00C48C', 'Mild'], ['#FF9500', 'Moderate'], ['#FF4444', 'Severe']].map(([color, label]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--muted)' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />{label}
            </div>
          ))}
        </div>
      </div>

      {/* Warnings */}
      {drugInfo.warnings?.length > 0 && (
        <div style={{ background: '#FFF8F0', borderRadius: 16, padding: 28, marginBottom: 20, border: '1px solid #FFD4A3' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16 }}>
            <AlertTriangle size={20} color="#FF9500" />
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>Important warnings</h2>
          </div>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {drugInfo.warnings.map((w, i) => (
              <li key={i} style={{ display: 'flex', gap: 10, fontSize: 14, lineHeight: 1.6 }}>
                <span style={{ color: '#FF9500', fontWeight: 700, flexShrink: 0 }}>!</span>{w}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* How to take it */}
      <div style={{ background: 'white', borderRadius: 16, padding: 28, marginBottom: 20, border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16 }}>
          <Info size={20} color="var(--brand)" />
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>How to take it</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { label: 'DOSAGE', value: drugInfo.dosageInfo },
            { label: 'TAKE WITH', value: drugInfo.takeWith },
            { label: 'IF YOU MISS A DOSE', value: drugInfo.missedDose }
          ].map((item, i) => (
            <div key={i} style={{ padding: 14, background: 'var(--background)', borderRadius: 10 }}>
              <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>{item.label}</p>
              <p style={{ fontSize: 14, lineHeight: 1.6 }}>{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Settings link */}
      <div style={{ padding: 16, background: 'var(--background)', borderRadius: 10, border: '1px solid var(--border)', textAlign: 'center', marginBottom: 16 }}>
        <p style={{ fontSize: 13, color: 'var(--muted)' }}>
          Want to change the voice or reading speed? <a href="/settings" style={{ color: 'var(--brand)', fontWeight: 600, textDecoration: 'none' }}>Go to Settings →</a>
        </p>
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
