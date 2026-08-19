'use client';
import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase';
import { Pill, ArrowLeft, Plus, Camera, Loader2, Trash2, Calendar, Clock, X, Check } from 'lucide-react';

interface MedEntry {
  id: string;
  drug_name: string;
  strength: string;
  dose: string;
  frequency: string;
  start_date: string;
  end_date: string;
  notes: string;
  added_by: string;
  created_at: string;
}

export default function MedHistory() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<MedEntry[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const [form, setForm] = useState({
    drug_name: '', strength: '', dose: '', frequency: '',
    start_date: '', end_date: '', notes: ''
  });

  useEffect(() => {
    const init = async () => {
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
        if (profile.plan !== 'premium') { window.location.href = '/pricing?upgrade=true'; return; }
      }

      setUser(session.user);
      await loadEntries(session.user.id);
      setLoading(false);
    };
    init();
  }, []);

  const loadEntries = async (userId: string) => {
    const { data } = await supabase
      .from('med_history')
      .select('*')
      .eq('user_id', userId)
      .order('start_date', { ascending: false });
    if (data) setEntries(data);
  };

  const handlePhotoAdd = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoLoading(true);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const res = await fetch('/api/identify-medication', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64 })
      });
      const data = await res.json();
      if (data.found) {
        setForm(prev => ({ ...prev, drug_name: data.name, start_date: new Date().toISOString().split('T')[0] }));
        setShowAddForm(true);
      } else {
        alert(data.message || 'Could not identify medication. Please add manually.');
      }
    } catch {
      alert('Something went wrong. Please try again.');
    }
    setPhotoLoading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = async () => {
    if (!form.drug_name.trim()) { alert('Please enter a medication name'); return; }
    setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { error } = await supabase.from('med_history').insert({
      user_id: session.user.id,
      drug_name: form.drug_name,
      strength: form.strength,
      dose: form.dose,
      frequency: form.frequency,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      notes: form.notes,
      added_by: 'manual'
    });
    if (!error) {
      await loadEntries(session.user.id);
      setForm({ drug_name: '', strength: '', dose: '', frequency: '', start_date: '', end_date: '', notes: '' });
      setShowAddForm(false);
    } else {
      alert('Could not save. Please try again.');
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this medication from your history?')) return;
    setDeletingId(id);
    await supabase.from('med_history').delete().eq('id', id);
    setEntries(prev => prev.filter(e => e.id !== id));
    setDeletingId(null);
  };

  const isActive = (entry: MedEntry) => !entry.end_date || new Date(entry.end_date) >= new Date();

  const active = entries.filter(isActive);
  const past = entries.filter(e => !isActive(e));

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 40, height: 40, border: '3px solid var(--brand-light)', borderTopColor: 'var(--brand)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
    </div>
  );

  return (
    <main style={{ minHeight: '100vh', background: 'var(--background)' }}>
      <nav style={{ background: 'white', borderBottom: '1px solid var(--border)', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, background: 'var(--brand)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Pill size={20} color="white" />
          </div>
          <span style={{ fontWeight: 700, fontSize: 20 }}>AskMedily</span>
        </div>
        <span style={{ fontSize: 13, color: 'var(--muted)' }}>{user?.email}</span>
      </nav>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 24px' }}>
        <a href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--muted)', textDecoration: 'none', fontSize: 14, marginBottom: 24 }}>
          <ArrowLeft size={16} /> Back to dashboard
        </a>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>My Med History</h1>
            <p style={{ color: 'var(--muted)', fontSize: 14 }}>Your personal medication record — private and secure.</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={handlePhotoAdd} disabled={photoLoading} style={{
              display: 'flex', alignItems: 'center', gap: 7, background: 'white',
              border: '1px solid var(--border)', borderRadius: 10, padding: '10px 16px',
              fontSize: 14, fontWeight: 600, cursor: 'pointer', color: 'var(--foreground)',
              opacity: photoLoading ? 0.7 : 1
            }}>
              {photoLoading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Camera size={16} color="var(--brand)" />}
              {photoLoading ? 'Scanning...' : 'Add by Photo'}
            </button>
            <button onClick={() => setShowAddForm(true)} style={{
              display: 'flex', alignItems: 'center', gap: 7, background: 'var(--brand)',
              border: 'none', borderRadius: 10, padding: '10px 16px',
              fontSize: 14, fontWeight: 600, cursor: 'pointer', color: 'white'
            }}>
              <Plus size={16} /> Add Manually
            </button>
          </div>
        </div>

        <input ref={fileInputRef} type="file" accept="image/*" capture="environment"
          onChange={handlePhotoSelected} style={{ display: 'none' }} />

        {/* Add Form */}
        {showAddForm && (
          <div style={{ background: 'white', borderRadius: 16, padding: 24, marginBottom: 24, border: '1px solid var(--border)', boxShadow: '0 4px 24px rgba(0,87,255,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700 }}>Add medication</h2>
              <button onClick={() => setShowAddForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Medication name *</label>
                <input value={form.drug_name} onChange={e => setForm(p => ({ ...p, drug_name: e.target.value }))}
                  placeholder="e.g. Metformin"
                  style={{ width: '100%', padding: '11px 14px', border: '1px solid var(--border)', borderRadius: 10, fontSize: 15, outline: 'none', background: 'var(--background)', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Strength</label>
                <input value={form.strength} onChange={e => setForm(p => ({ ...p, strength: e.target.value }))}
                  placeholder="e.g. 500mg"
                  style={{ width: '100%', padding: '11px 14px', border: '1px solid var(--border)', borderRadius: 10, fontSize: 15, outline: 'none', background: 'var(--background)', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Dose</label>
                <input value={form.dose} onChange={e => setForm(p => ({ ...p, dose: e.target.value }))}
                  placeholder="e.g. 1 tablet"
                  style={{ width: '100%', padding: '11px 14px', border: '1px solid var(--border)', borderRadius: 10, fontSize: 15, outline: 'none', background: 'var(--background)', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Frequency</label>
                <input value={form.frequency} onChange={e => setForm(p => ({ ...p, frequency: e.target.value }))}
                  placeholder="e.g. Twice daily"
                  style={{ width: '100%', padding: '11px 14px', border: '1px solid var(--border)', borderRadius: 10, fontSize: 15, outline: 'none', background: 'var(--background)', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Start date</label>
                <input type="date" value={form.start_date} onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))}
                  style={{ width: '100%', padding: '11px 14px', border: '1px solid var(--border)', borderRadius: 10, fontSize: 15, outline: 'none', background: 'var(--background)', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>End date <span style={{ fontWeight: 400, color: 'var(--muted)' }}>(leave blank if current)</span></label>
                <input type="date" value={form.end_date} onChange={e => setForm(p => ({ ...p, end_date: e.target.value }))}
                  style={{ width: '100%', padding: '11px 14px', border: '1px solid var(--border)', borderRadius: 10, fontSize: 15, outline: 'none', background: 'var(--background)', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Notes <span style={{ fontWeight: 400, color: 'var(--muted)' }}>(optional)</span></label>
                <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                  placeholder="e.g. Prescribed by Dr Smith for Type 2 Diabetes"
                  rows={2}
                  style={{ width: '100%', padding: '11px 14px', border: '1px solid var(--border)', borderRadius: 10, fontSize: 14, outline: 'none', background: 'var(--background)', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit' }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 16, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowAddForm(false)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 20px', fontSize: 14, cursor: 'pointer', color: 'var(--muted)' }}>
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving} style={{
                background: 'var(--brand)', color: 'white', border: 'none', borderRadius: 10,
                padding: '10px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8, opacity: saving ? 0.7 : 1
              }}>
                {saving ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Saving...</> : <><Check size={14} /> Save medication</>}
              </button>
            </div>
          </div>
        )}

        {/* Empty state */}
        {entries.length === 0 && !showAddForm && (
          <div style={{ background: 'white', borderRadius: 16, padding: 48, border: '1px solid var(--border)', textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, background: 'var(--brand-light)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Pill size={30} color="var(--brand)" />
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>No medications yet</h2>
            <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 24, maxWidth: 360, margin: '0 auto 24px' }}>
              Start building your personal medication record. Add medications manually or take a photo of your prescription.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={handlePhotoAdd} style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'white', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 16px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                <Camera size={16} color="var(--brand)" /> Add by Photo
              </button>
              <button onClick={() => setShowAddForm(true)} style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'var(--brand)', border: 'none', borderRadius: 10, padding: '10px 16px', fontSize: 14, fontWeight: 600, cursor: 'pointer', color: 'white' }}>
                <Plus size={16} /> Add Manually
              </button>
            </div>
          </div>
        )}

        {/* Active medications */}
        {active.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Current medications ({active.length})
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {active.map(entry => (
                <MedCard key={entry.id} entry={entry} onDelete={handleDelete} deletingId={deletingId} isActive />
              ))}
            </div>
          </div>
        )}

        {/* Past medications */}
        {past.length > 0 && (
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Past medications ({past.length})
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {past.map(entry => (
                <MedCard key={entry.id} entry={entry} onDelete={handleDelete} deletingId={deletingId} isActive={false} />
              ))}
            </div>
          </div>
        )}

        <p style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center', marginTop: 32, lineHeight: 1.6 }}>
          This is your personal record only. It is not a medical record and should not replace advice from your doctor or pharmacist.
        </p>
      </div>
    </main>
  );
}

function MedCard({ entry, onDelete, deletingId, isActive }: { entry: MedEntry; onDelete: (id: string) => void; deletingId: string | null; isActive: boolean }) {
  return (
    <div style={{ background: 'white', borderRadius: 14, padding: 20, border: `1px solid ${isActive ? 'var(--border)' : '#EEF2F8'}`, opacity: isActive ? 1 : 0.75 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flex: 1 }}>
          <div style={{ width: 40, height: 40, background: isActive ? 'var(--brand-light)' : 'var(--background)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Pill size={18} color={isActive ? 'var(--brand)' : 'var(--muted)'} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700 }}>{entry.drug_name}</h3>
              {entry.strength && <span style={{ fontSize: 12, color: 'var(--muted)', background: 'var(--background)', padding: '2px 8px', borderRadius: 10 }}>{entry.strength}</span>}
              {isActive && <span style={{ fontSize: 11, color: '#00875A', background: '#E8FBF5', padding: '2px 8px', borderRadius: 10, fontWeight: 600 }}>Current</span>}
            </div>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {entry.dose && <span style={{ fontSize: 13, color: 'var(--muted)' }}>Dose: {entry.dose}</span>}
              {entry.frequency && <span style={{ fontSize: 13, color: 'var(--muted)' }}>Frequency: {entry.frequency}</span>}
            </div>
            {(entry.start_date || entry.end_date) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                <Calendar size={12} color="var(--muted)" />
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                  {entry.start_date ? new Date(entry.start_date).toLocaleDateString('en-GB') : '?'}
                  {entry.end_date ? ` → ${new Date(entry.end_date).toLocaleDateString('en-GB')}` : ' → present'}
                </span>
              </div>
            )}
            {entry.notes && <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 6, fontStyle: 'italic' }}>{entry.notes}</p>}
          </div>
        </div>
        <button onClick={() => onDelete(entry.id)} disabled={deletingId === entry.id} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 4, flexShrink: 0 }}>
          {deletingId === entry.id ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Trash2 size={16} />}
        </button>
      </div>
    </div>
  );
}
