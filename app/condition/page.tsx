'use client';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { Brain, Send, ArrowLeft, Pill, Loader2, ChevronRight, AlertCircle, Heart, Activity, Stethoscope } from 'lucide-react';

interface ConditionInfo {
  name: string;
  category: string;
  description: string;
  symptoms: string[];
  causes: string[];
  commonly_prescribed_drugs: string[];
  drug_slugs: string[];
  lifestyle_tips: string[];
  when_to_see_gp: string;
  source: string;
}

interface Message {
  role: 'agent' | 'user';
  content: string;
  drugLinks?: { name: string; url: string }[];
}

const categoryColors: Record<string, string> = {
  'Cardiovascular': '#FF6B6B',
  'Respiratory': '#4ECDC4',
  'Mental Health': '#9B59B6',
  'Diabetes': '#F39C12',
  'Musculoskeletal': '#27AE60',
  'Neurological': '#3498DB',
  'Gastrointestinal': '#E67E22',
  'Dermatological': '#1ABC9C',
  'Endocrine': '#E74C3C',
  'Urological': '#2980B9',
};

function ConditionPageContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [conditionInfo, setConditionInfo] = useState<ConditionInfo | null>(null);
  const [loadingInfo, setLoadingInfo] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [agentLoading, setAgentLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<{ role: string; content: string }[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'agent'>('overview');

  useEffect(() => {
    if (query) {
      fetchConditionInfo(query);
      startAgent(query);
    }
  }, [query]);

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
    } catch {}
    setLoadingInfo(false);
  };

  const startAgent = async (condition: string) => {
    setAgentLoading(true);
    const systemPrompt = `You are MedilyAgent, a friendly UK pharmacy expert. The user has been diagnosed with or is asking about: ${condition}.

Ask ONE question at a time to personalise their medication information:
1. Which country are they in? (affects prescribing guidelines)
2. Have they been prescribed anything yet by their GP?
3. How long have they had this condition?
4. Any allergies to medications?

After 3-4 questions, tell them which medications are most commonly prescribed in the UK for their situation, then offer to show them the plain English drug page for each one.

Format drug suggestions as JSON at the end: {"drugLinks": [{"name": "Drug Name", "url": "/drug?q=Drug Name"}]}

Rules:
- ONE question at a time
- Plain English only
- Always say "your doctor may prescribe" not "you should take"
- Keep each message to 2-3 sentences maximum
- Be warm and reassuring`;

    const history = [{ role: 'user', content: `I want to understand more about: ${condition}` }];
    
    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, systemPrompt })
      });
      const data = await res.json();
      let content = data.response;
      let drugLinks: { name: string; url: string }[] | undefined;
      const jsonMatch = content.match(/\{"drugLinks":[^}]+\}/s);
      if (jsonMatch) {
        try { drugLinks = JSON.parse(jsonMatch[0]).drugLinks; } catch {}
        content = content.replace(jsonMatch[0], '').trim();
      }
      setMessages([{ role: 'agent', content, drugLinks }]);
      setConversationHistory([...history, { role: 'assistant', content: data.response }]);
    } catch {
      setMessages([{ role: 'agent', content: "Hello! I'm here to help you understand your medication options. Could you tell me which country you're in?" }]);
    }
    setAgentLoading(false);
  };

  const sendMessage = async () => {
    if (!input.trim() || agentLoading) return;
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
      let content = data.response;
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

  const categoryColor = conditionInfo ? (categoryColors[conditionInfo.category] || 'var(--brand)') : 'var(--brand)';

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '24px', minHeight: '100vh' }}>
      <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--muted)', textDecoration: 'none', fontSize: 14, marginBottom: 20 }}>
        <ArrowLeft size={16} /> Back to search
      </a>

      {/* Header */}
      <div style={{ background: 'white', borderRadius: 16, padding: 24, marginBottom: 16, border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <div style={{ width: 52, height: 52, background: `${categoryColor}20`, borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Stethoscope size={24} color={categoryColor} />
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>{query}</h1>
            {conditionInfo && (
              <div style={{ display: 'inline-block', background: `${categoryColor}20`, color: categoryColor, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                {conditionInfo.category}
              </div>
            )}
          </div>
        </div>
        {conditionInfo && (
          <p style={{ marginTop: 16, fontSize: 15, lineHeight: 1.7, color: 'var(--foreground)', padding: '14px', background: 'var(--background)', borderRadius: 10 }}>
            {conditionInfo.description}
          </p>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: 'white', borderRadius: 12, padding: 4, marginBottom: 16, border: '1px solid var(--border)' }}>
        {[
          { key: 'overview', label: '📋 Condition Overview' },
          { key: 'agent', label: '🤖 Ask MedilyAgent' }
        ].map(tab => (
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
              {/* Symptoms */}
              <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid var(--border)' }}>
                <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Activity size={18} color="var(--brand)" /> Common symptoms
                </h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {conditionInfo.symptoms.map((s, i) => (
                    <span key={i} style={{ background: 'var(--background)', border: '1px solid var(--border)', borderRadius: 20, padding: '6px 14px', fontSize: 13 }}>{s}</span>
                  ))}
                </div>
              </div>

              {/* Commonly Prescribed Drugs */}
              <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid var(--border)' }}>
                <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Pill size={18} color="var(--brand)" /> Commonly prescribed medications
                </h2>
                <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 14 }}>Your doctor will decide what's right for you — these are commonly used in the UK for this condition.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {conditionInfo.commonly_prescribed_drugs.map((drug, i) => (
                    <a key={i} href={`/drug?q=${drug}`} style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px',
                      background: 'var(--background)', borderRadius: 10, textDecoration: 'none',
                      color: 'var(--foreground)', border: '1px solid var(--border)', transition: 'all 0.2s'
                    }}>
                      <div style={{ width: 32, height: 32, background: 'var(--brand-light)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Pill size={15} color="var(--brand)" />
                      </div>
                      <span style={{ fontWeight: 600, fontSize: 14, flex: 1 }}>{drug}</span>
                      <span style={{ fontSize: 12, color: 'var(--muted)' }}>View →</span>
                    </a>
                  ))}
                </div>
              </div>

              {/* Lifestyle Tips */}
              {conditionInfo.lifestyle_tips?.length > 0 && (
                <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid var(--border)' }}>
                  <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Heart size={18} color="var(--accent)" /> Lifestyle tips
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {conditionInfo.lifestyle_tips.map((tip, i) => (
                      <div key={i} style={{ display: 'flex', gap: 10, fontSize: 14, lineHeight: 1.6 }}>
                        <span style={{ color: 'var(--accent)', fontWeight: 700, flexShrink: 0 }}>✓</span>{tip}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* When to see GP */}
              {conditionInfo.when_to_see_gp && (
                <div style={{ background: '#FFF8F0', borderRadius: 16, padding: 24, border: '1px solid #FFD4A3' }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
                    <AlertCircle size={18} color="#FF9500" />
                    <h2 style={{ fontSize: 16, fontWeight: 700 }}>When to see your GP</h2>
                  </div>
                  <p style={{ fontSize: 14, lineHeight: 1.7 }}>{conditionInfo.when_to_see_gp}</p>
                </div>
              )}
            </>
          ) : (
            <div style={{ background: 'white', borderRadius: 16, padding: 40, border: '1px solid var(--border)', textAlign: 'center' }}>
              <p style={{ color: 'var(--muted)' }}>Could not load condition information.</p>
            </div>
          )}
        </div>
      )}

      {/* Agent Tab */}
      {activeTab === 'agent' && (
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden' }}>
          {/* Agent Header */}
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

          {/* Messages */}
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
                        <a key={j} href={drug.url} style={{
                          display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
                          background: 'white', borderRadius: 8, textDecoration: 'none',
                          color: 'var(--brand)', fontSize: 13, fontWeight: 600, border: '1px solid var(--border)'
                        }}>
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

          {/* Input */}
          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Type your answer..."
              style={{ flex: 1, border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', fontSize: 14, outline: 'none', background: 'var(--background)' }}
            />
            <button onClick={sendMessage} disabled={agentLoading} style={{
              background: 'var(--brand)', border: 'none', borderRadius: 10, padding: '10px 14px',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: agentLoading ? 0.5 : 1
            }}>
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
  return <Suspense><ConditionPageContent /></Suspense>;
}
