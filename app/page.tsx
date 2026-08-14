'use client';
import { useState } from 'react';
import { Search, Pill, Brain, Shield, ChevronRight, Star, CheckCircle } from 'lucide-react';

export default function Home() {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<'drug' | 'condition'>('drug');

  const handleSearch = () => {
    if (!query.trim()) return;
    if (mode === 'drug') {
      window.location.href = `/drug?q=${encodeURIComponent(query)}`;
    } else {
      window.location.href = `/condition?q=${encodeURIComponent(query)}`;
    }
  };

  return (
    <main style={{ minHeight: '100vh', background: 'var(--background)' }}>
      {/* Nav */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 40px', background: 'white', borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: 36, height: 36, background: 'var(--brand)', borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Pill size={20} color="white" />
          </div>
          <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--foreground)' }}>
            AskMedily
          </span>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <a href="/login" style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: 14 }}>Sign in</a>
          <a href="/signup" style={{
            background: 'var(--brand)', color: 'white', padding: '9px 20px',
            borderRadius: 8, textDecoration: 'none', fontSize: 14, fontWeight: 600
          }}>Start free trial</a>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        maxWidth: 760, margin: '0 auto', padding: '80px 24px 60px',
        textAlign: 'center'
      }}>
        <div className="animate-fade-up" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'var(--brand-light)', color: 'var(--brand)',
          padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600,
          marginBottom: 28
        }}>
          <span style={{
            width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)',
            animation: 'pulse-dot 2s infinite'
          }} />
          Plain English medication information
        </div>

        <h1 className="animate-fade-up" style={{
          fontSize: 'clamp(36px, 6vw, 62px)', fontWeight: 800,
          lineHeight: 1.1, letterSpacing: '-0.03em',
          color: 'var(--foreground)', marginBottom: 20
        }}>
          Understand your<br />
          <span style={{ color: 'var(--brand)' }}>medication</span>, finally.
        </h1>

        <p className="animate-fade-up-delay" style={{
          fontSize: 18, color: 'var(--muted)', maxWidth: 520,
          margin: '0 auto 40px', lineHeight: 1.7
        }}>
          Ask about any drug or condition in plain English. No jargon, no confusion — just clear answers written for real people.
        </p>

        {/* Search Box */}
        <div className="animate-fade-up-delay-2" style={{
          background: 'white', borderRadius: 16, padding: 8,
          boxShadow: '0 4px 24px rgba(0,87,255,0.1)',
          border: '1px solid var(--border)'
        }}>
          {/* Mode Toggle */}
          <div style={{
            display: 'flex', gap: 4, padding: '4px',
            background: 'var(--background)', borderRadius: 10, marginBottom: 8
          }}>
            {(['drug', 'condition'] as const).map((m) => (
              <button key={m} onClick={() => setMode(m)} style={{
                flex: 1, padding: '8px 0', borderRadius: 8, border: 'none',
                cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'all 0.2s',
                background: mode === m ? 'white' : 'transparent',
                color: mode === m ? 'var(--brand)' : 'var(--muted)',
                boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,0.08)' : 'none'
              }}>
                {m === 'drug' ? '💊 Search a Medication' : '🔍 Search a Condition'}
              </button>
            ))}
          </div>

          {/* Input */}
          <div style={{ display: 'flex', gap: 8, padding: '4px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={18} style={{
                position: 'absolute', left: 14, top: '50%',
                transform: 'translateY(-50%)', color: 'var(--muted)'
              }} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder={mode === 'drug' ? 'e.g. Metformin, Atorvastatin, Amoxicillin...' : 'e.g. Type 2 Diabetes, Hypertension...'}
                style={{
                  width: '100%', padding: '13px 14px 13px 42px',
                  border: '1px solid var(--border)', borderRadius: 10,
                  fontSize: 15, outline: 'none', background: 'var(--background)',
                  color: 'var(--foreground)'
                }}
              />
            </div>
            <button onClick={handleSearch} style={{
              background: 'var(--brand)', color: 'white',
              border: 'none', borderRadius: 10, padding: '13px 24px',
              fontSize: 15, fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap'
            }}>
              Ask Medily <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Popular searches */}
        <div style={{ marginTop: 20, display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          {['Metformin', 'Atorvastatin', 'Lisinopril', 'Omeprazole', 'Amoxicillin'].map(drug => (
            <button key={drug} onClick={() => { setQuery(drug); setMode('drug'); }} style={{
              background: 'white', border: '1px solid var(--border)',
              borderRadius: 20, padding: '5px 14px', fontSize: 13,
              cursor: 'pointer', color: 'var(--muted)', transition: 'all 0.2s'
            }}>
              {drug}
            </button>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{
        maxWidth: 1100, margin: '0 auto', padding: '60px 24px',
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20
      }}>
        {[
          {
            icon: <Pill size={24} color="var(--brand)" />,
            title: 'Plain English Drug Pages',
            desc: 'Every medication explained simply — what it does, side effects ranked by how common they actually are, and what to watch out for.'
          },
          {
            icon: <Brain size={24} color="var(--accent)" />,
            title: 'AI Condition Agent',
            desc: 'Tell us your diagnosis and our AI will guide you through likely medications prescribed in your country, asking the right questions first.'
          },
          {
            icon: <Shield size={24} color="#FF6B35" />,
            title: 'Safe & Trustworthy',
            desc: 'Built by pharmacy professionals. Information sourced from NHS, FDA, and peer-reviewed guidelines. Always updated.'
          }
        ].map((f, i) => (
          <div key={i} style={{
            background: 'white', borderRadius: 16, padding: 28,
            border: '1px solid var(--border)'
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12, background: 'var(--background)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16
            }}>
              {f.icon}
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10 }}>{f.title}</h3>
            <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.7 }}>{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Pricing */}
      <section style={{
        maxWidth: 800, margin: '0 auto', padding: '60px 24px',
        textAlign: 'center'
      }}>
        <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>Simple pricing</h2>
        <p style={{ color: 'var(--muted)', marginBottom: 40 }}>Start free for 2 days, then choose your plan</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {[
            {
              name: 'Basic', price: '£4.99', period: '/month',
              features: ['Drug search & plain English pages', 'Side effects ranked by frequency', 'Drug interaction checker', 'NHS & FDA sourced information'],
              cta: 'Start 2-day free trial', highlight: false
            },
            {
              name: 'Premium', price: '£9.99', period: '/month',
              features: ['Everything in Basic', 'AI Condition Agent', 'Personalised medication history', 'Priority support', 'Early access to new features'],
              cta: 'Start 2-day free trial', highlight: true
            }
          ].map((plan, i) => (
            <div key={i} style={{
              background: plan.highlight ? 'var(--brand)' : 'white',
              color: plan.highlight ? 'white' : 'var(--foreground)',
              borderRadius: 16, padding: 28, border: '1px solid var(--border)',
              textAlign: 'left', position: 'relative'
            }}>
              {plan.highlight && (
                <div style={{
                  position: 'absolute', top: -12, right: 20,
                  background: 'var(--accent)', color: 'white',
                  padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600
                }}>
                  Most Popular
                </div>
              )}
              <p style={{ fontSize: 14, fontWeight: 600, opacity: 0.8, marginBottom: 8 }}>{plan.name}</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 20 }}>
                <span style={{ fontSize: 36, fontWeight: 800 }}>{plan.price}</span>
                <span style={{ opacity: 0.7 }}>{plan.period}</span>
              </div>
              <ul style={{ listStyle: 'none', marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {plan.features.map((f, j) => (
                  <li key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 14 }}>
                    <CheckCircle size={16} style={{ marginTop: 2, flexShrink: 0, opacity: plan.highlight ? 1 : undefined, color: plan.highlight ? 'white' : 'var(--accent)' }} />
                    {f}
                  </li>
                ))}
              </ul>
              <a href="/signup" style={{
                display: 'block', textAlign: 'center',
                background: plan.highlight ? 'white' : 'var(--brand)',
                color: plan.highlight ? 'var(--brand)' : 'white',
                padding: '12px', borderRadius: 10, textDecoration: 'none',
                fontWeight: 600, fontSize: 14
              }}>
                {plan.cta}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border)', padding: '24px 40px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        color: 'var(--muted)', fontSize: 13
      }}>
        <span>© 2026 AskMedily. For informational purposes only — not medical advice.</span>
        <div style={{ display: 'flex', gap: 20 }}>
          <a href="/privacy" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Privacy</a>
          <a href="/terms" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Terms</a>
        </div>
      </footer>
    </main>
  );
}
