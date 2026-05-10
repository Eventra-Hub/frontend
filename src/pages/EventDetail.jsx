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
  const [showPay, setShowPay] = useState(false);
  const [pay, setPay] = useState({ card_number: '', cvv: '', expiry_date: '' });

  const isOrganizer = auth?.role === 'organizer';
  const isOwner = ev && auth && String(ev.organizer_id) === String(auth.id);

  const load = () => api.getEvent(id).then(setEv).catch((e) => setErr(e.message));
  useEffect(() => { load(); }, [id]);

  const book = async (e) => {
    e.preventDefault();
    setBusy(true); setErr(''); setMsg('');
    try {
      await api.book({ event_id: id, ...pay }, auth.token);
      setMsg('Booking confirmed! Check My Bookings.');
      setShowPay(false);
      setPay({ card_number: '', cvv: '', expiry_date: '' });
      load();
    } catch (ex) { setErr(ex.message); }
    finally { setBusy(false); }
  };

  const remove = async () => {
    if (!confirm('Cancel this event? This cannot be undone.')) return;
    setBusy(true); setErr('');
    try {
      await api.deleteEvent(id, auth.token);
      nav('/events');
    } catch (ex) { setErr(ex.message); setBusy(false); }
  };

  if (err && !ev) return <div className="error">{err}</div>;
  if (!ev) return <div className="spinner" />;

  const fillPct = ev.capacity ? Math.round(((ev.capacity - ev.seats_left) / ev.capacity) * 100) : 0;
  const setPayField = (k) => (e) => setPay({ ...pay, [k]: e.target.value });

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
        {err && <div className="error">{err}</div>}
        {msg && <div className="notice">{msg}</div>}

        {!isOrganizer && (
          <>
            {!showPay ? (
              <div className="row" style={{ marginTop: '1rem' }}>
                <button onClick={() => setShowPay(true)} disabled={ev.seats_left === 0}>
                  {ev.seats_left === 0 ? 'Sold out' : 'Book ticket'}
                </button>
              </div>
            ) : (
              <form className="form" onSubmit={book} style={{ marginTop: '1rem' }}>
                <h3>Payment</h3>
                <label>Card number
                  <input value={pay.card_number} onChange={setPayField('card_number')}
                    pattern="\d{16}" maxLength={16} placeholder="16 digits" required />
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <label>CVV
                    <input value={pay.cvv} onChange={setPayField('cvv')}
                      pattern="\d{3}" maxLength={3} placeholder="123" required />
                  </label>
                  <label>Expiry
                    <input value={pay.expiry_date} onChange={setPayField('expiry_date')}
                      placeholder="MM/YY" required />
                  </label>
                </div>
                <div className="row">
                  <button disabled={busy}>{busy ? 'Processing…' : 'Pay & book'}</button>
                  <button type="button" className="ghost" onClick={() => setShowPay(false)}>Cancel</button>
                </div>
              </form>
            )}
          </>
        )}

        {isOrganizer && isOwner && (
          <div className="row" style={{ marginTop: '1rem' }}>
            <button className="danger" onClick={remove} disabled={busy}>
              {busy ? 'Cancelling…' : 'Cancel event'}
            </button>
          </div>
        )}
        {isOrganizer && !isOwner && (
          <p className="muted" style={{ marginTop: '1rem' }}>You can only manage events you created.</p>
        )}
      </div>
    </>
  );
}
