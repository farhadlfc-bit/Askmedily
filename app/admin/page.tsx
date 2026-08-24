'use client';
import { useState } from 'react';
import { Users, TrendingUp, Search, Shield, LogOut, RefreshCw, Edit2, Check, X, Trash2 } from 'lucide-react';

const ADMIN_PASSWORD = '079212055ZahrA';
const ADMIN_API_KEY = 'askmedily-admin-2026';

interface UserProfile {
  id: string;
  email: string;
  plan: string;
  trial_ends_at: string;
  created_at: string;
  subscription_id: string;
}

export default function AdminDashboard() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editPlan, setEditPlan] = useState('');
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({ total: 0, trial: 0, basic: 0, premium: 0, expired: 0 });

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      loadUsers();
    } else {
      setPasswordError('Incorrect password');
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        headers: { 'x-admin-key': ADMIN_API_KEY }
      });
      const data = await res.json();
      if (data.users) {
        setUsers(data.users);
        calculateStats(data.users);
      }
    } catch {}
    setLoading(false);
  };

  const calculateStats = (userList: UserProfile[]) => {
    const now = new Date();
    setStats({
      total: userList.length,
      trial: userList.filter(u => !u.plan || u.plan === 'trial' || (u.trial_ends_at && new Date(u.trial_ends_at) > now && u.plan !== 'basic' && u.plan !== 'premium')).length,
      basic: userList.filter(u => u.plan === 'basic').length,
      premium: userList.filter(u => u.plan === 'premium').length,
      expired: userList.filter(u => u.trial_ends_at && new Date(u.trial_ends_at) < now && u.plan !== 'basic' && u.plan !== 'premium').length,
    });
  };

  const updateUserPlan = async (userId: string, plan: string) => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/update-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': ADMIN_API_KEY },
        body: JSON.stringify({ userId, plan })
      });
      const data = await res.json();
      if (data.success) {
        const updated = users.map(u => u.id === userId ? { ...u, plan } : u);
        setUsers(updated);
        calculateStats(updated);
      }
    } catch {}
    setSaving(false);
    setEditingUser(null);
  };

  const deleteUser = async (userId: string, email: string) => {
    if (!confirm(`Delete user ${email}? This cannot be undone.`)) return;
    try {
      const res = await fetch('/api/admin/delete-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': ADMIN_API_KEY },
        body: JSON.stringify({ userId })
      });
      const data = await res.json();
      if (data.success) {
        const updated = users.filter(u => u.id !== userId);
        setUsers(updated);
        calculateStats(updated);
      } else { alert('Could not delete user.'); }
    } catch { alert('Something went wrong.'); }
  };

  const filteredUsers = users.filter(u =>
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.plan?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPlanBadge = (user: UserProfile) => {
    const now = new Date();
    if (user.plan === 'premium') return { label: 'Premium', color: '#7C3AED', bg: '#F3F0FF' };
    if (user.plan === 'basic') return { label: 'Basic', color: '#0057FF', bg: '#EBF1FF' };
    if (user.trial_ends_at && new Date(user.trial_ends_at) > now) return { label: 'Trial', color: '#00875A', bg: '#E8FBF5' };
    return { label: 'Expired', color: '#FF4444', bg: '#FFF0F0' };
  };

  const monthlyRevenue = (stats.basic * 4.99 + stats.premium * 9.99).toFixed(2);

  if (!authenticated) {
    return (
      <main style={{ minHeight: '100vh', background: 'var(--background)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ width: 52, height: 52, background: 'var(--brand)', borderRadius: 14, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <Shield size={26} color="white" />
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800 }}>Admin Access</h1>
            <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 4 }}>AskMedily Admin Dashboard</p>
          </div>
          <div style={{ background: 'white', borderRadius: 20, padding: 28, border: '1px solid var(--border)' }}>
            <input type="password" value={password}
              onChange={e => { setPassword(e.target.value); setPasswordError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="Admin password"
              style={{ width: '100%', padding: '12px 14px', border: '1px solid var(--border)', borderRadius: 10, fontSize: 15, outline: 'none', marginBottom: 12, boxSizing: 'border-box' }} />
            {passwordError && <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 12 }}>{passwordError}</p>}
            <button onClick={handleLogin} style={{ width: '100%', padding: '13px', background: 'var(--brand)', color: 'white', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
              Sign in
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--background)' }}>
      <nav style={{ background: 'white', borderBottom: '1px solid var(--border)', padding: '0px 32px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/icon.png" alt="AskMedily" style={{ height: 72, width: 72, borderRadius: 10 }} />
          <span style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1 }}>
            <span style={{ color: '#1a1a2e' }}>Ask</span><span style={{ color: '#0057FF' }}>Medily</span>
          </span>
        </a>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={loadUsers} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '7px 12px', cursor: 'pointer', fontSize: 13, color: 'var(--muted)' }}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={() => setAuthenticated(false)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '7px 12px', cursor: 'pointer', fontSize: 13, color: 'var(--muted)' }}>
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 28 }}>
          {[
            { label: 'Total Users', value: stats.total, color: 'var(--brand)', icon: <Users size={20} color="var(--brand)" /> },
            { label: 'Active Trial', value: stats.trial, color: '#00875A', icon: <TrendingUp size={20} color="#00875A" /> },
            { label: 'Basic', value: stats.basic, color: 'var(--brand)', icon: <Shield size={20} color="var(--brand)" /> },
            { label: 'Premium', value: stats.premium, color: '#7C3AED', icon: <Shield size={20} color="#7C3AED" /> },
            { label: 'Expired', value: stats.expired, color: '#FF4444', icon: <X size={20} color="#FF4444" /> },
            { label: 'Est. MRR', value: `£${monthlyRevenue}`, color: '#00875A', icon: <TrendingUp size={20} color="#00875A" /> },
          ].map((stat, i) => (
            <div key={i} style={{ background: 'white', borderRadius: 14, padding: 20, border: '1px solid var(--border)' }}>
              <div style={{ marginBottom: 10 }}>{stat.icon}</div>
              <p style={{ fontSize: 26, fontWeight: 800, color: stat.color, marginBottom: 4 }}>{stat.value}</p>
              <p style={{ fontSize: 13, color: 'var(--muted)' }}>{stat.label}</p>
            </div>
          ))}
        </div>

        <div style={{ background: 'white', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700 }}>Users ({filteredUsers.length})</h2>
            <div style={{ position: 'relative', flex: 1, maxWidth: 300 }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by email or plan..."
                style={{ width: '100%', padding: '8px 12px 8px 36px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, outline: 'none', background: 'var(--background)', boxSizing: 'border-box' }} />
            </div>
          </div>

          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>Loading users...</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--background)' }}>
                    {['Email', 'Plan', 'Trial Ends', 'Joined', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user, i) => {
                    const badge = getPlanBadge(user);
                    return (
                      <tr key={user.id} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'white' : 'var(--background)' }}>
                        <td style={{ padding: '12px 16px', fontSize: 14 }}>{user.email}</td>
                        <td style={{ padding: '12px 16px' }}>
                          {editingUser === user.id ? (
                            <select value={editPlan} onChange={e => setEditPlan(e.target.value)} style={{ padding: '4px 8px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 13 }}>
                              <option value="trial">Trial</option>
                              <option value="basic">Basic</option>
                              <option value="premium">Premium</option>
                              <option value="free">Free</option>
                            </select>
                          ) : (
                            <span style={{ background: badge.bg, color: badge.color, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{badge.label}</span>
                          )}
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--muted)' }}>
                          {user.trial_ends_at ? new Date(user.trial_ends_at).toLocaleDateString('en-GB') : '—'}
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--muted)' }}>
                          {user.created_at ? new Date(user.created_at).toLocaleDateString('en-GB') : '—'}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          {editingUser === user.id ? (
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button onClick={() => updateUserPlan(user.id, editPlan)} disabled={saving} style={{ background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Check size={12} /> Save
                              </button>
                              <button onClick={() => setEditingUser(null)} style={{ background: 'var(--background)', border: '1px solid var(--border)', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                                <X size={12} /> Cancel
                              </button>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button onClick={() => { setEditingUser(user.id); setEditPlan(user.plan || 'trial'); }} style={{ background: 'var(--background)', border: '1px solid var(--border)', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, color: 'var(--muted)' }}>
                                <Edit2 size={12} /> Edit
                              </button>
                              <button onClick={() => deleteUser(user.id, user.email)} style={{ background: '#FFF0F0', border: '1px solid #FFD4D4', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, color: 'var(--danger)' }}>
                                <Trash2 size={12} /> Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredUsers.length === 0 && (
                <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>No users found</div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
