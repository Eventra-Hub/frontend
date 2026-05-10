import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const { loginWithToken } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const dest = loc.state?.from || '/events';

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr(''); setBusy(true);
    try {
      const res = await api.login({ email, password });
      const token = res.access_token || res.token;
      if (!token) throw new Error('No token in response');
      await loginWithToken(token);
      nav(dest, { replace: true });
    } catch (ex) { setErr(ex.message); }
    finally { setBusy(false); }
  };

  return (
    <div className="auth-wrap">
      <form className="card auth-card form" onSubmit={onSubmit}>
        <h1>Welcome back</h1>
        <p className="hint">Sign in to manage events and bookings.</p>
        <label>Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        {err && <div className="error">{err}</div>}
        <button className="btn-block" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
        <p className="muted" style={{ textAlign: 'center', marginTop: '1rem' }}>
          New here? <Link to="/signup">Create an account</Link>
        </p>
      </form>
    </div>
  );
}
