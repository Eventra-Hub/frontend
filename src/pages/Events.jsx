import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';

const formatDate = (s) => {
  if (!s) return '';
  try { return new Date(s).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }); }
  catch { return s; }
};

const catClass = (cat = '') => {
  const map = { Conference: 'cat-1', Workshop: 'cat-2', Seminar: 'cat-3', Meetup: 'cat-4' };
  return map[cat] || '';
};

export default function Events() {
  const [events, setEvents] = useState([]);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('All');

  useEffect(() => {
    api.listEvents()
      .then((d) => setEvents(Array.isArray(d) ? d : d?.items || []))
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  }, []);

  const cats = useMemo(() => ['All', ...new Set(events.map((e) => e.category).filter(Boolean))], [events]);
  const filtered = useMemo(() => events.filter((e) => {
    if (cat !== 'All' && e.category !== cat) return false;
    if (q && !`${e.title} ${e.location} ${e.description}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [events, cat, q]);

  if (loading) return <div className="spinner" />;
  if (err) return <div className="error">{err}</div>;

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Discover events</h1>
          <div className="sub">{events.length} upcoming events on the platform</div>
        </div>
      </div>

      <div className="toolbar">
        <input type="search" placeholder="Search events…" value={q} onChange={(e) => setQ(e.target.value)} />
        {cats.map((c) => (
          <button key={c} className={`chip ${cat === c ? 'active' : ''}`} onClick={() => setCat(c)}>{c}</button>
        ))}
      </div>

      {!filtered.length ? (
        <div className="empty">
          <div className="icon">📅</div>
          <p>No events match your filters.</p>
        </div>
      ) : (
        <div className="grid">
          {filtered.map((e) => {
            const id = e.id || e._id;
            const seats = e.seats_left;
            return (
              <Link to={`/events/${id}`} key={id} style={{ color: 'inherit' }}>
                <div className="card event-card">
                  <div className={`cat-banner ${catClass(e.category)}`}>{e.category || 'Event'}</div>
                  <div className="title">{e.title}</div>
                  <div className="meta">
                    <span>📍 {e.location || 'TBA'}</span>
                    <span>🗓 {formatDate(e.starts_at)}</span>
                  </div>
                  <div style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
                    {seats === 0
                      ? <span className="badge danger">Sold out</span>
                      : seats !== undefined && seats <= 10
                        ? <span className="badge warn">Only {seats} left</span>
                        : <span className="badge success">{seats ?? '—'} seats left</span>}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
