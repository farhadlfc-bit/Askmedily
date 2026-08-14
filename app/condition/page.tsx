'use client';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { Brain, Send, ArrowLeft, Pill, Loader2, ChevronRight } from 'lucide-react';

interface Message {
  role: 'agent' | 'user';
  content: string;
  options?: string[];
  drugLinks?: { name: string; url: string }[];
}

function ConditionPageContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<{ role: string; content: string }[]>([]);

  useEffect(() => {
    if (query) {
      startConversation(query);
    }
  }, [query]);

  const startConversation = async (condition: string) => {
    setLoading(true);
    const systemPrompt = `You are MedilyAgent, a friendly and knowledgeable medication guide. A user has told you they have or have been diagnosed with: ${condition}.

Your job is to ask ONE question at a time to understand their situation better, then guide them to relevant medication information.

Ask questions like:
- Which country they are in (affects which medications are prescribed)
- Whether their GP has prescribed anything yet
- How long they've had the condition
- Their age group (child, adult, elderly)

After 3-4 questions, summarise the most likely medications prescribed for their situation and offer to show them the drug page for each one.

IMPORTANT: 
- Ask only ONE question at a time
- Be warm, clear, and use plain English
- Never diagnose or recommend specific medications as medical advice
- Always say "your doctor may prescribe" not "you should take"
- End each response with a JSON block like this if suggesting drugs: {"drugLinks": [{"name": "Metformin", "url": "/drug?q=Metformin"}]}`;

    const initialMessage = { role: 'user', content: `I have been diagnosed with: ${condition}` };
    const history = [initialMessage];

    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, systemPrompt })
      });
      const data = await res.json();
      
      let content = data.response;
      let drugLinks: { name: string; url: string }[] | undefined;

      const jsonMatch = content.match(/\{"drugLinks":[^}]+\}/);
      if (jsonMatch) {
        try { drugLinks = JSON.parse(jsonMatch[0]).drugLinks; } catch {}
        content = content.replace(jsonMatch[0], '').trim();
      }

      setMessages([{ role: 'agent', content, drugLinks }]);
      setConversationHistory([...history, { role: 'assistant', content: data.response }]);
    } catch {
      setMessages([{ role: 'agent', content: "I'm sorry, I had trouble loading. Please refresh and try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMessage = input.trim();
    setInput('');

    const newMessages = [...messages, { role: 'user' as const, content: userMessage }];
    setMessages(newMessages);

    const newHistory = [...conversationHistory, { role: 'user', content: userMessage }];
    setLoading(true);

    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newHistory })
      });
      const data = await res.json();

      let content = data.response;
      let drugLinks: { name: string; url: string }[] | undefined;
      const jsonMatch = content.match(/\{"drugLinks":[^}]+\}/);
      if (jsonMatch) {
        try { drugLinks = JSON.parse(jsonMatch[0]).drugLinks; } catch {}
        content = content.replace(jsonMatch[0], '').trim();
      }

      setMessages([...newMessages, { role: 'agent', content, drugLinks }]);
      setConversationHistory([...newHistory, { role: 'assistant', content: data.response }]);
    } catch {
      setMessages([...newMessages, { role: 'agent', content: "Sorry, something went wrong. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 24px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--muted)', textDecoration: 'none', fontSize: 14, marginBottom: 24 }}>
        <ArrowLeft size={16} /> Back to search
      </a>

      {/* Header */}
      <div style={{ background: 'white', borderRadius: 16, padding: 20, marginBottom: 16, border: '1px solid var(--border)', display: 'flex', gap: 14, alignItems: 'center' }}>
        <div style={{ width: 44, height: 44, background: 'var(--brand-light)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Brain size={22} color="var(--brand)" />
        </div>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700, marginBottom: 2 }}>MedilyAgent</h1>
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>Asking about: <strong>{query}</strong></p>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--accent)', background: '#E8FBF5', padding: '4px 10px', borderRadius: 20 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }} />
          Online
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '80%', padding: '12px 16px', borderRadius: msg.role === 'agent' ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
              background: msg.role === 'agent' ? 'white' : 'var(--brand)',
              color: msg.role === 'agent' ? 'var(--foreground)' : 'white',
              border: msg.role === 'agent' ? '1px solid var(--border)' : 'none',
              fontSize: 14, lineHeight: 1.7
            }}>
              {msg.content}
              {msg.drugLinks && msg.drugLinks.length > 0 && (
                <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {msg.drugLinks.map((drug, j) => (
                    <a key={j} href={drug.url} style={{
                      display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
                      background: 'var(--brand-light)', borderRadius: 8, textDecoration: 'none',
                      color: 'var(--brand)', fontSize: 13, fontWeight: 600
                    }}>
                      <Pill size={14} /> {drug.name} <ChevronRight size={14} style={{ marginLeft: 'auto' }} />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '12px 16px', background: 'white', borderRadius: '4px 16px 16px 16px', border: '1px solid var(--border)', width: 'fit-content' }}>
            <Loader2 size={14} color="var(--muted)" style={{ animation: 'spin 1s linear infinite' }} />
            <span style={{ fontSize: 13, color: 'var(--muted)' }}>Medily is thinking...</span>
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{ background: 'white', borderRadius: 14, padding: 8, border: '1px solid var(--border)', display: 'flex', gap: 8 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type your answer..."
          style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14, padding: '8px 10px', background: 'transparent', color: 'var(--foreground)' }}
        />
        <button onClick={sendMessage} disabled={loading} style={{
          background: 'var(--brand)', border: 'none', borderRadius: 10, padding: '10px 14px',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: loading ? 0.5 : 1
        }}>
          <Send size={16} color="white" />
        </button>
      </div>

      <p style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center', marginTop: 12 }}>
        For educational purposes only. Not medical advice. Always consult your GP or pharmacist.
      </p>
    </div>
  );
}

export default function ConditionPage() {
  return <Suspense><ConditionPageContent /></Suspense>;
}
