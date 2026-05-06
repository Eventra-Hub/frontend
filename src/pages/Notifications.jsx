import { useEffect, useState } from 'react';
import { api } from '../api.js';

const META = {
  'user.registered':       { icon: '👤', color: '#06b6d4', label: 'Account created' },
  'event.created':         { icon: '📅', color: '#4f46e5', label: 'New event' },
  'event.updated':         { icon: '✏️', color: '#d97706', label: 'Event updated' },
  'event.cancelled':       { icon: '❌', color: '#dc2626', label: 'Event cancelled' },
  'registration.created':  { icon: '🎟️', color: '#16a34a', label: 'Booking confirmed' },
  'registration.cancelled':{ icon: '🚫', color: '#9333ea', label: 'Booking cancelled' },
};

const fmt = (s) => { try { return new Date(s).toLocaleString(); } catch { return s; } };

const summarize = (n) => {
  const p = n.payload || n.body || {};
  const k = n.routing_key || n.type;
  if (k === 'registration.created') return `Booking confirmed for event ${p.event_id || ''}`;
  if (k === 'registration.cancelled') return `Booking cancelled for event ${p.event_id || ''}`;
  if (k === 'event.created') return p.title ? `${p.title} was just announced` : 'A new event was published';
  if (k === 'event.cancelled') return `Event ${p.event_id || ''} was cancelled`;
  if (k === 'user.registered') return `Welcome ${p.email || ''}`;
  return JSON.stringify(p);
};

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    api.notifications()
      .then((d) => setItems(Array.isArray(d) ? d : d?.items || []))
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    load();
    const t = setInterval(load, 10000);
    return () => clearInterval(t);
  }, []);

  if (loading) return <div className="spinner" />;

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Notifications</h1>
          <div className="sub">Live feed from the platform · refreshes every 10s</div>
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
            const k = n.routing_key || n.type || 'event';
            const meta = META[k] || { icon: '•', color: '#6b7280', label: k };
            return (
              <div className="notification-row" key={n.id || n._id || i}>
                <div className="dot" style={{ background: meta.color }}>{meta.icon}</div>
                <div className="body">
                  <div className="title">{meta.label}</div>
                  <div className="desc">{summarize(n)}</div>
                </div>
                <div className="when">{fmt(n.created_at || n.timestamp)}</div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
