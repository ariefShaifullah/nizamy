import React, { useState } from 'react';
import { apiCall, setToken } from '../lib/api';
import { useTheme } from '../lib/ThemeContext';

export default function LoginPage({ onLogin }: { onLogin: () => void }) {
  const { theme } = useTheme();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const data = await apiCall('/auth.php', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      if (data.token) { setToken(data.token); onLogin(); }
      else setError(data.error || 'Login gagal');
    } catch { setError('Koneksi gagal'); }
    setLoading(false);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.75rem 1rem',
    background: 'var(--admin-input-bg)', border: '1px solid var(--admin-border)',
    borderRadius: '0.5rem', fontSize: '0.875rem', color: 'var(--admin-input-text)',
    outline: 'none', transition: 'border-color 0.2s',
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 transition-colors duration-300" style={{ background: 'var(--admin-bg)' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-1" style={{ color: 'var(--admin-accent)' }}>NIZAMY</h1>
          <p className="text-xs uppercase tracking-[0.2em]" style={{ color: 'var(--admin-text-secondary)' }}>Dashboard Admin</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} style={inputStyle} />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} />
          {error && <p className="text-xs text-center" style={{ color: 'var(--admin-danger)' }}>{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-3 text-xs uppercase tracking-[0.2em] font-semibold rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
            style={{ background: 'var(--admin-accent)', color: '#ffffff' }}>
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>
      </div>
    </div>
  );
}
