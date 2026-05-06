import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const { login } = useAuth();
  const nav = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr(''); setBusy(true);
    try {
      const res = await api.signup({ email, password, name });
      const token = res.access_token || res.token;
      if (token) login(token);
      nav('/events');
    } catch (ex) { setErr(ex.message); }
    finally { setBusy(false); }
  };

  return (
    <div className="auth-wrap">
      <form className="card auth-card form" onSubmit={onSubmit}>
        <h1>Create your account</h1>
        <p className="hint">Join the platform to discover and host events.</p>
        <label>Name<input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" /></label>
        <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
        <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
        {err && <div className="error">{err}</div>}
        <button className="btn-block" disabled={busy}>{busy ? 'Creating…' : 'Create account'}</button>
        <p className="muted" style={{ textAlign: 'center', marginTop: '1rem' }}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  );
}
