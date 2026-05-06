import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';

export default function Profile() {
  const { auth } = useAuth();
  const [profile, setProfile] = useState(null);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.getMyProfile(auth.token)
      .catch(() => api.getProfile(auth.id, auth.token))
      .then(setProfile)
      .catch((e) => setErr(e.message));
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setBusy(true); setErr(''); setMsg('');
    try {
      const updated = await api.updateProfile(profile.id || profile._id || auth.id,
        { name: profile.name, bio: profile.bio, avatar_url: profile.avatar_url }, auth.token);
      setProfile(updated);
      setMsg('Profile saved.');
    } catch (ex) { setErr(ex.message); }
    finally { setBusy(false); }
  };

  if (err && !profile) return <div className="error">{err}</div>;
  if (!profile) return <div className="spinner" />;

  const set = (k) => (e) => setProfile({ ...profile, [k]: e.target.value });
  const initial = (profile.name?.[0] || profile.email?.[0] || 'U').toUpperCase();

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Profile</h1>
          <div className="sub">Manage your personal information</div>
        </div>
      </div>
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'linear-gradient(135deg, #4f46e5, #06b6d4)',
          display: 'grid', placeItems: 'center', color: '#fff', fontSize: '1.5rem', fontWeight: 600,
        }}>{initial}</div>
        <div>
          <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{profile.name || 'Unnamed user'}</div>
          <div className="muted">{profile.email}</div>
          {profile.role && <span className="badge muted" style={{ marginTop: 4 }}>{profile.role}</span>}
        </div>
      </div>
      <form className="card form" style={{ maxWidth: 520 }} onSubmit={save}>
        <label>Name<input value={profile.name || ''} onChange={set('name')} /></label>
        <label>Bio<textarea rows="3" value={profile.bio || ''} onChange={set('bio')} /></label>
        <label>Avatar URL<input value={profile.avatar_url || ''} onChange={set('avatar_url')} placeholder="https://…" /></label>
        {err && <div className="error">{err}</div>}
        {msg && <div className="notice">{msg}</div>}
        <button disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</button>
      </form>
    </>
  );
}
