import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('attendee');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const { loginWithToken } = useAuth();
  const nav = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr(''); setBusy(true);
    try {
      const res = await api.signup({ email, password, name, role });
      const token = res.access_token || res.token;
      if (!token) throw new Error('No token in response');
      await loginWithToken(token);
      nav('/events', { replace: true });
    } catch (ex) { setErr(ex.message); }
    finally { setBusy(false); }
  };

  return (
    <div className="auth-wrap">
      <form className="card auth-card form" onSubmit={onSubmit}>
        <h1>Create your account</h1>
        <p className="hint">Choose your role to get started.</p>

        <label>Name<input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" required /></label>
        <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
        <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} /></label>

        <fieldset className="form" style={{ border: 0, padding: 0, margin: 0 }}>
          <legend style={{ fontWeight: 600, marginBottom: '0.5rem' }}>I want to…</legend>
          <div className="row" style={{ gap: '0.75rem' }}>
            <label className={`chip ${role === 'attendee' ? 'active' : ''}`} style={{ cursor: 'pointer' }}>
              <input type="radio" name="role" value="attendee" checked={role === 'attendee'}
                onChange={() => setRole('attendee')} style={{ marginRight: 6 }} />
              Attend events
            </label>
            <label className={`chip ${role === 'organizer' ? 'active' : ''}`} style={{ cursor: 'pointer' }}>
              <input type="radio" name="role" value="organizer" checked={role === 'organizer'}
                onChange={() => setRole('organizer')} style={{ marginRight: 6 }} />
              Organize events
            </label>
          </div>
          <p className="muted" style={{ marginTop: '0.5rem' }}>
            {role === 'organizer'
              ? 'Organizers can create and manage events.'
              : 'Attendees can browse events and book tickets.'}
          </p>
        </fieldset>

        {err && <div className="error">{err}</div>}
        <button className="btn-block" disabled={busy}>{busy ? 'Creating…' : 'Create account'}</button>
        <p className="muted" style={{ textAlign: 'center', marginTop: '1rem' }}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  );
}
