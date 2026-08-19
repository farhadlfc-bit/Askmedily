'use client';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { Brain, Send, ArrowLeft, Pill, Loader2, ChevronRight, AlertCircle, Heart, Activity, Stethoscope, Volume2, Square, Lock } from 'lucide-react';
import { createClient } from '@/lib/supabase';

interface Message {
  role: 'agent' | 'user';
  content: string;
  drugLinks?: { name: string; url: string }[];
}

function ConditionPageContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [agentLoading, setAgentLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<{ role: string; content: string }[]>([]);
  const [conditionInfo, setConditionInfo] = useState<any>(null);
  const [loadingInfo, setLoadingInfo] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'agent'>('overview');
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

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
    if (authChecked && query) {
      fetchConditionInfo(query);
    }
  }, [authChecked, query]);

  const fetchConditionInfo = async (condition: string) => {
    setLoadingInfo(true);
    try {
      const res = await fetch('/api/condition-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conditionName: condition })
      });
      const data = await res.json();
      if (!data.error) setConditionInfo(data);
    } catch (e) {
      console.error('Failed to load condition info', e);
    }
    setLoadingInfo(false);
  };

  const startAgent = async (condition: string) => {
    if (!isPremium) return;
    setAgentLoading(true);
    const systemPrompt = `You are MedilyAgent, a friendly UK pharmacy expert. The user has been diagnosed with or is asking about: ${condition}.
Ask ONE question at a time to personalise their medication information:
1. Which country are they in?
2. Have they been prescribed anything yet by their GP?
3. How long have they had this condition?
4. Any allergies to medications?
After 3-4 questions, tell them which medications are most commonly prescribed in the UK for their situation.
Format drug suggestions as JSON at the end: {"drugLinks": [{"name": "Drug Name", "url": "/drug?q=Drug Name"}]}
Rules: ONE question at a time, plain English only, always say "your doctor may prescribe", keep messages to 2-3 sentences, be warm and reassuring.`;

    const history = [{ role: 'user', content: `I want to understand more about: ${condition}` }];
    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, systemPrompt })
      });
      const data = await res.json();
      let content = data.response || '';
      let drugLinks: { name: string; url: string }[] | undefined;
      const jsonMatch = content.match(/\{"drugLinks":[^}]+\}/s);
      if (jsonMatch) {
        try { drugLinks = JSON.parse(jsonMatch[0]).drugLinks; } catch {}
        content = content.replace(jsonMatch[0], '').trim();
      }
      setMessages([{ role: 'agent', content, drugLinks }]);
      setConversationHistory([...history, { role: 'assistant', content: data.response }]);
    } catch {
      setMessages([{ role: 'agent', content: "Hello! I'm here to help you understand your medication options. Which country are you in?" }]);
    }
    setAgentLoading(false);
  };

  const sendMessage = async () => {
    if (!input.trim() || agentLoading || !isPremium) return;
    const userMessage = input.trim();
    setInput('');
    const newMessages = [...messages, { role: 'user' as const, content: userMessage }];
    setMessages(newMessages);
    const newHistory = [...conversationHistory, { role: 'user', content: userMessage }];
    setAgentLoading(true);
    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newHistory })
      });
      const data = await res.json();
      let content = data.response || '';
      let drugLinks: { name: string; url: string }[] | undefined;
      const jsonMatch = content.match(/\{"drugLinks":[^}]+\}/s);
      if (jsonMatch) {
        try { drugLinks = JSON.parse(jsonMatch[0]).drugLinks; } catch {}
        content = content.replace(jsonMatch[0], '').trim();
      }
      setMessages([...newMessages, { role: 'agent', content, drugLinks }]);
      setConversationHistory([...newHistory, { role: 'assistant', content: data.response }]);
    } catch {
      setMessages([...newMessages, { role: 'agent', content: "Sorry, something went wrong. Please try again." }]);
    }
    setAgentLoading(false);
  };

  const handleListen = async () => {
    if (!conditionInfo) return;
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
    const text = `${conditionInfo.name}. ${conditionInfo.description} Common symptoms include: ${conditionInfo.symptoms?.join(', ')}. Commonly prescribed medications include: ${conditionInfo.commonly_prescribed_drugs?.join(', ')}. ${conditionInfo.when_to_see_gp ? `When to see your GP: ${conditionInfo.when_to_see_gp}` : ''} This information is for educational purposes only.`.trim();
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

  if (!authChecked) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 40, height: 40, border: '3px solid var(--brand-light)', borderTopColor: 'var(--brand)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
    </div>
  );

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '24px', minHeight: '100vh' }}>
      <a href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--muted)', textDecoration: 'none', fontSize: 14, marginBottom: 20 }}>
        <ArrowLeft size={16} /> Back to dashboard
      </a>

      {/* Header */}
      <div style={{ background: 'white', borderRadius: 16, padding: 24, marginBottom: 16, border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <div style={{ width: 52, height: 52, background: 'var(--brand-light)', borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Stethoscope size={24} color="var(--brand)" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>{query || 'Condition Search'}</h1>
              <button onClick={handleListen} disabled={audioLoading || loadingInfo} style={{
                display: 'flex', alignItems: 'center', gap: 7,
                background: isPlaying ? '#EF4444' : isPremium ? 'var(--brand)' : 'white',
                color: isPremium || isPlaying ? 'white' : 'var(--muted)',
                border: isPremium ? 'none' : '1px solid var(--border)',
                borderRadius: 10, padding: '9px 16px', fontSize: 13, fontWeight: 600,
                cursor: 'pointer', flexShrink: 0, opacity: (audioLoading || loadingInfo) ? 0.7 : 1
              }}>
                {audioLoading ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Loading...</>
                  : isPlaying ? <><Square size={15} /> Stop</>
                  : isPremium ? <><Volume2 size={15} /> Listen</>
                  : <><Lock size={15} /> Unlock Voice</>}
              </button>
            </div>
            {conditionInfo?.category && (
              <div style={{ display: 'inline-block', background: 'var(--brand-light)', color: 'var(--brand)', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                {conditionInfo.category}
              </div>
            )}
          </div>
        </div>
        {conditionInfo?.description && (
          <p style={{ marginTop: 16, fontSize: 15, lineHeight: 1.7, padding: '14px', background: 'var(--background)', borderRadius: 10 }}>
            {conditionInfo.description}
          </p>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: 'white', borderRadius: 12, padding: 4, marginBottom: 16, border: '1px solid var(--border)' }}>
        {[
          { key: 'overview', label: '📋 Condition Overview' },
          { key: 'agent', label: isPremium ? '🤖 Ask MedilyAgent' : '🔒 MedilyAgent — Premium' }
        ].map(tab => (
          <button key={tab.key} onClick={() => {
            if (tab.key === 'agent' && !isPremium) {
              if (confirm('MedilyAgent is a Premium feature — £9.99/month. Upgrade now?')) {
                window.location.href = '/pricing?upgrade=true';
              }
              return;
            }
            setActiveTab(tab.key as any);
            if (tab.key === 'agent' && isPremium && messages.length === 0) {
              startAgent(query);
            }
          }} style={{
            flex: 1, padding: '10px', borderRadius: 9, border: 'none', cursor: 'pointer',
            fontSize: 14, fontWeight: 600, transition: 'all 0.2s',
            background: activeTab === tab.key ? 'var(--brand)' : 'transparent',
            color: activeTab === tab.key ? 'white' : tab.key === 'agent' && !isPremium ? 'var(--muted)' : 'var(--muted)'
          }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {loadingInfo ? (
            <div style={{ background: 'white', borderRadius: 16, padding: 40, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
              <Loader2 size={20} color="var(--brand)" style={{ animation: 'spin 1s linear infinite' }} />
              <span style={{ color: 'var(--muted)' }}>Loading condition information...</span>
            </div>
          ) : conditionInfo ? (
            <>
              {conditionInfo.symptoms?.length > 0 && (
                <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid var(--border)' }}>
                  <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Activity size={18} color="var(--brand)" /> Common symptoms
                  </h2>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {conditionInfo.symptoms.map((s: string, i: number) => (
                      <span key={i} style={{ background: 'var(--background)', border: '1px solid var(--border)', borderRadius: 20, padding: '6px 14px', fontSize: 13 }}>{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {conditionInfo.commonly_prescribed_drugs?.length > 0 && (
                <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid var(--border)' }}>
                  <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Pill size={18} color="var(--brand)" /> Commonly prescribed medications
                  </h2>
                  <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 14 }}>Your doctor will decide what's right for you.</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {conditionInfo.commonly_prescribed_drugs.map((drug: string, i: number) => (
                      <a key={i} href={`/drug?q=${drug}`} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: 'var(--background)', borderRadius: 10, textDecoration: 'none', color: 'var(--foreground)', border: '1px solid var(--border)' }}>
                        <div style={{ width: 32, height: 32, background: 'var(--brand-light)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Pill size={15} color="var(--brand)" />
                        </div>
                        <span style={{ fontWeight: 600, fontSize: 14, flex: 1 }}>{drug}</span>
                        <span style={{ fontSize: 12, color: 'var(--muted)' }}>View →</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {conditionInfo.lifestyle_tips?.length > 0 && (
                <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid var(--border)' }}>
                  <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Heart size={18} color="var(--accent)" /> Lifestyle tips
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {conditionInfo.lifestyle_tips.map((tip: string, i: number) => (
                      <div key={i} style={{ display: 'flex', gap: 10, fontSize: 14, lineHeight: 1.6 }}>
                        <span style={{ color: 'var(--accent)', fontWeight: 700, flexShrink: 0 }}>✓</span>{tip}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {conditionInfo.when_to_see_gp && (
                <div style={{ background: '#FFFBF0', borderRadius: 16, padding: 24, border: '1px solid #FDE68A' }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
                    <AlertCircle size={18} color="#D97706" />
                    <h2 style={{ fontSize: 16, fontWeight: 700 }}>When to see your GP</h2>
                  </div>
                  <p style={{ fontSize: 14, lineHeight: 1.7 }}>{conditionInfo.when_to_see_gp}</p>
                </div>
              )}

              {/* Premium upsell for agent */}
              {!isPremium && (
                <div style={{ background: 'var(--brand-light)', borderRadius: 12, padding: '16px 20px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--brand)', marginBottom: 2 }}>🤖 Want personalised medication guidance?</p>
                    <p style={{ fontSize: 13, color: 'var(--muted)' }}>MedilyAgent asks you questions and guides you to the right medications. Premium feature.</p>
                  </div>
                  <a href="/pricing?upgrade=true" style={{ background: 'var(--brand)', color: 'white', padding: '8px 16px', borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap' }}>
                    Upgrade →
                  </a>
                </div>
              )}
            </>
          ) : (
            <div style={{ background: 'white', borderRadius: 16, padding: 40, border: '1px solid var(--border)', textAlign: 'center' }}>
              <p style={{ color: 'var(--muted)' }}>Could not load condition information. Try the AI Agent tab instead.</p>
            </div>
          )}
        </div>
      )}

      {/* Agent Tab — Premium only */}
      {activeTab === 'agent' && isPremium && (
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, background: 'var(--brand-light)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Brain size={18} color="var(--brand)" />
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: 14 }}>MedilyAgent</p>
              <p style={{ fontSize: 12, color: 'var(--muted)' }}>Personalised medication guidance</p>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--accent)', background: '#E8FBF5', padding: '3px 10px', borderRadius: 20 }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)' }} /> Online
            </div>
          </div>

          <div style={{ padding: 16, minHeight: 300, maxHeight: 400, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '82%', padding: '11px 15px',
                  borderRadius: msg.role === 'agent' ? '4px 14px 14px 14px' : '14px 4px 14px 14px',
                  background: msg.role === 'agent' ? 'var(--background)' : 'var(--brand)',
                  color: msg.role === 'agent' ? 'var(--foreground)' : 'white',
                  fontSize: 14, lineHeight: 1.7
                }}>
                  {msg.content}
                  {msg.drugLinks && msg.drugLinks.length > 0 && (
                    <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {msg.drugLinks.map((drug, j) => (
                        <a key={j} href={drug.url} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'white', borderRadius: 8, textDecoration: 'none', color: 'var(--brand)', fontSize: 13, fontWeight: 600, border: '1px solid var(--border)' }}>
                          <Pill size={13} /> {drug.name} <ChevronRight size={13} style={{ marginLeft: 'auto' }} />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {agentLoading && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '11px 15px', background: 'var(--background)', borderRadius: '4px 14px 14px 14px', width: 'fit-content' }}>
                <Loader2 size={13} color="var(--muted)" style={{ animation: 'spin 1s linear infinite' }} />
                <span style={{ fontSize: 13, color: 'var(--muted)' }}>Thinking...</span>
              </div>
            )}
          </div>

          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Type your answer..."
              style={{ flex: 1, border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', fontSize: 14, outline: 'none', background: 'var(--background)' }}
            />
            <button onClick={sendMessage} disabled={agentLoading} style={{ background: 'var(--brand)', border: 'none', borderRadius: 10, padding: '10px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: agentLoading ? 0.5 : 1 }}>
              <Send size={16} color="white" />
            </button>
          </div>
        </div>
      )}

      <p style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center', marginTop: 16, lineHeight: 1.6 }}>
        For educational purposes only. Not medical advice. Always consult your GP or pharmacist.
      </p>
    </div>
  );
}

export default function ConditionPage() {
  return <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader2 size={24} color="var(--brand)" style={{ animation: 'spin 1s linear infinite' }} /></div>}><ConditionPageContent /></Suspense>;
}
