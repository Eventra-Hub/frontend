import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';

const META = {
  BOOKING_CONFIRMED: { icon: '🎟️', color: '#16a34a', label: 'Booking confirmed' },
  BOOKING_CANCELLED: { icon: '🚫', color: '#9333ea', label: 'Booking cancelled' },
  EVENT_REMINDER:    { icon: '⏰', color: '#d97706', label: 'Event reminder' },
};

const fmt = (ts) => {
  if (!ts) return '';
  const ms = typeof ts === 'number' ? (ts < 1e12 ? ts * 1000 : ts) : Date.parse(ts);
  try { return new Date(ms).toLocaleString(); } catch { return String(ts); }
};

export default function Notifications() {
  const { auth } = useAuth();
  const [items, setItems] = useState([]);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    if (!auth?.id) return;
    api.notifications(auth.id)
      .then((d) => setItems(Array.isArray(d) ? d : d?.items || []))
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    load();
    const t = setInterval(load, 10000);
    return () => clearInterval(t);
  }, [auth?.id]);

  if (loading) return <div className="spinner" />;

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Notifications</h1>
          <div className="sub">Live feed · refreshes every 10s</div>
        </div>
        <button className="ghost" onClick={load}>Refresh</button>
      </div>
      {err && <div className="error">{err}</div>}
      {!items.length ? (
        <div className="empty">
          <div className="icon">🔔</div>
          <p>No notifications yet.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          {items.map((n, i) => {
            const k = n.notification_type || 'EVENT_REMINDER';
            const meta = META[k] || { icon: '•', color: '#6b7280', label: k };
            return (
              <div className="notification-row" key={n.notification_id || i}>
                <div className="dot" style={{ background: meta.color }}>{meta.icon}</div>
                <div className="body">
                  <div className="title">{meta.label}</div>
                  <div className="desc">{n.message}</div>
                </div>
                <div className="when">{fmt(n.timestamp)}</div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
