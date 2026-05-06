import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';

const fmt = (s) => { try { return new Date(s).toLocaleString(); } catch { return s; } };

export default function EventDetail() {
  const { id } = useParams();
  const { auth } = useAuth();
  const nav = useNavigate();
  const [ev, setEv] = useState(null);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () => api.getEvent(id).then(setEv).catch((e) => setErr(e.message));
  useEffect(() => { load(); }, [id]);

  const book = async () => {
    if (!auth) return nav('/login');
    setBusy(true); setErr(''); setMsg('');
    try {
      await api.book(id, auth.token);
      setMsg('Booking confirmed! Check My Bookings.');
      load();
    } catch (e) { setErr(e.message); }
    finally { setBusy(false); }
  };

  if (err) return <div className="error">{err}</div>;
  if (!ev) return <div className="spinner" />;

  const fillPct = ev.capacity ? Math.round(((ev.capacity - ev.seats_left) / ev.capacity) * 100) : 0;

  return (
    <>
      <p><Link to="/events">← Back to events</Link></p>
      <div className="detail-hero">
        <div className="badge info" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', marginBottom: '0.75rem' }}>
          {ev.category || 'Event'}
        </div>
        <h1>{ev.title}</h1>
        <div className="meta">📍 {ev.location} · 🗓 {fmt(ev.starts_at)} → {fmt(ev.ends_at)}</div>
      </div>

      <div className="stat-grid">
        <div className="stat"><div className="label">Capacity</div><div className="value">{ev.capacity ?? '—'}</div></div>
        <div className="stat"><div className="label">Seats left</div><div className="value">{ev.seats_left ?? '—'}</div></div>
        <div className="stat"><div className="label">Filled</div><div className="value">{fillPct}%</div></div>
      </div>

      <div className="card">
        <h2>About this event</h2>
        <p style={{ color: '#374151', lineHeight: 1.6 }}>{ev.description || 'No description provided.'}</p>
        {msg && <div className="notice">{msg}</div>}
        <div className="row" style={{ marginTop: '1rem' }}>
          <button onClick={book} disabled={busy || ev.seats_left === 0}>
            {ev.seats_left === 0 ? 'Sold out' : busy ? 'Booking…' : 'Book ticket'}
          </button>
          {!auth && <span className="muted">You'll be asked to sign in.</span>}
        </div>
      </div>
    </>
  );
}
